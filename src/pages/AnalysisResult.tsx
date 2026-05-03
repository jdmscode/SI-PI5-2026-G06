import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Save, ArrowLeft, Cpu } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const abcdeItems = [
  { key: "A", title: "Assimetria", detected: "Detectada", severity: "high" },
  { key: "B", title: "Bordas", detected: "Irregulares", severity: "high" },
  { key: "C", title: "Coloração", detected: "Policromia", severity: "high" },
  { key: "D", title: "Diâmetro", detected: "> 6mm", severity: "medium" },
  { key: "E", title: "Evolução", detected: "Relatada", severity: "high" },
];

export default function AnalysisResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lesaoId } = useParams();

  const [loading, setLoading] = useState(true);
  const [validatedItems, setValidatedItems] = useState<Record<string, boolean>>({});
  const [parecerMedico, setParecerMedico] = useState("");
  const [loadedAnalysis, setLoadedAnalysis] = useState<any | null>(null);

  const stateAnalysisResult = location.state?.analysisResult;
  const imagemPreview = location.state?.imagemPreview;
  const analysisResult = stateAnalysisResult || loadedAnalysis;

  const [vereditoMedico, setVereditoMedico] = useState<string | null>(null);

  const imageSrc =
    imagemPreview ||
    (analysisResult?.imagem_path
      ? `http://localhost:8000/${analysisResult.imagem_path.replace(/^\/?/, "")}`
      : null);

  useEffect(() => {
  const fetchLesao = async () => {
    if (!lesaoId || analysisResult) return;

    try {
      const response = await fetch(`http://localhost:8000/lesoes/${lesaoId}`);

      if (!response.ok) {
        throw new Error("Erro ao buscar lesão");
      }

      const result = await response.json();
      setLoadedAnalysis(result);
    } catch (error) {
      console.error(error);
    }
  };

  fetchLesao();
}, [lesaoId, analysisResult]);

  useEffect(() => {
    if (!analysisResult) return;

    if (analysisResult.parecer_medico) {
      setParecerMedico(analysisResult.parecer_medico);
    }

    if (analysisResult.criterios_abcde) {
      setValidatedItems(analysisResult.criterios_abcde);
    }

    if (analysisResult.veredito_medico) {
      setVereditoMedico(analysisResult.veredito_medico);
    }

  }, [analysisResult]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!analysisResult && !loading) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/patients")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Pacientes
        </button>

        <Card className="p-6 border-border shadow-soft">
          <h2 className="text-lg font-bold text-foreground">Nenhuma análise encontrada</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Envie uma lesão pelo mapeamento anatômico para visualizar o resultado da IA.
          </p>
        </Card>
      </div>
    );
  }

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

  const classificacao = analysisResult.classificacao;
  const risco = analysisResult.risco;
  const confianca = Number(analysisResult.confianca ?? 0);

  const certaintyPercent = Math.round(confianca * 100);
  const isMaligno = classificacao === "maligno";
  const isAltoRisco = risco === "alto" || isMaligno;

  const diagnosticLabel = isMaligno ? "Melanoma Maligno" : "Lesão Benigna";

  const circumference = 2 * Math.PI * 80;
  const offset = circumference * (1 - certaintyPercent / 100);

  const handleSaveMedicalReview = async () => {
    if (!analysisResult?.id) {
      alert("Lesão inválida.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/lesoes/${analysisResult.id}/laudo`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parecer_medico: parecerMedico,
          criterios_abcde: validatedItems,
          veredito_medico: vereditoMedico,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const result = await response.json();

      console.log("Laudo salvo:", result);
      alert("Laudo salvo no histórico do paciente.");
    } catch (error) {
      console.error("Erro ao salvar laudo:", error);
      alert("Erro ao salvar laudo médico.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <Badge variant="outline" className="text-[10px] font-mono">
          Modelo: EfficientNetB3 · v2.1
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
              Resultado da IA
            </h3>

            <div
              className={`text-2xl font-black mb-2 ${
                isMaligno ? "text-destructive" : "text-primary"
              }`}
            >
              {diagnosticLabel}
            </div>

            <p className="text-xs text-muted-foreground mb-5">
              Classificação estimada pelo modelo
            </p>

            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="hsl(var(--muted))"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke={isAltoRisco ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground tabular-nums">
                  {certaintyPercent}%
                </span>
                <span className="text-xs font-bold uppercase text-muted-foreground">
                  de certeza
                </span>
              </div>
            </div>

            <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
              A porcentagem indica o grau de confiança da IA nessa classificação.
            </p>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <Card className="shadow-soft border-border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Imagem da Lesão
              </h3>
              <Badge variant="outline" className="text-[10px]">EfficientNetB3</Badge>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="flex justify-center items-center h-64 bg-muted rounded-lg border">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt="Imagem da lesão"
                      className="max-h-64 w-auto mx-auto object-contain rounded-lg"
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground">Imagem da lesão</p>
                  )}
                </div>
                <p className="text-[10px] text-center text-muted-foreground uppercase font-bold">
                  Imagem Original
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card className="bg-foreground text-primary-foreground p-8 border-none shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-50">
            Critérios ABCDE — Revisão Médica
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            {abcdeItems.map((item) => (
              <div key={item.key} className="space-y-2">
                <div className="text-3xl font-black opacity-20">{item.key}</div>
                <div className="text-xs font-bold text-primary">{item.title}</div>
                <div className="text-sm font-medium">{item.detected}</div>

                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    checked={validatedItems[item.key] === true}
                    onCheckedChange={(checked) => {
                      setValidatedItems((prev) => ({
                        ...prev,
                        [item.key]: checked === true,
                      }));
                    }}
                    className="border-primary-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="text-[10px] opacity-60">Validado</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

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
            <div className="space-y-3 mb-5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Veredito Final do Médico
              </Label>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={vereditoMedico === "benigno" ? "default" : "outline"}
                  onClick={() => setVereditoMedico("benigno")}
                >
                  Confirmar Benigno
                </Button>

                <Button
                  type="button"
                  variant={vereditoMedico === "maligno" ? "destructive" : "outline"}
                  onClick={() => setVereditoMedico("maligno")}
                >
                  Confirmar Maligno
                </Button>
              </div>
            </div>
            <Textarea
              value={parecerMedico}
              onChange={(e) => setParecerMedico(e.target.value)}
              className="min-h-[120px] text-sm resize-none"
              placeholder="Registre seu parecer clínico, conduta sugerida e encaminhamentos..."
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button className="gap-2 font-semibold" onClick={handleSaveMedicalReview}>
              <Save className="w-4 h-4" />
              Salvar no Histórico do Paciente
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
          <strong>Aviso de Suporte à Decisão:</strong> Esta análise é gerada por algoritmos de aprendizado profundo
          EfficientNetB3 e deve ser utilizada apenas como ferramenta auxiliar. O diagnóstico final, conduta cirúrgica
          e laudo histopatológico são de responsabilidade exclusiva do médico assistente. A IA é uma ferramenta de
          suporte à decisão — o diagnóstico definitivo é de responsabilidade médica.
        </p>
      </motion.div>
    </div>
  );
}