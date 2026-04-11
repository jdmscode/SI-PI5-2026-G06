import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { Search, Bell, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppLayout() {
  const navigate = useNavigate();
  
  const medicoNome = localStorage.getItem("medico_nome") || "Doutor";
  const iniciais = medicoNome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("medico_nome");
    localStorage.removeItem("medico_id");
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground" />
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar paciente..."
                  className="pl-9 w-64 h-8 text-sm bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 outline-none group">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-primary/20">
                      <span className="text-xs font-semibold text-primary">{iniciais}</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b border-border/50 mb-1">
                    Dr. {medicoNome}
                  </div>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer" 
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sair do Sistema
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}