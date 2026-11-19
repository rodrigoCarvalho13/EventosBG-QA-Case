import React from "react";

const CHAVE_RECARGA = "erro-pagina-recarga";

const erroDeChunk = (erro) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(
    String(erro?.message || erro)
  );

// Um deploy novo apaga os arquivos antigos; recarregar uma vez busca a versão atual.
export function recarregarUmaVez() {
  try {
    if (sessionStorage.getItem(CHAVE_RECARGA)) return false;
    sessionStorage.setItem(CHAVE_RECARGA, "1");
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

export default class ErroPagina extends React.Component {
  state = { erro: null };

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro) {
    console.error(erro);
    if (erroDeChunk(erro)) recarregarUmaVez();
  }

  componentDidUpdate(anterior) {
    if (this.state.erro && anterior.chave !== this.props.chave) this.setState({ erro: null });
  }

  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <div role="alert" className="min-h-screen grid place-items-center px-4 text-center">
        <div className="max-w-md">
          <h1 className="font-display font-700 text-2xl mb-2">Algo deu errado ao abrir esta página</h1>
          <p className="text-muted-foreground mb-4">
            Tente recarregar. Se continuar, volte para o início e abra a página de novo.
          </p>
          <p className="text-xs text-muted-foreground mb-4 break-words select-all">
            {String(this.state.erro?.message || this.state.erro).slice(0, 300)}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => window.location.reload()} className="rounded-md bg-primary text-primary-foreground px-4 h-11 font-600">
              Recarregar
            </button>
            <a href="/" className="rounded-md border border-border px-4 h-11 inline-flex items-center font-600">
              Ir para o início
            </a>
          </div>
        </div>
      </div>
    );
  }
}
