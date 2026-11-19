// Instalar o site como aplicativo. O navegador avisa uma vez, logo ao abrir, que dá para
// instalar (beforeinstallprompt); guardamos o aviso para o botão usar depois.
import { useSyncExternalStore } from "react";

let aviso = null;
let instalado = false;
const ouvintes = new Set();
const avisar = () => ouvintes.forEach((fn) => fn());

export function iniciarInstalacao() {
  if (typeof window === "undefined") return;
  instalado = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    aviso = e;
    avisar();
  });
  window.addEventListener("appinstalled", () => {
    aviso = null;
    instalado = true;
    avisar();
  });
}

const assinar = (fn) => { ouvintes.add(fn); return () => ouvintes.delete(fn); };
const foto = () => (instalado ? "instalado" : aviso ? "pronto" : "manual");

export const ehIOS = () =>
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

// "instalado", "pronto" (o navegador instala com um toque) ou "manual" (passo a passo).
export function useInstalacao() {
  return useSyncExternalStore(assinar, foto, () => "manual");
}

export async function instalar() {
  if (!aviso) return false;
  const e = aviso;
  aviso = null;
  avisar();
  await e.prompt();
  const escolha = await e.userChoice.catch(() => null);
  return escolha?.outcome === "accepted";
}
