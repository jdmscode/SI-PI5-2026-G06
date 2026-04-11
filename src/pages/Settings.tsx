import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Bell, FileDown, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ nome: "", crm: "", estado: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const response = await fetch("http://localhost:8000/me", {
          headers: { 
            "Authorization": `Bearer ${token}` 
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          toast.error("Erro ao carregar dados do perfil");
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
        toast.error("Erro de conexão com o servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie seu perfil e preferências clínicas</p>
      </div>

      {}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="shadow-surface border-border">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Perfil Médico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nome Completo</Label>
                <Input 
                  value={profile.nome} 
                  disabled 
                  className="h-10 bg-muted/50 font-medium cursor-not-allowed border-dashed" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Especialidade</Label>
                <Input defaultValue="Dermatologia Oncológica" className="h-10" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CRM</Label>
                <Input value={profile.crm} className="h-10 bg-muted/30" disabled />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">UF</Label>
                <Input value={profile.estado} className="h-10 bg-muted/30" disabled />
              </div>
            </div>
            
            <div className="pt-2">
              <Button size="sm" className="font-semibold gap-2" onClick={handleSave}>
                <Save className="w-4 h-4" /> Salvar Alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="shadow-surface border-border">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Alertas de Alto Risco</p>
                <p className="text-xs text-muted-foreground">Receber notificação quando análises detectarem alto risco</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Resumo Semanal</p>
                <p className="text-xs text-muted-foreground">Relatório semanal consolidado por e-mail</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="shadow-surface border-border">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileDown className="w-4 h-4 text-primary" /> Exportação de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Exporte relatórios em formato PDF para documentação clínica legal.</p>
            <Button variant="outline" size="sm" className="gap-2">
              <FileDown className="w-3.5 h-3.5" /> Gerar Relatório PDF (BETA)
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}