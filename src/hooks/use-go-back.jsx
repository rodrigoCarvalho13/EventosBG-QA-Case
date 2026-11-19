import { useNavigate } from "react-router-dom";

// "Voltar" que nunca tira a pessoa do site: se ela chegou direto por um link
// (ex.: compartilhado no WhatsApp) não há página anterior no histórico do app,
// então vai para a página de fallback em vez de sair para a aba anterior.
export function useGoBack(fallback = "/") {
  const navigate = useNavigate();
  return () => {
    const idx = window.history.state?.idx;
    if (typeof idx === "number" && idx > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  };
}
