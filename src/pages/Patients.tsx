import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, ArrowUpRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";

interface Patient {
  id: string;
  nome: string;
  idade: number;
  cpf: string;
  lesoes: number;
  risco: string;
  ultima_consulta: string;
}

interface NewPatientForm {
  nome: string;
  idade: number;
  cpf: string;
}


export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm<NewPatientForm>();

  const getAuthHeader = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch("http://localhost:8000/pacientes", {
        headers: getAuthHeader()
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else if (response.status === 401) {
        
        navigate("/login");
      }
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleCreatePatient = async (data: NewPatientForm) => {
    try {
      const response = await fetch("http://localhost:8000/pacientes", {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsModalOpen(false);
        reset();
        fetchPatients();
      }
    } catch (error) {
      console.error("Erro ao cadastrar paciente:", error);
    }
  };

  const filtered = patients.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Carregando..." : `${patients.length} pacientes cadastrados`}
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 font-semibold">
              <Plus className="w-4 h-4" /> Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleCreatePatient)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" {...register("nome", { required: true })} placeholder="Ex: Maria Oliveira" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idade">Idade</Label>
                  <Input id="idade" type="number" {...register("idade", { required: true })} placeholder="00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" {...register("cpf", { required: true })} placeholder="000.000.000-00" />
                </div>
              </div>
              <Button type="submit" className="w-full">Salvar Paciente</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-card"
          />
        </div>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary/40" /></div>
        ) : filtered.length > 0 ? (
          filtered.map((p, i) => {
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="shadow-sm border-border hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/patients/${p.id}`)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {p.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{p.nome}</p>
                        <p className="text-xs text-muted-foreground">{p.idade} anos · {p.cpf}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right min-w-fit">
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {p.lesoes} lesões
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {p.ultima_consulta}
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center p-12 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground">Nenhum paciente cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}