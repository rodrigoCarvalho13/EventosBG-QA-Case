import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const LADO = 288; // área de enquadramento na tela (px)
const SAIDA = 1000; // lado da foto final (px)

// Deixa a pessoa arrastar e dar zoom na foto dentro de um quadrado, igual ao que o perfil mostra.
export default function FotoEnquadrar({ file, onCancel, onConfirm }) {
  const [img, setImg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [salvando, setSalvando] = useState(false);
  const arrasto = useRef(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const el = new window.Image();
    el.onload = () => setImg(el);
    el.onerror = () => onCancel("Não foi possível abrir essa foto.");
    el.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const base = img ? LADO / Math.min(img.naturalWidth, img.naturalHeight) : 1;
  const largura = img ? img.naturalWidth * base * zoom : LADO;
  const altura = img ? img.naturalHeight * base * zoom : LADO;
  const limitar = (p, w = largura, h = altura) => ({
    x: Math.min(0, Math.max(LADO - w, p.x)),
    y: Math.min(0, Math.max(LADO - h, p.y)),
  });

  useEffect(() => {
    if (img) setPos(limitar({ x: (LADO - largura) / 2, y: (LADO - altura) / 2 }));
  }, [img]);

  const mudarZoom = (novo) => {
    const w = img.naturalWidth * base * novo;
    const h = img.naturalHeight * base * novo;
    // mantém o centro do enquadramento no mesmo ponto da foto
    const cx = (LADO / 2 - pos.x) / largura;
    const cy = (LADO / 2 - pos.y) / altura;
    setZoom(novo);
    setPos(limitar({ x: LADO / 2 - cx * w, y: LADO / 2 - cy * h }, w, h));
  };

  const mover = (e) => {
    if (!arrasto.current) return;
    setPos(limitar({ x: arrasto.current.x + e.clientX - arrasto.current.cx, y: arrasto.current.y + e.clientY - arrasto.current.cy }));
  };

  const confirmar = async () => {
    setSalvando(true);
    const canvas = document.createElement("canvas");
    canvas.width = SAIDA;
    canvas.height = SAIDA;
    const ctx = canvas.getContext("2d");
    const k = SAIDA / LADO;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SAIDA, SAIDA);
    ctx.drawImage(img, pos.x * k, pos.y * k, largura * k, altura * k);
    const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.88));
    if (!blob) return onCancel("Não foi possível recortar a foto.");
    onConfirm(new File([blob], "perfil.jpg", { type: "image/jpeg" }));
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Enquadrar foto" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-4 space-y-3">
        <p className="font-600">Enquadre sua foto</p>
        <p className="text-sm text-muted-foreground">Arraste para posicionar e use o zoom. O perfil mostra exatamente este quadrado.</p>
        <div
          className="relative mx-auto overflow-hidden rounded-2xl bg-muted touch-none cursor-grab"
          style={{ width: LADO, height: LADO, maxWidth: "100%" }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            arrasto.current = { cx: e.clientX, cy: e.clientY, x: pos.x, y: pos.y };
          }}
          onPointerMove={mover}
          onPointerUp={() => { arrasto.current = null; }}
          onPointerCancel={() => { arrasto.current = null; }}
        >
          {img ? (
            <img src={img.src} alt="" draggable={false} className="absolute max-w-none select-none" style={{ width: largura, height: altura, left: pos.x, top: pos.y }} />
          ) : (
            <Loader2 className="absolute inset-0 m-auto w-6 h-6 animate-spin" aria-hidden="true" />
          )}
        </div>
        <label className="flex items-center gap-3 text-sm font-600">
          Zoom
          <input type="range" min="1" max="3" step="0.05" value={zoom} disabled={!img} onChange={(e) => mudarZoom(Number(e.target.value))} className="flex-1 h-11" />
        </label>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={() => onCancel("")}>Cancelar</Button>
          <Button type="button" disabled={!img || salvando} onClick={confirmar}>
            {salvando ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null} Usar foto
          </Button>
        </div>
      </div>
    </div>
  );
}
