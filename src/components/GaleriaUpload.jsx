import React, { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { enviarImagem } from "@/lib/uploadImagem";
import { imagemOtimizada } from "@/lib/imagemOtimizada";

const LIMITE = 30;
const MAX_BYTES = 10 * 1024 * 1024;
const TIPOS = ["image/jpeg", "image/png", "image/webp"];

function erroArquivo(arquivo) {
  const nome = String(arquivo?.name || "").toLowerCase();
  const tipoOk = TIPOS.includes(arquivo?.type) || /\.(jpe?g|png|webp)$/.test(nome);
  if (!tipoOk) return `${arquivo?.name || "Arquivo"}: use JPG, PNG ou WebP.`;
  if (arquivo.size > MAX_BYTES) return `${arquivo.name}: cada foto pode ter no máximo 10 MB.`;
  return "";
}

export default function GaleriaUpload({ fotos = [], onChange, onBusyChange = null }) {
  const inputRef = useRef(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [arrastando, setArrastando] = useState(false);
  const [origem, setOrigem] = useState(null);

  const aplicar = (lista) => {
    const cortada = lista.slice(0, LIMITE);
    if (!cortada.some((foto) => foto.capa) && cortada[0]) cortada[0] = { ...cortada[0], capa: true };
    onChange(cortada.map((foto, indice) => ({ ...foto, capa: cortada.some((item) => item.capa) ? foto.capa : indice === 0 })));
  };

  const marcarCapa = (indice) => aplicar(fotos.map((foto, i) => ({ ...foto, capa: i === indice })));

  const mover = (de, para) => {
    if (para < 0 || para >= fotos.length || de === para) return;
    const lista = [...fotos];
    const [item] = lista.splice(de, 1);
    lista.splice(para, 0, item);
    aplicar(lista);
  };

  const adicionarArquivos = async (arquivos) => {
    const lista = [...arquivos];
    if (!lista.length) return;
    setErro("");
    const mensagens = [];
    const aceitos = [];
    for (const arquivo of lista) {
      const msg = erroArquivo(arquivo);
      if (msg) mensagens.push(msg);
      else aceitos.push(arquivo);
    }
    if (fotos.length >= LIMITE) {
      setErro(`A galeria aceita no máximo ${LIMITE} fotos.`);
      return;
    }
    setEnviando(true);
    onBusyChange?.(true);
    const novas = [];
    try {
      for (const arquivo of aceitos) {
        if (fotos.length + novas.length >= LIMITE) {
          mensagens.push(`Parou em ${LIMITE} fotos.`);
          break;
        }
        const url = await enviarImagem(arquivo);
        novas.push({ url, legenda: "", capa: false });
      }
      if (novas.length) aplicar([...fotos, ...novas]);
    } catch (err) {
      mensagens.push(err.message || "Não foi possível enviar a foto.");
    } finally {
      setEnviando(false);
      onBusyChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
      if (mensagens.length) setErro(mensagens[0]);
    }
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <p className="text-sm font-600">Fotos</p>
        <span className="text-xs text-muted-foreground">{fotos.length}/{LIMITE}</span>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">A estrela escolhe a miniatura dos cards, da home e do compartilhamento. JPG, PNG ou WebP, até 10 MB cada.</p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fotos.map((foto, indice) => (
          <li
            key={`${foto.url}-${indice}`}
            draggable
            onDragStart={() => setOrigem(indice)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => { mover(origem, indice); setOrigem(null); }}
            className="rounded-xl border border-border bg-card p-3"
          >
            <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded-lg bg-board">
              <img
                {...imagemOtimizada(foto.url, { width: 480, height: 360, crop: true })}
                alt={foto.legenda || `Foto ${indice + 1} da galeria`}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => marcarCapa(indice)}
                aria-pressed={!!foto.capa}
                aria-label={foto.capa ? `Miniatura atual, foto ${indice + 1}` : `Usar foto ${indice + 1} como miniatura`}
                className={`absolute left-2 top-2 grid h-11 w-11 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${foto.capa ? "bg-accent text-accent-foreground" : "bg-black/60 text-white"}`}
              >
                <Star className={`h-4 w-4 ${foto.capa ? "fill-current" : ""}`} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => aplicar(fotos.filter((_, i) => i !== indice))}
                className="absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label={`Remover foto ${indice + 1}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <label className="sr-only" htmlFor={`legenda-${indice}`}>Legenda da foto {indice + 1}</label>
            <input
              id={`legenda-${indice}`}
              value={foto.legenda || ""}
              onChange={(event) => aplicar(fotos.map((item, i) => i === indice ? { ...item, legenda: event.target.value } : item))}
              placeholder="Legenda (opcional)"
              maxLength={180}
              className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-base lg:h-9 lg:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="mt-2 flex gap-2">
              <button type="button" className="min-h-11 flex-1 rounded-md border border-border text-sm font-600 disabled:opacity-40" disabled={indice === 0} onClick={() => mover(indice, indice - 1)}>Subir</button>
              <button type="button" className="min-h-11 flex-1 rounded-md border border-border text-sm font-600 disabled:opacity-40" disabled={indice === fotos.length - 1} onClick={() => mover(indice, indice + 1)}>Descer</button>
            </div>
          </li>
        ))}
      </ul>
      <div
        onDragOver={(event) => { event.preventDefault(); setArrastando(true); }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(event) => {
          event.preventDefault();
          setArrastando(false);
          adicionarArquivos(event.dataTransfer.files);
        }}
        className={`mt-3 rounded-2xl border border-dashed px-4 py-6 text-center ${arrastando ? "border-accent bg-accent/10" : "border-border"}`}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={enviando || fotos.length >= LIMITE}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-600 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          {enviando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ImagePlus className="h-4 w-4" aria-hidden="true" />}
          {enviando ? "Enviando…" : "Escolher fotos ou soltar aqui"}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => adicionarArquivos(event.target.files)} className="hidden" />
      {erro && <p role="alert" className="mt-1.5 text-sm text-destructive">{erro}</p>}
    </div>
  );
}
