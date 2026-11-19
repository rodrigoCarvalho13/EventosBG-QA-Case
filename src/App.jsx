import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import LogoSpinner from "@/components/LogoSpinner";
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import SeoRoutes from '@/components/SeoRoutes';
import ProtectedRoute from '@/components/ProtectedRoute';
import ErroPagina from '@/components/ErroPagina';
import Home from '@/pages/Home';
const Lojas = lazy(() => import('@/pages/Lojas'));
const LojaDetalhe = lazy(() => import('@/pages/LojaDetalhe'));
const Eventos = lazy(() => import('@/pages/Eventos'));
const EventoDetalhe = lazy(() => import('@/pages/EventoDetalhe'));
const SugerirEvento = lazy(() => import('@/pages/SugerirEvento'));
const Cadastrar = lazy(() => import('@/pages/Cadastrar'));
const Sobre = lazy(() => import('@/pages/Sobre'));
const Painel = lazy(() => import('@/pages/Painel'));
const CadastroLoja = lazy(() => import('@/pages/CadastroLoja'));
const CadastroEvento = lazy(() => import('@/pages/CadastroEvento'));
const Influencers = lazy(() => import('@/pages/Influencers'));
const CriadorDetalhe = lazy(() => import('@/pages/CriadorDetalhe'));
const MeusVideos = lazy(() => import('@/pages/MeusVideos'));
const Podcasts = lazy(() => import('@/pages/Podcasts'));
const PodcastDetalhe = lazy(() => import('@/pages/PodcastDetalhe'));
const MeusPodcasts = lazy(() => import('@/pages/MeusPodcasts'));
const Materias = lazy(() => import('@/pages/Materias'));
const MateriaDetalhe = lazy(() => import('@/pages/MateriaDetalhe'));
const PainelMaterias = lazy(() => import('@/pages/PainelMaterias'));
const MinhasMaterias = lazy(() => import('@/pages/MinhasMaterias'));
const MateriaForm = lazy(() => import('@/pages/MateriaForm'));
const Monitores = lazy(() => import('@/pages/Monitores'));
const MonitorDetalhe = lazy(() => import('@/pages/MonitorDetalhe'));
const CadastroMonitor = lazy(() => import('@/pages/CadastroMonitor'));
const MinhasReservas = lazy(() => import('@/pages/MinhasReservas'));
const Vagas = lazy(() => import('@/pages/Vagas'));
const VagaDetalhe = lazy(() => import('@/pages/VagaDetalhe'));
const MinhasVagas = lazy(() => import('@/pages/MinhasVagas'));
const CadastroVaga = lazy(() => import('@/pages/CadastroVaga'));
const Seguindo = lazy(() => import('@/pages/Seguindo'));
const Mapa = lazy(() => import('@/pages/Mapa'));
const InstalarApp = lazy(() => import('@/pages/InstalarApp'));
const Lancamentos = lazy(() => import('@/pages/Lancamentos'));
const MeusLancamentos = lazy(() => import('@/pages/MeusLancamentos'));
const CadastroLancamento = lazy(() => import('@/pages/CadastroLancamento'));
const Perfil = lazy(() => import('@/pages/Perfil'));
const Anuncie = lazy(() => import('@/pages/Anuncie'));
const Procuro = lazy(() => import('@/pages/Procuro'));
const ProcuraDetalhe = lazy(() => import('@/pages/ProcuraDetalhe'));
const Testadores = lazy(() => import('@/pages/Testadores'));
const TestadorDetalhe = lazy(() => import('@/pages/TestadorDetalhe'));
const CadastroTestador = lazy(() => import('@/pages/CadastroTestador'));
const MeusProcuros = lazy(() => import('@/pages/MeusProcuros'));
const CadastroProcura = lazy(() => import('@/pages/CadastroProcura'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

// Manda para o login lembrando a página pedida, para voltar a ela depois de entrar.
const LoginRedirect = () => {
  const location = useLocation();
  const returnTo = location.pathname + location.search;
  return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
};

// Páginas carregadas sob demanda: a Home vem no pacote principal e o resto
// (mapa, formulários, painel) só baixa quando a pessoa abre a página.
const PageFallback = () => (
  <LogoSpinner fullscreen />
);

const AuthenticatedApp = () => {
  const location = useLocation();
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <LogoSpinner fullscreen />
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <ErroPagina chave={location.pathname}>
    <Suspense fallback={<PageFallback />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/" element={<Home />} />
      <Route path="/lojas" element={<Lojas />} />
      <Route path="/lojas/:id" element={<LojaDetalhe />} />
      <Route path="/eventos" element={<Eventos />} />
      <Route path="/eventos/:id" element={<EventoDetalhe />} />
      <Route path="/materias" element={<Materias />} />
      <Route path="/materias/:slug" element={<MateriaDetalhe />} />
      <Route path="/sugerir" element={<SugerirEvento />} />
      <Route path="/cadastrar" element={<Cadastrar />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/influencers" element={<Influencers />} />
      <Route path="/influencers/:id" element={<CriadorDetalhe />} />
      <Route path="/podcasts" element={<Podcasts />} />
      <Route path="/podcasts/:id" element={<PodcastDetalhe />} />
      <Route path="/monitores" element={<Monitores />} />
      <Route path="/monitores/:id" element={<MonitorDetalhe />} />
      <Route path="/vagas" element={<Vagas />} />
      <Route path="/vagas/:id" element={<VagaDetalhe />} />
      <Route path="/mapa" element={<Mapa />} />
      <Route path="/seguindo" element={<Seguindo />} />
      <Route path="/app" element={<InstalarApp />} />
      <Route path="/lancamentos" element={<Lancamentos />} />
      <Route path="/anuncie" element={<Anuncie />} />
      <Route path="/procuro" element={<Procuro />} />
      <Route path="/procuro/:id" element={<ProcuraDetalhe />} />
      <Route path="/testadores" element={<Testadores />} />
      <Route path="/testadores/:id" element={<TestadorDetalhe />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<LoginRedirect />} />}>
        <Route path="/painel" element={<Painel />} />
        <Route path="/materias/nova" element={<MateriaForm />} />
        <Route path="/materias/minhas" element={<MinhasMaterias />} />
        <Route path="/materias/:slug/editar" element={<MateriaForm />} />
        <Route path="/painel/materias" element={<PainelMaterias />} />
        <Route path="/painel/materias/:id" element={<MateriaForm />} />
        <Route path="/painel/lojas/:id" element={<CadastroLoja />} />
        <Route path="/painel/eventos/:id" element={<CadastroEvento />} />
        <Route path="/painel/videos" element={<MeusVideos />} />
        <Route path="/painel/podcasts" element={<MeusPodcasts />} />
        <Route path="/painel/monitor" element={<CadastroMonitor />} />
        <Route path="/painel/reservas" element={<MinhasReservas />} />
        <Route path="/painel/vagas" element={<MinhasVagas />} />
        <Route path="/painel/lancamentos" element={<MeusLancamentos />} />
        <Route path="/painel/lancamentos/:id" element={<CadastroLancamento />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/painel/testador" element={<CadastroTestador />} />
        <Route path="/painel/procuro" element={<MeusProcuros />} />
        <Route path="/painel/procuro/:id" element={<CadastroProcura />} />
        <Route path="/painel/vagas/:id" element={<CadastroVaga />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
    </ErroPagina>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <SeoRoutes />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App