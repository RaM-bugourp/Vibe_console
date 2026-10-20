import { useState } from "react";
import { ClipboardCheck, Download, Eye, Loader2 } from "lucide-react";
import { Button, StatusBadge } from "./ui";
import type { DbrepoManifestState, Lang } from "../types";

export type DbrepoManifestPanelProps = {
  lang: Lang;
  state: DbrepoManifestState | null;
  busy?: string;
  onPreview: () => void | Promise<void>;
  onImport: () => void | Promise<void>;
  onAudit: () => void | Promise<void>;
};

export function DbrepoManifestPanel({ lang, state, busy = "", onPreview, onImport, onAudit }: DbrepoManifestPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const zh = lang === "zh";
  const text = state?.preview || (state?.manifest ? JSON.stringify(state.manifest, null, 2) : "");
  const auditStatus = state?.audit?.status || (state?.audit ? "ok" : "-" );
  return (
    <section className="cx-tool-card" aria-label="DBrepo manifest">
      <div className="cx-tool-card__header">
        <div>
          <div className="cx-tool-eyebrow">DBREPO MANIFEST</div>
          <h3>{zh ? "DBrepo 清单" : "DBrepo manifest"}</h3>
          <p>{zh ? "预览、导入并审计本地 DBrepo manifest。" : "Preview, import, and audit the local DBrepo manifest."}</p>
        </div>
        <StatusBadge tone={state ? (auditStatus === "error" ? "danger" : "success") : "neutral"}>{state ? auditStatus : (zh ? "未读取" : "Not loaded")}</StatusBadge>
      </div>
      <div className="cx-tool-actions">
        <Button size="sm" variant="secondary" icon={busy === "preview" ? <Loader2 className="cx-skills-spin" /> : <Eye size={15} />} disabled={!!busy} onClick={onPreview}>{zh ? "预览" : "Preview"}</Button>
        <Button size="sm" variant="secondary" icon={busy === "import" ? <Loader2 className="cx-skills-spin" /> : <Download size={15} />} disabled={!!busy} onClick={onImport}>{zh ? "导入" : "Import"}</Button>
        <Button size="sm" variant="ghost" icon={busy === "audit" ? <Loader2 className="cx-skills-spin" /> : <ClipboardCheck size={15} />} disabled={!!busy} onClick={onAudit}>{zh ? "审计" : "Audit"}</Button>
      </div>
      {state && <>
        <div className="cx-tool-meta">{state.source || "DBrepo"}{state.imported ? ` · ${zh ? "已导入" : "Imported"}` : ""}</div>
        {state.audit?.message && <div className="cx-tool-meta">{state.audit.message}</div>}
        {state.warnings?.map((warning) => <div className="cx-tool-meta" key={warning}>{warning}</div>)}
        {text && <>
          <button type="button" className="cx-tool-link" onClick={() => setExpanded((value) => !value)}>{expanded ? (zh ? "收起清单" : "Hide manifest") : (zh ? "查看清单" : "Show manifest")}</button>
          {expanded && <pre className="cx-tool-code">{text}</pre>}
        </>}
      </>}
    </section>
  );
}
