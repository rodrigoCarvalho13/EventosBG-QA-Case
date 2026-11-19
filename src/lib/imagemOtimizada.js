import { buildSrcSet, buildTransformUrl, parseWixMediaUrl } from "@/components/ui/image-helpers";

// Props de <img> (src + srcSet) com a foto já redimensionada pelo servidor.
// As fotos enviadas têm até 1600px; num card de ~300px isso é muito byte à toa.
// `crop` corta para preencher a caixa; sem ele a foto cabe inteira nela.
// `larguras` troca o srcset de densidade (1x/2x/3x) por um de largura (w): com `sizes`,
// o navegador baixa só o tamanho que a tela precisa, em vez de 3x o da caixa.
// A imagem entregue sai em WebP/AVIF quando o navegador aceita (enc_auto).
// URLs que não são do Base44 (ou SVG) voltam sem alteração.
export function imagemOtimizada(url, { width, height = width, crop = false, quality = 80, larguras }) {
  const parsed = url ? parseWixMediaUrl(url) : null;
  if (!parsed) return { src: url };
  const opts = { width, height, crop, quality };
  if (Array.isArray(larguras) && larguras.length) {
    const srcSet = larguras
      .map((w) => `${buildTransformUrl(parsed, { ...opts, width: w, height: Math.round((w * height) / width) })} ${w}w`)
      .join(", ");
    return { src: buildTransformUrl(parsed, opts), srcSet };
  }
  return { src: buildTransformUrl(parsed, opts), srcSet: buildSrcSet(parsed, opts) };
}
