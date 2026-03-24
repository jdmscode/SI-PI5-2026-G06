import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, Save, ArrowLeft, Cpu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ApiConfigHint } from "@/components/ApiConfigHint";
import { isApiConfigured } from "@/lib/api/config";
import { fetchAnalysis } from "@/lib/api/requests";
import { ApiError } from "@/lib/api/client";

const riskLabelFromPercent = (n: number): string => {
  if (n >= 70) return "Alto Risco";
  if (n >= 40) return "Atenção";
  return "Baixo Risco";
};

export default function AnalysisResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get("id")?.trim() || null;
  const apiOn = isApiConfigured();
  const [validatedItems, setValidatedItems] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["analyses", analysisId],
    queryFn: () => fetchAnalysis(analysisId!),
    enabled: apiOn && Boolean(analysisId),
  });

  const toggleValidation = (key: string) => {
    setValidatedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!apiOn) {
    return (
      <div className="space-y-6">
        <ApiConfigHint />
        <button
          type="button"
          onClick={() => navigate("/mapping")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Mapeamento
        </button>
      </div>
    );
  }

  if (!analysisId) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/mapping")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Mapeamento
        </button>
        <Card className="shadow-surface border-border p-8 text-center">
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Utilize o identificador da análise na URL, por exemplo{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">/analysis?id=…</code>
          </p>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate("/mapping")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Mapeamento
        </button>
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-foreground">
            {error instanceof ApiError ? error.message : "Não foi possível carregar a análise."}
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative">
            <Cpu className="w-5 h-5 text-primary animate-pulse" />
            <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Carregando análise...</h1>
            <p className="text-sm text-muted-foreground">Aguardando resposta da API</p>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4">
            <Skeleton className="h-72 rounded-2xl" />
          </div>
          <div className="col-span-8">
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  const riskPercent = data.riskPercent;
  const circumference = 2 * Math.PI * 80;
  const offset = circumference * (1 - riskPercent / 100);
  const displayRiskLabel = data.riskLabel || riskLabelFromPercent(riskPercent);
  const modelBadge =
    [data.modelName, data.modelVersion].filter(Boolean).join(" · ") || "Modelo IA";

  const strokeColor =
    riskPercent >= 70
      ? "hsl(var(--destructive))"
      : riskPercent >= 40
        ? "hsl(var(--warning))"
        : "hsl(var(--success))";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate("/mapping")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Mapeamento
        </button>
        <Badge variant="outline" className="text-[10px] font-mono">
          {modelBadge}
        </Badge>
      </div>

      <motion.div
        className="grid grid-cols-12 gap-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="col-span-12 lg:col-span-4">
          <Card className="shadow-soft border-border h-full flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
              Nível de Risco
            </h3>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                <circle cx="96" cy="96" r="80" stroke="hsl(var(--muted))" strokeWidth="12" fill="transparent" />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke={strokeColor}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground tabular-nums">{riskPercent}%</span>
                <span className="text-xs font-bold uppercase text-muted-foreground">{displayRiskLabel}</span>
              </div>
            </div>
            {data.diagnosisHint && (
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground">{data.diagnosisHint}</span>
              </p>
            )}
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <Card className="shadow-soft border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Mapeamento de ativação (Grad-CAM)
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="aspect-square rounded-lg bg-muted overflow-hidden border border-border flex items-center justify-center">
                  {data.originalImageUrl ? (
                    <img src={data.originalImageUrl} alt="Imagem da lesão" className="w-full h-full object-contain" />
                  ) : (
                    <p className="text-xs text-muted-foreground p-4 text-center">Sem imagem (API)</p>
                  )}
                </div>
                <p className="text-[10px] text-center text-muted-foreground uppercase font-bold">
                  Imagem original
                </p>
              </div>
              <div className="space-y-2">
                <div className="aspect-square rounded-lg bg-muted overflow-hidden border border-border relative flex items-center justify-center">
                  {data.heatmapImageUrl ? (
                    <img src={data.heatmapImageUrl} alt="Heatmap" className="w-full h-full object-contain" />
                  ) : (
                    <p className="text-xs text-muted-foreground p-4 text-center">Sem heatmap (API)</p>
                  )}
                </div>
                <p className="text-[10px] text-center text-muted-foreground uppercase font-bold">
                  Foco do modelo
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {data.abcde.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card className="bg-foreground text-primary-foreground p-8 border-none shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-50">
              Critérios ABCDE — Revisão médica
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              {data.abcde.map((item) => (
                <div key={item.key} className="space-y-2">
                  <div className="text-3xl font-black opacity-20">{item.key}</div>
                  <div className="text-xs font-bold text-primary">{item.title}</div>
                  <div className="text-sm font-medium">{item.detected}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                      checked={validatedItems[item.key] || false}
                      onCheckedChange={() => toggleValidation(item.key)}
                      className="border-primary-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-[10px] opacity-60">Validado</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <Card className="shadow-surface border-border p-6">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Laudo / Parecer médico
            </Label>
            <Textarea
              className="min-h-[120px] text-sm resize-none"
              placeholder="Registre seu parecer clínico, conduta sugerida e encaminhamentos..."
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button className="gap-2 font-semibold" type="button">
              <Save className="w-4 h-4" /> Salvar no histórico do paciente
            </Button>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="p-4 bg-warning/10 border border-warning/20 rounded-lg flex gap-3 items-start"
      >
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80 leading-relaxed">
          <strong>Aviso de suporte à decisão:</strong> Esta análise deve ser utilizada apenas como ferramenta auxiliar. O diagnóstico final e a conduta são de responsabilidade exclusiva do médico assistente.
        </p>
      </motion.div>
    </div>
  );
}
