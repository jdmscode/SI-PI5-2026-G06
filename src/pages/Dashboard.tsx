import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users,
  ScanLine,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiConfigHint } from "@/components/ApiConfigHint";
import { isApiConfigured } from "@/lib/api/config";
import { fetchDashboardSummary } from "@/lib/api/requests";
import { ApiError } from "@/lib/api/client";
import type { DashboardMetric, RecentPatientRow } from "@/lib/api/types";

const metricPlaceholders: { label: string; icon: typeof Users }[] = [
  { label: "Pacientes Ativos", icon: Users },
  { label: "Lesões Mapeadas", icon: ScanLine },
  { label: "Análises Pendentes", icon: Clock },
  { label: "Alertas Alto Risco", icon: AlertTriangle },
];

const statusConfig = {
  low: { label: "Baixo", className: "bg-risk-low-subtle text-risk-low" },
  medium: { label: "Atenção", className: "bg-risk-medium-subtle text-risk-medium" },
  high: { label: "Alto", className: "bg-risk-high-subtle text-risk-high" },
};

function metricIcon(trend: DashboardMetric["trend"]) {
  if (trend === "up") return <TrendingUp className="w-3 h-3 text-success" />;
  if (trend === "down") return <TrendingDown className="w-3 h-3 text-muted-foreground" />;
  if (trend === "alert") return <AlertTriangle className="w-3 h-3 text-destructive" />;
  return null;
}

export default function Dashboard() {
  const apiOn = isApiConfigured();
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchDashboardSummary,
    enabled: apiOn,
  });

  const metrics: DashboardMetric[] = data?.metrics ?? [];
  const recentPatients: RecentPatientRow[] = data?.recentPatients ?? [];
  const greeting = data?.greetingName?.trim() || "Profissional";

  return (
    <div className="space-y-6">
      {!apiOn && <ApiConfigHint />}

      {apiOn && isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-foreground">
            {error instanceof ApiError ? error.message : "Não foi possível carregar o painel."}
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            Tentar novamente
          </Button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-foreground">Olá, {greeting}</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do seu painel clínico</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricPlaceholders.map((placeholder, i) => {
          const m = metrics[i];
          const Icon = placeholder.icon;
          const showSkeleton = apiOn && isLoading;
          return (
            <motion.div
              key={placeholder.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card className="shadow-surface border-border hover:shadow-soft transition-shadow duration-300">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {m?.label ?? placeholder.label}
                      </p>
                      {showSkeleton ? (
                        <Skeleton className="h-9 w-20 mt-2" />
                      ) : (
                        <p className="text-3xl font-bold text-foreground mt-1 tabular-nums">
                          {m?.value ?? "—"}
                        </p>
                      )}
                      {!showSkeleton && m?.change && (
                        <div className="flex items-center gap-1 mt-2">
                          {metricIcon(m.trend)}
                          <span
                            className={`text-[11px] font-medium ${
                              m.trend === "alert" ? "text-destructive" : "text-muted-foreground"
                            }`}
                          >
                            {m.change}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <Card className="shadow-surface border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Pacientes Recentes
              </CardTitle>
              <Link
                to="/patients"
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                Ver todos <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {apiOn && isLoading ? (
              <div className="space-y-2 py-2">
                {[1, 2, 3].map((k) => (
                  <Skeleton key={k} className="h-10 w-full" />
                ))}
              </div>
            ) : recentPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                {apiOn ? "Nenhum paciente recente." : "Sem ligação à API."}
              </p>
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
                      <th className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Risco
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPatients.map((p) => {
                      const s = statusConfig[p.status];
                      return (
                        <tr
                          key={p.id}
                          className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                        >
                          <td className="py-3 px-3 font-medium text-foreground">
                            <Link to={`/patients/${p.id}`} className="hover:text-primary hover:underline">
                              {p.name}
                            </Link>
                          </td>
                          <td className="py-3 px-3 text-muted-foreground tabular-nums">{p.age} anos</td>
                          <td className="py-3 px-3 text-muted-foreground tabular-nums">{p.lastVisit}</td>
                          <td className="py-3 px-3 text-muted-foreground tabular-nums">{p.lesions}</td>
                          <td className="py-3 px-3">
                            <Badge
                              variant="secondary"
                              className={`text-[10px] font-bold uppercase ${s.className}`}
                            >
                              {s.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
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
