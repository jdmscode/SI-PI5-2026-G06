import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Activity, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { toast } from "sonner";
import authHero from "@/assets/auth-hero.jpg";
import { loginRequest } from "@/lib/api/requests";
import { setAuthToken } from "@/lib/auth";
import { ApiError } from "@/lib/api/client";
import { isApiConfigured } from "@/lib/api/config";
import { ApiConfigHint } from "@/components/ApiConfigHint";

const UF_LIST = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

interface LoginForm {
  crm: string;
  uf: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginForm>({ defaultValues: { uf: "" } });

  const uf = watch("uf");

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (res) => {
      setAuthToken(res.accessToken);
      toast.success("Sessão iniciada");
      navigate("/dashboard");
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : "Falha no login";
      toast.error(msg);
    },
  });

  const onSubmit = (data: LoginForm) => {
    if (!isApiConfigured()) {
      toast.error("VITE_API_BASE_URL não está definida.");
      return;
    }
    loginMutation.mutate({
      crm: data.crm.trim(),
      uf: data.uf,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={authHero} alt="Tecnologia médica" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-primary-foreground mb-3">
              Inteligência artificial
              <br />
              a serviço da dermatologia
            </h2>
            <p className="text-primary-foreground/80 text-sm max-w-md leading-relaxed">
              Apoio clínico para identificação e acompanhamento de risco de melanoma com análise assistida por modelos de IA.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-card gap-6">
        {!isApiConfigured() && (
          <div className="w-full max-w-sm">
            <ApiConfigHint />
          </div>
        )}
        <motion.div
          className="w-full max-w-sm space-y-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Melanoma Mapper Pro</h1>
            <p className="text-sm text-muted-foreground mt-1">Acesse sua conta profissional</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="crm" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                CRM
              </Label>
              <Input
                id="crm"
                placeholder="000000"
                {...register("crm", { required: "CRM obrigatório" })}
                className="h-11"
              />
              {errors.crm && <p className="text-xs text-destructive">{errors.crm.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="uf" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Estado (UF)
              </Label>
              <Select value={uf || undefined} onValueChange={(v) => setValue("uf", v, { shouldValidate: true })}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {UF_LIST.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register("uf", { required: "UF obrigatória" })} />
              {errors.uf && <p className="text-xs text-destructive">{errors.uf.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", { required: "Senha obrigatória" })}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full h-11 font-semibold" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Entrando…" : "Entrar"}
            </Button>
          </form>

          <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
            Acesso exclusivo para profissionais médicos
            <br />
            devidamente registrados no CRM.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
