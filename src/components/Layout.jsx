import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import EstadoSelect from "@/components/EstadoSelect";
import ThemeToggle from "@/components/ThemeToggle";
import BottomNav, { temBottomNav } from "@/components/BottomNav";
import BuscaGlobal from "@/components/BuscaGlobal";
import { EVENTO_ABRIR_BUSCA } from "@/lib/busca";
import { useEstado } from "@/lib/regiao";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Dice5,
  Store,
  CalendarDays,
  PlusCircle,
  LayoutDashboard,
  LogIn,
  LogOut,
  Info,
  Clapperboard,
  Mic,
  GraduationCap,
  Newspaper,
  ChevronDown,
  Briefcase,
  Search,
  BookOpen,
  Users,
  Map as MapIcon,
  Smartphone,
  BellRing,
  PackageOpen,
  Megaphone,
  UserRound,
  Star,
  FlaskConical,
} from "lucide-react";

const navLinks = [
  { to: "/", label: "Início", texto: "A página principal", icon: Dice5 },
  { to: "/eventos", label: "Agenda", texto: "Todos os eventos, por dia e por mês", icon: CalendarDays },
  { to: "/materias", label: "Matérias", texto: "Notícias e fotos dos encontros", icon: Newspaper },
  { to: "/lojas", label: "Lugares", texto: "Onde jogar e comprar jogos", icon: Store },
  { to: "/mapa", label: "Mapa", texto: "Lugares e eventos no mapa", icon: MapIcon },
  { to: "/lojas?tipo=editora", label: "Editoras", texto: "Quem faz os jogos", icon: BookOpen },
  { to: "/lojas?tipo=organizador", label: "Grupos", texto: "Quem organiza os encontros", icon: Users },
  { to: "/monitores", label: "Monitores", texto: "Quem ensina a jogar", icon: GraduationCap },
  { to: "/influencers", label: "Influenciadores", curto: "Influencers", texto: "Canais e perfis sobre jogos", icon: Clapperboard },
  { to: "/podcasts", label: "Podcasts", texto: "Para ouvir sobre jogos", icon: Mic },
  { to: "/procuro", label: "Procuro", texto: "Classificados: gente para jogar, testar e criar", icon: Megaphone },
  { to: "/testadores", label: "Testadores", texto: "Quem testa protótipos de jogos", icon: FlaskConical },
  { to: "/lancamentos", label: "Lançamentos", texto: "Pré-vendas e jogos novos", icon: PackageOpen },
  { to: "/vagas", label: "Estamos contratando", curto: "Vagas", texto: "Trabalhe com board games", icon: Briefcase },
  { to: "/anuncie", label: "Anuncie", texto: "Destaque seu lugar ou evento", icon: Star },
  { to: "/app", label: "Instalar o app", curto: "App", texto: "A agenda na tela do celular", icon: Smartphone },
  { to: "/sobre", label: "Sobre", texto: "Quem somos", icon: Info },
];

// No desktop, estes itens ficam agrupados em "Mais"; no menu do celular e no rodapé aparecem todos.
const LINKS_MAIS = ["/mapa", "/procuro", "/testadores", "/lojas?tipo=editora", "/lojas?tipo=organizador", "/influencers", "/podcasts", "/lancamentos", "/anuncie", "/app", "/sobre"];
const navPrincipais = navLinks.filter((l) => !LINKS_MAIS.includes(l.to));
const navMais = navLinks.filter((l) => LINKS_MAIS.includes(l.to));

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const [buscaAberta, setBuscaAberta] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { info } = useEstado();
  const location = useLocation();
  const navigate = useNavigate();

  // Ctrl/⌘+K ou "/" abrem a busca; a home e outros pontos disparam o mesmo evento.
  useEffect(() => {
    const abrir = () => setBuscaAberta(true);
    const aoTeclar = (ev) => {
      const alvo = ev.target;
      const digitando = alvo?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(alvo?.tagName || "");
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
        ev.preventDefault();
        setBuscaAberta((v) => !v);
      } else if (ev.key === "/" && !digitando && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        ev.preventDefault();
        setBuscaAberta(true);
      }
    };
    window.addEventListener(EVENTO_ABRIR_BUSCA, abrir);
    window.addEventListener("keydown", aoTeclar);
    return () => {
      window.removeEventListener(EVENTO_ABRIR_BUSCA, abrir);
      window.removeEventListener("keydown", aoTeclar);
    };
  }, []);

  // Itens com ?tipo= (Editoras, Grupos) são páginas de Lugares filtradas: só um item fica ativo por vez.
  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    const [base, query] = path.split("?");
    if (!location.pathname.startsWith(base)) return false;
    const tipoAtual = new URLSearchParams(location.search).get("tipo");
    if (query) return tipoAtual === new URLSearchParams(query).get("tipo");
    if (base === "/lojas") return tipoAtual !== "editora" && tipoAtual !== "organizador";
    return true;
  };

  const handleLogout = () => {
    logout(false);
    navigate("/");
  };

  return (
    <div className={`min-h-screen flex flex-col overflow-x-clip bg-parchment ${temBottomNav(location.pathname) ? "pb-[calc(8.75rem+env(safe-area-inset-bottom))] lg:pb-0" : ""}`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border text-foreground shadow-sm">
        <div className="max-w-7xl min-[1760px]:max-w-[112rem] mx-auto px-4">
          <div className="flex items-center justify-between gap-2 h-16 xl:gap-3">
            <Link to="/" className="group min-w-0 shrink inline-flex items-center min-h-11" aria-label="eventosBG — início">
              <Logo className="min-w-0" markClassName="shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-8 lg:h-8 xl:w-10 xl:h-10 group-hover:rotate-[-6deg] transition-transform" />
            </Link>

            <nav className="hidden xl:flex flex-nowrap items-center justify-end gap-0 min-[1760px]:gap-0.5 min-w-0" aria-label="Navegação principal">
              {navPrincipais.map(({ to, label, curto }) => (
                <Link
                  key={to}
                  to={to}
                  aria-current={isActive(to) ? "page" : undefined}
                  className={`shrink-0 whitespace-nowrap px-2 py-2 rounded-lg text-sm font-500 transition-colors ${
                    isActive(to)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {curto ? (
                    <>
                      <span className="min-[1760px]:hidden">{curto}</span>
                      <span className="hidden min-[1760px]:inline">{label}</span>
                    </>
                  ) : label}
                </Link>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`shrink-0 inline-flex items-center gap-1 whitespace-nowrap px-2 py-2 rounded-lg text-sm font-500 transition-colors ${
                    navMais.some((l) => isActive(l.to))
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  Mais <ChevronDown className="w-4 h-4" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-60">
                  {navMais.map(({ to, label, texto, icon: Icon }) => (
                    <DropdownMenuItem key={to} asChild className="min-h-12 cursor-pointer">
                      <Link to={to} aria-current={isActive(to) ? "page" : undefined}>
                        <Icon className="w-4 h-4 mr-2.5 shrink-0" aria-hidden="true" />
                        <span>
                          <span className="block text-sm font-600">{label}</span>
                          <span className="block text-xs text-muted-foreground">{texto}</span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
              {isAuthenticated ? (
                <>
                  <Link
                    to="/painel"
                    className={`shrink-0 flex items-center gap-1.5 whitespace-nowrap px-2 py-2 rounded-lg text-sm font-500 transition-colors ${
                      isActive("/painel")
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <LayoutDashboard className="hidden min-[1760px]:block w-4 h-4" />
                    Painel
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="shrink-0 whitespace-nowrap px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <LogOut className="hidden min-[1760px]:block w-4 h-4 mr-1.5" />
                    Sair
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  className="shrink-0 whitespace-nowrap px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Link to="/login">
                    <LogIn className="hidden min-[1760px]:block w-4 h-4 mr-1.5" />
                    Entrar
                  </Link>
                </Button>
              )}
<button
                type="button"
                onClick={() => setBuscaAberta(true)}
                aria-label="Buscar no site"
                title="Buscar (Ctrl K ou /)"
                className="ml-1 grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Search className="w-5 h-5" aria-hidden="true" />
              </button>
              <EstadoSelect className="ml-1 shrink-0" />
              <ThemeToggle className="ml-0.5 shrink-0" />
              <Button asChild className="shrink-0 whitespace-nowrap bg-accent text-accent-foreground hover:bg-accent/90 ml-1 px-4 text-sm font-600">
                <Link to="/cadastrar">
                  <PlusCircle className="hidden min-[1760px]:block w-4 h-4 mr-1.5" aria-hidden="true" />
                  Cadastrar
                </Link>
              </Button>
            </nav>

            <div className="xl:hidden flex shrink-0 items-center gap-1">
            <button
                type="button"
                onClick={() => setBuscaAberta(true)}
                aria-label="Buscar no site"
                title="Buscar (Ctrl K ou /)"
                className=" hidden min-[400px]:grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Search className="w-5 h-5" aria-hidden="true" />
              </button>
              <EstadoSelect />
            <span className="hidden min-[460px]:inline-flex"><ThemeToggle /></span>
            <button
              className="p-2.5 -mr-1.5 rounded-lg hover:bg-muted"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
            >
              {open ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
            </div>
          </div>
        </div>

        {open && (
          <div
            id="mobile-menu"
            className="xl:hidden max-h-[calc(100dvh-4rem-4.5rem-env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain border-t border-border bg-card"
            role="navigation"
            aria-label="Navegação mobile"
          >
            <div className="px-4 py-3 pb-6 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setBuscaAberta(true);
                }}
                className="w-full flex items-center gap-2.5 min-h-11 px-3 py-2.5 rounded-lg border border-border text-sm font-500 text-muted-foreground hover:bg-muted"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                Buscar no site
              </button>
              <div className="flex items-center justify-between min-[460px]:hidden px-3 py-1 text-sm font-500 text-muted-foreground">
                Tema claro ou escuro
                <ThemeToggle />
              </div>
              {navLinks.map(({ to, label, texto, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(to) ? "page" : undefined}
                  className={`flex items-center gap-2.5 min-h-11 px-3 py-2.5 rounded-lg text-sm font-500 ${
                    isActive(to)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block">{label}</span>
                    <span className="block text-xs font-400 opacity-75">{texto}</span>
                  </span>
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/perfil"
                    onClick={() => setOpen(false)}
                    aria-current={isActive("/perfil") ? "page" : undefined}
                    className="flex items-center gap-2.5 min-h-11 px-3 py-2.5 rounded-lg text-sm font-500 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <UserRound className="w-4 h-4" />
                    Meu perfil
                  </Link>
                  <Link
                    to="/seguindo"
                    onClick={() => setOpen(false)}
                    aria-current={isActive("/seguindo") ? "page" : undefined}
                    className="flex items-center gap-2.5 min-h-11 px-3 py-2.5 rounded-lg text-sm font-500 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <BellRing className="w-4 h-4" />
                    Seguindo
                  </Link>
                  <Link
                    to="/painel"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 min-h-11 px-3 py-2.5 rounded-lg text-sm font-500 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Painel
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 min-h-11 px-3 py-2.5 rounded-lg text-sm font-500 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 min-h-11 px-3 py-2.5 rounded-lg text-sm font-500 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <motion.main
        key={location.pathname}
        id="main-content"
        tabIndex={-1}
        className="flex-1"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.main>

      <footer className="bg-board text-white/70 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-sm">
          <div>
            <Logo inverted />
            <p className="mt-3 max-w-xs">
              A agenda de jogos de tabuleiro: espaços de jogos, lojas e eventos {info.sigla === "DF" ? "do DF" : `de ${info.nome}`}.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Rodapé">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} className="inline-block py-2 hover:text-accent transition-colors">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
      <BottomNav />
      <BuscaGlobal open={buscaAberta} onOpenChange={setBuscaAberta} />
    </div>
  );
}