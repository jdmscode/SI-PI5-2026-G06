import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Check, Save, ArrowLeft, Cpu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const abcdeItems = [
  { key: "A", title: "Assimetria", detected: "Detectada", severity: "high" },
  { key: "B", title: "Bordas", detected: "Irregulares", severity: "high" },
  { key: "C", title: "Coloração", detected: "Policromia", severity: "high" },
  { key: "D", title: "Diâmetro", detected: "> 6mm", severity: "medium" },
  { key: "E", title: "Evolução", detected: "Relatada", severity: "high" },
];

export default function AnalysisResult() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [validatedItems, setValidatedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const toggleValidation = (key: string) => {
    setValidatedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative">
            <Cpu className="w-5 h-5 text-primary animate-pulse" />
            <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Processando na Rede Neural...</h1>
            <p className="text-sm text-muted-foreground">Modelo EfficientNetB3 · Análise em andamento</p>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4"><Skeleton className="h-72 rounded-2xl" /></div>
          <div className="col-span-8"><Skeleton className="h-72 rounded-2xl" /></div>
        </div>
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
    );
  }

  const riskPercent = 82;
  const circumference = 2 * Math.PI * 80;
  const offset = circumference * (1 - riskPercent / 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/mapping")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Mapeamento
        </button>
        <Badge variant="outline" className="text-[10px] font-mono">Modelo: EfficientNetB3 · v2.1</Badge>
      </div>

      <motion.div
        className="grid grid-cols-12 gap-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Risk Gauge */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="shadow-soft border-border h-full flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Nível de Risco</h3>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                <circle cx="96" cy="96" r="80" stroke="hsl(var(--muted))" strokeWidth="12" fill="transparent" />
                <circle
                  cx="96" cy="96" r="80"
                  stroke="hsl(var(--destructive))"
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
                <span className="text-xs font-bold text-destructive uppercase">Alto Risco</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              Padrões compatíveis com<br />
              <span className="font-bold text-foreground">Melanoma Maligno</span>
            </p>
          </Card>
        </div>

        {}
        <div className="col-span-12 lg:col-span-8">
          <Card className="shadow-soft border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Mapeamento de Ativação (Grad-CAM)
              </h3>
              <Badge variant="outline" className="text-[10px]">EfficientNetB3</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="aspect-square rounded-lg bg-muted overflow-hidden border border-border flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-200 to-amber-600 mx-auto mb-2 shadow-lg" />
                    <p className="text-xs text-muted-foreground">Imagem da lesão</p>
                  </div>
                </div>
                <p className="text-[10px] text-center text-muted-foreground uppercase font-bold">Imagem Original</p>
              </div>
              <div className="space-y-2">
                <div className="aspect-square rounded-lg bg-muted overflow-hidden border border-border relative flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-300 via-yellow-300 to-blue-300 mx-auto mb-2 shadow-lg opacity-80" />
                    <p className="text-xs text-muted-foreground">Heatmap Grad-CAM</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-destructive/10 to-transparent" />
                </div>
                <p className="text-[10px] text-center text-muted-foreground uppercase font-bold">Foco da Rede Neural</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card className="bg-foreground text-primary-foreground p-8 border-none shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-50">Critérios ABCDE — Revisão Médica</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            {abcdeItems.map((item) => (
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

      {}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <Card className="shadow-surface border-border p-6">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Laudo / Parecer Médico
            </Label>
            <Textarea
              className="min-h-[120px] text-sm resize-none"
              placeholder="Registre seu parecer clínico, conduta sugerida e encaminhamentos..."
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button className="gap-2 font-semibold">
              <Save className="w-4 h-4" /> Salvar no Histórico do Paciente
            </Button>
          </div>
        </Card>
      </motion.div>

      {}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="p-4 bg-warning/10 border border-warning/20 rounded-lg flex gap-3 items-start"
      >
        <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80 leading-relaxed">
          <strong>Aviso de Suporte à Decisão:</strong> Esta análise é gerada por algoritmos de aprendizado profundo (EfficientNetB3) e deve ser utilizada apenas como ferramenta auxiliar. O diagnóstico final, conduta cirúrgica e laudo histopatológico são de responsabilidade exclusiva do médico assistente. A IA é uma ferramenta de suporte à decisão — o diagnóstico definitivo é de responsabilidade médica.
        </p>
      </motion.div>
    </div>
  );
}
