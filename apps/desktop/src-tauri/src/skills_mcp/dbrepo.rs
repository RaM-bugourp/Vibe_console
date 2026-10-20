use crate::error::{CodexxError, Result};
use crate::file_io::ensure_directory;
use crate::paths::{app_home, normalized_path_scope};
use crate::{now_rfc3339, open_db};
use rusqlite::params;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Deserialize)]
struct Manifest {
    #[serde(default)]
    items: Vec<ManifestItem>,
    #[serde(default)]
    entries: Vec<ManifestItem>,
    #[serde(default)]
    batch: Option<String>,
}
#[derive(Debug, Clone, Deserialize)]
struct ManifestItem {
    source: String,
    #[serde(default)] target: Option<String>,
    #[serde(default)] path: Option<String>,
    #[serde(default)] kind: Option<String>,
    #[serde(default)] status: Option<String>,
    #[serde(default)] sha256: Option<String>,
}
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DbRepoAudit { pub id: i64, pub source: String, pub target: String, pub status: String, pub reason: Option<String>, pub sha256: Option<String>, pub batch: String, pub created_at: String }
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DbRepoResult { pub batch: String, pub records: Vec<DbRepoAudit>, pub imported: usize }

fn manifest_path(path: Option<String>) -> Result<PathBuf> {
    if let Some(p) = path { if !p.trim().is_empty() { return Ok(PathBuf::from(p)); } }
    Ok(app_home()?.join("data").join("imports").join("manifest.json"))
}
fn load_manifest(path: &Path) -> Result<Manifest> {
    let text = fs::read_to_string(path).map_err(|e| CodexxError::Io { path: path.display().to_string(), source: e })?;
    serde_json::from_str(&text).map_err(|e| CodexxError::Json { path: path.display().to_string(), source: e })
}
fn safe_target(base: &Path, target: &str) -> Result<PathBuf> {
    let rel = Path::new(target);
    if rel.is_absolute() || target.contains('\0') || rel.components().any(|c| matches!(c, std::path::Component::ParentDir | std::path::Component::RootDir | std::path::Component::Prefix(_))) {
        return Err(CodexxError::Config("拒绝危险或路径逃逸目标".into()));
    }
    Ok(base.join(rel))
}
fn hash_file(path: &Path) -> Result<String> {
    let bytes = fs::read(path).map_err(|e| CodexxError::Io { path: path.display().to_string(), source: e })?;
    Ok(format!("{:x}", Sha256::digest(bytes)))
}
fn audit(conn: &rusqlite::Connection, source: &str, target: &str, status: &str, reason: Option<&str>, sha: Option<&str>, batch: &str) -> Result<DbRepoAudit> {
    let created = now_rfc3339();
    conn.execute("INSERT INTO app_import_audit (source,target,status,reason,sha256,batch,created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)", params![source,target,status,reason,sha,batch,&created]).map_err(|e| CodexxError::Database(e.to_string()))?;
    Ok(DbRepoAudit { id: conn.last_insert_rowid(), source: source.into(), target: target.into(), status: status.into(), reason: reason.map(str::to_string), sha256: sha.map(str::to_string), batch: batch.into(), created_at: created })
}
pub(crate) fn dbrepo_preview_inner(manifest: Option<String>, config_dir: Option<String>) -> Result<DbRepoResult> { process(manifest, config_dir, false) }
pub(crate) fn dbrepo_import_inner(manifest: Option<String>, config_dir: Option<String>) -> Result<DbRepoResult> { process(manifest, config_dir, true) }
fn process(manifest: Option<String>, config_dir: Option<String>, do_import: bool) -> Result<DbRepoResult> {
    let mp = manifest_path(manifest)?; let m = load_manifest(&mp)?;
    let items = if m.items.is_empty() { m.entries } else { m.items };
    let batch = m.batch.unwrap_or_else(|| format!("{}-{}", now_rfc3339(), std::process::id()));
    let codex = config_dir.map(PathBuf::from).unwrap_or(crate::resolve_codex_dir(None)?);
    let skills = codex.join("skills"); ensure_directory(&skills)?;
    let staged_base = mp.parent().unwrap_or(Path::new("."));
    let conn = open_db()?; let mut records = Vec::new(); let mut imported = 0;
    for item in items {
        let source_path = PathBuf::from(&item.source);
        let source = if source_path.is_absolute() { source_path } else { staged_base.join(source_path) };
        let source_scope = normalized_path_scope(&source);
        let staged_scope = normalized_path_scope(staged_base);
        let source_allowed = source_scope == staged_scope || source_scope.starts_with(&(staged_scope.clone() + "/")) || source_scope.starts_with(&(staged_scope + "\\\\"));
        let target_name = item.target.or(item.path).unwrap_or_else(|| source.file_name().unwrap_or_default().to_string_lossy().to_string());
        if !source_allowed {
            records.push(audit(&conn,&item.source,&target_name,"rejected",Some("source path escapes staged import directory"),item.sha256.as_deref(),&batch)?);
            continue;
        }
        if !matches!(item.kind.as_deref().unwrap_or("skill"), "skill" | "prompt") {
            records.push(audit(&conn,&item.source,&target_name,"rejected",Some("only skill or prompt imports are allowed"),item.sha256.as_deref(),&batch)?);
            continue;
        }
        let target = match safe_target(&skills, &target_name) { Ok(v) => v, Err(e) => { records.push(audit(&conn,&item.source,&target_name,"rejected",Some(&e.to_string()),item.sha256.as_deref(),&batch)?); continue; } };
        if item.status.as_deref() != Some("approved") { records.push(audit(&conn,&item.source,&target.display().to_string(),"skipped",Some("manifest status is not approved"),item.sha256.as_deref(),&batch)?); continue; }
        if !source.is_file() && !source.is_dir() { records.push(audit(&conn,&item.source,&target.display().to_string(),"rejected",Some("source does not exist"),None,&batch)?); continue; }
        let sha = if source.is_file() { Some(hash_file(&source)?) } else { None };
        if let Some(expected) = item.sha256.as_deref() { if sha.as_deref() != Some(expected) { records.push(audit(&conn,&item.source,&target.display().to_string(),"rejected",Some("sha256 mismatch"),sha.as_deref(),&batch)?); continue; } }
        if target.exists() { records.push(audit(&conn,&item.source,&target.display().to_string(),"skipped",Some("target already exists; user data preserved"),sha.as_deref(),&batch)?); continue; }
        if !do_import { records.push(audit(&conn,&item.source,&target.display().to_string(),"approved",Some(item.kind.as_deref().unwrap_or("skill")),sha.as_deref(),&batch)?); continue; }
        if source.is_dir() { crate::skills_mcp::copy_dir_recursive(&source, &target)?; } else { if let Some(p)=target.parent(){ensure_directory(p)?;} fs::copy(&source,&target).map_err(|e| CodexxError::Io{path:target.display().to_string(),source:e})?; }
        imported += 1; records.push(audit(&conn,&item.source,&target.display().to_string(),"imported",None,sha.as_deref(),&batch)?);
    }
    Ok(DbRepoResult { batch, records, imported })
}
pub(crate) fn dbrepo_list_audit_inner(batch: Option<String>) -> Result<Vec<DbRepoAudit>> {
    let conn = open_db()?; let mut stmt = conn.prepare("SELECT id,source,target,status,reason,sha256,batch,created_at FROM app_import_audit WHERE (?1 IS NULL OR batch=?1) ORDER BY id DESC").map_err(|e| CodexxError::Database(e.to_string()))?;
    let rows = stmt.query_map([batch], |r| Ok(DbRepoAudit{id:r.get(0)?,source:r.get(1)?,target:r.get(2)?,status:r.get(3)?,reason:r.get(4)?,sha256:r.get(5)?,batch:r.get(6)?,created_at:r.get(7)?})).map_err(|e| CodexxError::Database(e.to_string()))?;
    rows.map(|r| r.map_err(|e| CodexxError::Database(e.to_string()))).collect()
}

#[cfg(test)]
mod tests { use super::*; #[test] fn rejects_escape_targets() { assert!(safe_target(Path::new("/tmp/skills"), "../x").is_err()); assert!(safe_target(Path::new("/tmp/skills"), "/abs").is_err()); } }
