import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Plus, Filter, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ApiConfigHint } from "@/components/ApiConfigHint";
import { isApiConfigured } from "@/lib/api/config";
import { fetchPatients } from "@/lib/api/requests";
import { ApiError } from "@/lib/api/client";

const statusConfig = {
  low: { label: "Baixo Risco", className: "bg-risk-low-subtle text-risk-low" },
  medium: { label: "Atenção", className: "bg-risk-medium-subtle text-risk-medium" },
  high: { label: "Alto Risco", className: "bg-risk-high-subtle text-risk-high" },
};

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Patients() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const apiOn = isApiConfigured();

  const { data: patients = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["patients"],
    queryFn: fetchPatients,
    enabled: apiOn,
  });

  const filtered = patients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {!apiOn && <ApiConfigHint />}

      {apiOn && isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-foreground">
            {error instanceof ApiError ? error.message : "Não foi possível carregar os pacientes."}
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            Tentar novamente
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {apiOn && !isLoading ? `${patients.length} pacientes cadastrados` : "Lista de pacientes"}
          </p>
        </div>
        <Button className="gap-2 font-semibold" type="button">
          <Plus className="w-4 h-4" /> Novo Paciente
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-card"
            disabled={!apiOn || isLoading}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2 text-muted-foreground" type="button">
          <Filter className="w-3.5 h-3.5" /> Filtros
        </Button>
      </div>

      {apiOn && isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3, 4].map((k) => (
            <Skeleton key={k} className="h-[72px] w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {apiOn ? "Nenhum paciente encontrado." : "Sem ligação à API."}
        </p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((p, i) => {
            const s = statusConfig[p.status];
            const initials = initialsFromName(p.name);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card
                  className="shadow-surface border-border hover:shadow-soft transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate(`/patients/${p.id}`)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{initials || "?"}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.age} anos · {p.cpfMasked}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">
                          {p.lesions} lesões · {p.lastVisit}
                        </p>
                      </div>
                      <Badge variant="secondary" className={`text-[10px] font-bold uppercase ${s.className}`}>
                        {s.label}
                      </Badge>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
