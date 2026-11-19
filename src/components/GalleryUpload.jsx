import React, { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { enviarImagem } from "@/lib/uploadImagem";
import { Image } from "@/components/ui/image";

export default function GalleryUpload({ value = [], onChange, onBusyChange, label = "Galeria de fotos", hint = "Adicione várias fotos do ambiente. Elas aparecem em um carrossel na página da loja." }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progresso, setProgresso] = useState(null);
  const [error, setError] = useState("");
  const images = Array.isArray(value) ? value : [];

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    onBusyChange?.(true);
    setError("");
    try {
      // Envia uma a uma; cada foto entra na galeria assim que termina de subir,
      // e as que deram certo ficam mesmo se alguma falhar.
      const urls = [];
      let falha = null;
      for (const [k, file] of files.entries()) {
        setProgresso({ atual: k + 1, total: files.length });
        try {
          urls.push(await enviarImagem(file));
          onChange([...images, ...urls]);
        } catch (err) {
          falha = err;
        }
      }
      if (falha) {
        setError(urls.length ? `${urls.length} foto(s) enviada(s). ${falha.message}` : falha.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setProgresso(null);
      onBusyChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (i) => onChange(images.filter((_, idx) => idx !== i));

  return (
    <div>
      <label className="block text-sm font-600 mb-1.5">{label}</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {images.map((url, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted"
          >
            <Image src={url} alt={`Foto ${i + 1}`} fittingType="fill" className="w-full h-full" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 grid place-items-center w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Remover foto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="aspect-square rounded-lg border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <ImagePlus className="w-6 h-6" />
              <span className="text-xs font-500">Adicionar</span>
            </div>
          )}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      {progresso && (
        <p role="status" className="mt-1.5 text-sm text-muted-foreground">
          Enviando foto {progresso.atual} de {progresso.total}… aguarde antes de salvar.
        </p>
      )}
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
      <p className="mt-1.5 text-xs text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}