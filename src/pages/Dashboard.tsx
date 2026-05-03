import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, ScanLine, TrendingUp, ArrowUpRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const medicoNome = localStorage.getItem("medico_nome") || "Profissional";

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const response = await fetch("http://localhost:8000/pacientes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setPatients(data);
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalPatients = patients.length;
  const totalLesions = patients.reduce((acc, p) => acc + (p.lesoes || 0), 0);

  const metrics = [
    {
      label: "Pacientes Ativos",
      value: totalPatients.toString(),
      icon: Users,
      change: "Total na base",
    },
    {
      label: "Lesões Mapeadas",
      value: totalLesions.toString(),
      icon: ScanLine,
      change: "Total acumulado",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, Dr. {medicoNome}</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do seu painel clínico real</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Card className="shadow-surface border-border hover:shadow-soft transition-shadow duration-300">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {m.label}
                    </p>
                    <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">
                      {m.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {m.change}
                      </span>
                    </div>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <m.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Card className="shadow-surface border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Pacientes Recentes
              </CardTitle>

              <button
                onClick={() => navigate("/patients")}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                Ver todos <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-10">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Paciente
                      </th>
                      <th className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Idade
                      </th>
                      <th className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Última Consulta
                      </th>
                      <th className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Lesões
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {patients.slice(0, 5).map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-border/50 hover:bg-accent/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/patients/${p.id}`)}
                      >
                        <td className="py-3 px-3 font-medium text-foreground">{p.nome}</td>
                        <td className="py-3 px-3 text-muted-foreground tabular-nums">{p.idade} anos</td>
                        <td className="py-3 px-3 text-muted-foreground tabular-nums">{p.ultima_consulta}</td>
                        <td className="py-3 px-3 text-muted-foreground tabular-nums">{p.lesoes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}