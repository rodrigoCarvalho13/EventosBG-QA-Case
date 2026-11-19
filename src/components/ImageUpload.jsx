import React, { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { enviarImagem } from "@/lib/uploadImagem";
import { Image } from "@/components/ui/image";
import FotoEnquadrar from "@/components/FotoEnquadrar";

export default function ImageUpload({ value, onChange, label = "Foto", onBusyChange = null, enquadrar = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [paraEnquadrar, setParaEnquadrar] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    if (enquadrar && !/image\/(gif|svg)/.test(file.type)) {
      setError("");
      setParaEnquadrar(file);
      return;
    }
    await enviar(file);
  };

  const enviar = async (file) => {
    setUploading(true);
    onBusyChange?.(true);
    setError("");
    try {
      onChange(await enviarImagem(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      onBusyChange?.(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-600 mb-1.5">{label}</label>
      <div className={`relative rounded-xl overflow-hidden border border-border bg-muted w-full max-w-sm ${enquadrar ? "aspect-square" : "aspect-[4/3]"}`}>
        {value ? (
          <>
            <Image src={value} alt="Pré-visualização" fittingType="fill" className="w-full h-full" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 grid place-items-center w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Remover imagem"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label={label}
            className="w-full h-full grid place-items-center text-muted-foreground hover:bg-muted/60 transition-colors"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-primary" aria-hidden="true" />
                <span className="text-sm">Enviando…</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImagePlus className="w-8 h-8" aria-hidden="true" />
                <span className="text-sm font-500">Adicionar foto</span>
              </div>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      {paraEnquadrar && (
        <FotoEnquadrar
          file={paraEnquadrar}
          onCancel={(msg) => { setParaEnquadrar(null); if (msg) setError(msg); }}
          onConfirm={(recortada) => { setParaEnquadrar(null); enviar(recortada); }}
        />
      )}
      {error && <p role="alert" className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}