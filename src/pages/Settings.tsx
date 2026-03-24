import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { User, Bell, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiConfigHint } from "@/components/ApiConfigHint";
import { isApiConfigured } from "@/lib/api/config";
import { fetchCurrentUser } from "@/lib/api/requests";
import { ApiError } from "@/lib/api/client";

export default function SettingsPage() {
  const apiOn = isApiConfigured();
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser,
    enabled: apiOn,
  });

  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");

  useEffect(() => {
    if (data) {
      setFullName(data.fullName ?? "");
      setSpecialty(data.specialty ?? "");
    }
  }, [data]);

  return (
    <div className="space-y-6 max-w-2xl">
      {!apiOn && <ApiConfigHint />}

      {apiOn && isError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-foreground">
            {error instanceof ApiError ? error.message : "Não foi possível carregar o perfil."}
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            Tentar novamente
          </Button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie seu perfil e preferências</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="shadow-surface border-border">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" /> Perfil médico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiOn && isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Nome completo
                    </Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-10"
                      placeholder="—"
                      disabled={!apiOn}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Especialidade
                    </Label>
                    <Input
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="h-10"
                      placeholder="—"
                      disabled={!apiOn}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">CRM</Label>
                    <Input value={data?.crm ?? ""} className="h-10" placeholder="—" readOnly disabled={!data} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">UF</Label>
                    <Input value={data?.uf ?? ""} className="h-10" placeholder="—" readOnly disabled={!data} />
                  </div>
                </div>
                <Button size="sm" className="font-semibold" type="button" disabled={!apiOn || !data}>
                  Salvar alterações
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="shadow-surface border-border">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Alertas de alto risco</p>
                <p className="text-xs text-muted-foreground">
                  Receber notificação quando análises detectarem alto risco
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Resumo semanal</p>
                <p className="text-xs text-muted-foreground">Relatório semanal por e-mail</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card className="shadow-surface border-border">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileDown className="w-4 h-4" /> Exportação de dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Exporte relatórios em formato PDF para documentação clínica.
            </p>
            <Button variant="outline" size="sm" className="gap-2" type="button">
              <FileDown className="w-3.5 h-3.5" /> Gerar relatório PDF
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
