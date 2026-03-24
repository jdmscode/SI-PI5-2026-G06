import { AlertTriangle } from "lucide-react";

export function ApiConfigHint() {
  return (
    <div
      role="status"
      className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground flex gap-3 items-start"
    >
      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <p>
        O cliente HTTP requer <code className="text-xs bg-muted px-1 py-0.5 rounded">VITE_API_BASE_URL</code> no{" "}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> (URL base da API, sem barra final).
        Alterações em variáveis <code className="text-xs bg-muted px-1 py-0.5 rounded">VITE_*</code> exigem reinício do
        servidor de desenvolvimento.
      </p>
    </div>
  );
}
