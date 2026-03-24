import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, ScanLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "react-router-dom";
import { ApiConfigHint } from "@/components/ApiConfigHint";
import { isApiConfigured } from "@/lib/api/config";
import { fetchPatient, fetchPatientLesions } from "@/lib/api/requests";
import { ApiError } from "@/lib/api/client";
import type { RiskLevel } from "@/lib/api/types";

const riskConfig: Record<
  RiskLevel,
  { label: string; className: string }
> = {
  low: { label: "Baixo", className: "bg-risk-low-subtle text-risk-low" },
  medium: { label: "Atenção", className: "bg-risk-medium-subtle text-risk-medium" },
  high: { label: "Alto", className: "bg-risk-high-subtle text-risk-high" },
};

const overallRiskLabel: Record<RiskLevel, string> = {
  low: "Baixo Risco",
  medium: "Atenção",
  high: "Alto Risco",
};

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export default function PatientProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const apiOn = isApiConfigured();

  const patientQuery = useQuery({
    queryKey: ["patients", id],
    queryFn: () => fetchPatient(id!),
    enabled: apiOn && Boolean(id),
  });

  const lesionsQuery = useQuery({
    queryKey: ["patients", id, "lesions"],
    queryFn: () => fetchPatientLesions(id!),
    enabled: apiOn && Boolean(id) && patientQuery.isSuccess,
  });

  const patient = patientQuery.data;
  const timeline = lesionsQuery.data ?? [];
  const initials = patient?.initials?.trim() || (patient ? initialsFromName(patient.name) : "");

  return (
    <div className="space-y-6">
      {!apiOn && <ApiConfigHint />}

      <button
        type="button"
        onClick={() => navigate("/patients")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Pacientes
      </button>

      {apiOn && patientQuery.isError && (
        <p className="text-sm text-destructive">
          {patientQuery.error instanceof ApiError
            ? patientQuery.error.message
            : "Não foi possível carregar o paciente."}
        </p>
      )}

      {apiOn && patientQuery.isLoading && (
        <Skeleton className="h-40 w-full rounded-xl" />
      )}

      {apiOn && !patientQuery.isLoading && !patient && !patientQuery.isError && (
        <p className="text-sm text-muted-foreground">Paciente não encontrado.</p>
      )}

      {patient && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-surface border-border">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{initials || "?"}</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-foreground">{patient.name}</h1>
                      <p className="text-sm text-muted-foreground">
                        {patient.age} anos
                        {patient.gender ? ` · ${patient.gender}` : ""}
                        {patient.cpfMasked ? ` · CPF: ${patient.cpfMasked}` : ""}
                      </p>
                      {(patient.fitzpatrickType != null || patient.familyHistory != null) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {patient.fitzpatrickType != null && (
                            <span>Fototipo {patient.fitzpatrickType} (Fitzpatrick)</span>
                          )}
                          {patient.fitzpatrickType != null && patient.familyHistory != null && " · "}
                          {patient.familyHistory != null && (
                            <span>Histórico familiar: {patient.familyHistory ? "Sim" : "Não"}</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      type="button"
                      onClick={() => navigate("/mapping")}
                    >
                      <ScanLine className="w-3.5 h-3.5" /> Nova Lesão
                    </Button>
                    <Badge
                      variant="secondary"
                      className={`${riskConfig[patient.overallRisk].className} text-[10px] font-bold uppercase`}
                    >
                      {overallRiskLabel[patient.overallRisk]}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="shadow-surface border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Histórico de Lesões
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lesionsQuery.isLoading ? (
                  <div className="space-y-2 py-2">
                    {[1, 2, 3].map((k) => (
                      <Skeleton key={k} className="h-16 w-full" />
                    ))}
                  </div>
                ) : lesionsQuery.isError ? (
                  <p className="text-sm text-destructive">
                    {lesionsQuery.error instanceof ApiError
                      ? lesionsQuery.error.message
                      : "Não foi possível carregar o histórico."}
                  </p>
                ) : timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">Nenhum registro de lesão.</p>
                ) : (
                  <div className="space-y-0">
                    {timeline.map((entry, i) => {
                      const r = riskConfig[entry.risk];
                      return (
                        <div key={entry.id}>
                          <div className="flex items-start gap-4 py-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  entry.risk === "high"
                                    ? "bg-destructive"
                                    : entry.risk === "medium"
                                      ? "bg-warning"
                                      : "bg-success"
                                }`}
                              />
                              {i < timeline.length - 1 && (
                                <div className="w-px h-full bg-border mt-1" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground tabular-nums">
                                    {entry.date}
                                  </span>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className={`text-[10px] font-bold uppercase ${r.className}`}
                                >
                                  {r.label}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-foreground mt-1 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-primary" /> {entry.zone}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{entry.notes}</p>
                            </div>
                          </div>
                          {i < timeline.length - 1 && <Separator />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}
