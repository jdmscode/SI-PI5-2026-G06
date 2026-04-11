import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, ScanLine, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const riskConfig = {
  "BAIXO RISCO": { label: "Baixo", className: "bg-green-500/10 text-green-600", dot: "bg-green-500" },
  "ATENÇÃO": { label: "Atenção", className: "bg-yellow-500/10 text-yellow-600", dot: "bg-yellow-500" },
  "ALTO RISCO": { label: "Alto", className: "bg-red-500/10 text-red-600", dot: "bg-red-500" },
};

interface PatientData {
  paciente: {
    id: number;
    nome: string;
    idade: number;
    cpf: string;
    risco: string;
    lesoes: number;
  };
  lesoes: Array<{
    id: number;
    data: string;
    localizacao: string;
    descricao: string;
    risco: string;
  }>;
}

export default function PatientProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch(`http://localhost:8000/pacientes/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.error("Erro ao buscar detalhes");
          navigate("/patients"); 
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando prontuário...</p>
      </div>
    );
  }

  if (!data) return null;

  const { paciente, lesoes } = data;
  const patientInitials = paciente.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const currentRisk = riskConfig[paciente.risco as keyof typeof riskConfig] || riskConfig["BAIXO RISCO"];

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate("/patients")} 
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Pacientes
      </button>

      {/* Card do Perfil */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-surface border-border">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">{patientInitials}</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{paciente.nome}</h1>
                  <p className="text-sm text-muted-foreground">{paciente.idade} anos · {paciente.cpf}</p>
                  <p className="text-xs text-muted-foreground mt-1">Dados reais do prontuário eletrônico</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/mapping/${id}`)}>
                  <ScanLine className="w-3.5 h-3.5" /> Nova Lesão
                </Button>
                <Badge variant="secondary" className={`text-[10px] font-bold uppercase ${currentRisk.className}`}>
                  {paciente.risco}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="shadow-surface border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Histórico de Lesões ({lesoes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {lesoes.length > 0 ? (
                lesoes.map((entry, i) => {
                  const r = riskConfig[entry.risco as keyof typeof riskConfig] || riskConfig["BAIXO RISCO"];
                  return (
                    <div key={entry.id}>
                      <div className="flex items-start gap-4 py-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full mt-1.5 ${r.dot}`} />
                          {i < lesoes.length - 1 && <div className="w-px h-full bg-border mt-1" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground tabular-nums">{entry.data}</span>
                            </div>
                            <Badge variant="secondary" className={`text-[10px] font-bold uppercase ${r.className}`}>
                              {r.label}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground mt-1 flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-primary" /> {entry.localizacao}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{entry.descricao}</p>
                        </div>
                      </div>
                      {i < lesoes.length - 1 && <Separator />}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">Nenhuma lesão mapeada para este paciente.</p>
                  <Button variant="link" className="text-primary text-xs" onClick={() => navigate(`/mapping/${id}`)}>
                    Iniciar primeiro mapeamento
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}