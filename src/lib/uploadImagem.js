import { base44 } from "@/api/base44Client";

// Fotos de celular costumam ter 4-15 MB (ou vir em HEIC, no iPhone). Antes de
// enviar, reduzimos para no máximo 1600px e convertemos para JPEG: o envio
// fica rápido, passa nos limites do Base44 e qualquer navegador exibe a foto.
const MAX_LADO = 1600;
const QUALIDADE = 0.85;
// Toda foto enviada fica abaixo deste tamanho (com folga sob os 5 MB).
export const LIMITE_BYTES = 4.5 * 1024 * 1024;

async function carregar(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // alguns navegadores não aceitam a opção ou o formato; tenta via <img>
    }
  }
  return await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("formato não suportado"));
    };
    img.src = url;
  });
}

export async function prepararImagem(file) {
  // GIF animado e SVG vão como estão (redimensionar quebraria a animação/vetor).
  if (/image\/(gif|svg)/.test(file.type)) return file;
  try {
    const img = await carregar(file);
    const w = img.width || img.naturalWidth;
    const h = img.height || img.naturalHeight;
    if (!w || !h) return file;
    let escala = Math.min(1, MAX_LADO / Math.max(w, h));
    // Já é pequena e leve: não mexe.
    if (escala === 1 && file.size < 1.5 * 1024 * 1024 && /jpe?g|png|webp/.test(file.type)) return file;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let qualidade = QUALIDADE;
    let blob = null;
    // Comprime e, se ainda passar do limite, reduz qualidade e tamanho até caber.
    for (let tentativa = 0; tentativa < 8; tentativa++) {
      canvas.width = Math.max(1, Math.round(w * escala));
      canvas.height = Math.max(1, Math.round(h * escala));
      ctx.fillStyle = "#ffffff"; // PNG transparente vira fundo branco no JPEG
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", qualidade));
      if (!blob || blob.size <= LIMITE_BYTES) break;
      if (qualidade > 0.6) qualidade -= 0.1;
      else escala *= 0.8;
    }
    if (!blob) return file;
    const nome = (file.name || "foto").replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nome, { type: "image/jpeg" });
  } catch {
    // Não conseguiu ler (ex.: HEIC no Chrome do Windows): envia o original.
    return file;
  }
}

function mensagemDeErro(err, file) {
  const status = err?.status || err?.response?.status;
  const msg = String(err?.message || err?.data?.message || "");
  if (status === 401 || status === 403) return "Sua sessão expirou. Entre de novo e tente enviar a foto.";
  if (status === 413 || /large|size|tamanho/i.test(msg)) return "A foto é grande demais. Tente outra ou tire um print dela.";
  if (/heic|heif/i.test(file?.type || file?.name || "")) return "Não foi possível ler essa foto (formato HEIC). No iPhone, tente enviar como JPEG ou tire um print.";
  if (!navigator.onLine || /network|timeout|failed to fetch/i.test(msg)) return "Sem conexão. Verifique a internet e tente de novo.";
  return "Não foi possível enviar a foto. Tente de novo ou use outra imagem.";
}

// Envia uma imagem (já otimizada) e devolve a URL pública.
export async function enviarImagem(file) {
  const pronta = await prepararImagem(file);
  if (pronta.size > LIMITE_BYTES) {
    throw new Error("Não foi possível diminuir essa foto para menos de 5 MB. Tente outra ou tire um print dela.");
  }
  try {
    const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: pronta });
    if (!file_url) throw new Error("sem url");
    return file_url;
  } catch (err) {
    console.error("Falha no envio da imagem:", err);
    throw new Error(mensagemDeErro(err, file));
  }
}
