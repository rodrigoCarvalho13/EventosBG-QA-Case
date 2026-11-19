import { invocar } from "@/lib/monitoresApi";

export {
  CAMPOS_MATERIA,
  CAMPOS_MATERIA_LISTA,
  TAGS_HTML,
  dataVisivel,
  filtrarEstilo,
  formatarDataLonga,
  materiaExcluida,
  materiaPath,
  materiaPublicada,
  materiasRelacionadas,
  nomePublico,
  normalizarTags,
  ordenarMaterias,
  podeDenunciar,
  podeEditarMateria,
  podeRepublicar,
  repararEntidades,
  sanitizarHtml,
  validarMateria,
} from "../../base44/shared/materias.js";

export function salvarMateria(payload) {
  return invocar("salvarMateria", payload);
}

export function denunciarMateria(payload) {
  return invocar("denunciarMateria", payload);
}
