import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import authHero from "@/assets/auth-hero.jpg";

const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

interface RegisterForm {
  name: string;
  crm: string;
  uf: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterForm>();
  const password = watch("password");

  // Registra o campo UF no hook-form para podermos validá-mo
  useEffect(() => {
    register("uf", { required: "UF obrigatória" });
  }, [register]);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setApiError("");
    setIsSuccess(false);

    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: data.name,      // <--- ADICIONE ESTA LINHA AQUI!
          crm: data.crm,
          estado: data.uf, 
          senha: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setApiError(result.detail || "Erro ao realizar cadastro.");
      }
    } catch (error) {
      console.error("Erro na API:", error);
      setApiError("Não foi possível conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={authHero} alt="Tecnologia médica" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <h2 className="text-3xl font-bold text-primary-foreground mb-3">Cadastro Profissional</h2>
            <p className="text-primary-foreground/80 text-sm max-w-md">Junte-se à nossa rede de especialistas em dermatologia.</p>
          </motion.div>
        </div>
      </div>

      {}
      <div className="flex-1 flex items-center justify-center p-8 bg-card overflow-y-auto">
        <motion.div className="w-full max-w-md space-y-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Criar Conta</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Nome Completo</Label>
              <Input {...register("name", { required: "Nome obrigatório" })} placeholder="Dr. Nome Exemplo" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">CRM</Label>
                <Input 
                  {...register("crm", { 
                    required: "Obrigatório",
                    pattern: { value: /^[0-9]+$/, message: "Apenas números" }
                  })} 
                  placeholder="000000" 
                />
                {errors.crm && <p className="text-[10px] text-destructive">{errors.crm.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">UF</Label>
                <Select onValueChange={(v) => setValue("uf", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                  <SelectContent>
                    {UF_LIST.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.uf && <p className="text-[10px] text-destructive">{errors.uf.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Senha</Label>
              <Input type="password" placeholder="••••••••" {...register("password", { required: "Senha obrigatória", minLength: { value: 6, message: "Mínimo 6 caracteres" } })} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Confirmar Senha</Label>
              <Input 
                type="password" 
                placeholder="••••••••"
                {...register("confirmPassword", { 
                  validate: (val) => val === password || "As senhas não coincidem" 
                })} 
              />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            {}
            {apiError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive text-center font-medium">{apiError}</p>
              </div>
            )}

            {isSuccess && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                <p className="text-sm text-green-600 dark:text-green-400 text-center font-medium">
                  Médico cadastrado com sucesso! Redirecionando...
                </p>
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={isLoading || isSuccess}>
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Finalizar Cadastro"}
            </Button>
          </form>

          <div className="text-center">
            <Link to="/login" className="text-sm text-primary flex items-center justify-center gap-1 font-medium hover:underline">
              <ArrowLeft className="w-4 h-4" /> Voltar para o Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}