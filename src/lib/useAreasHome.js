import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { filtroEstado } from "@/lib/regiao";
import { filtrarMonitores } from "@/lib/monitores";
import { listarTudo, listarPorIds } from "@/lib/paginar";
import { situacao, ordenarLancamentos } from "@/lib/lancamentos";
import { vencido } from "@/lib/procuro";
import { CAMPOS_MATERIA_LISTA, materiaPublicada, ordenarMaterias } from "@/lib/materias";

const CAMPOS_MONITOR = [
  "name", "slug", "photo_url", "jogos", "estilos", "servicos", "tipos_evento", "idade", "genero", "preco_hora",
  "locais", "cidades", "bairros", "nota_media", "total_avaliacoes", "publicado", "created_date",
];

const VAZIO = {
  monitores: [], influencers: [], podcasts: [], lancamentos: [], editorasLanc: new Map(),
  procuras: [], testadores: [], vagas: [], materias: [],
};

// Tudo o que as outras áreas do site têm cadastrado, para a home mostrar e contar.
// Cada lista vem completa (até o limite da busca) para o número da aba ser verdadeiro.
export default function useAreasHome(sigla) {
  const [dados, setDados] = useState(VAZIO);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    const filtro = filtroEstado(sigla);
    const seguro = (p, vazio) => p.catch(() => vazio);
    Promise.all([
      seguro(
        listarTudo(base44.entities.Monitor, { publicado: true }, { sort: "-created_date", limit: 100, fields: CAMPOS_MONITOR }).then((itens) =>
          filtrarMonitores(itens, { estado: sigla })
            .filter((m) => m && m.publicado !== false)
            .sort((a, b) => (Number(b.nota_media) || 0) - (Number(a.nota_media) || 0) || String(b.created_date || "").localeCompare(String(a.created_date || "")))
        ),
        []
      ),
      seguro(
        base44.entities.Criador.filter({ influencer: true }, { sort: "-ultimo_video_em", limit: 100, fields: ["name", "slug", "photo_url", "bio", "influencer", "instagram", "youtube", "tiktok", "ultimo_video_em"] }).then((p) => p.items || []),
        []
      ),
      seguro(base44.entities.Podcast.filter({}, { sort: "-created_date", limit: 100, fields: ["name", "slug", "photo_url", "bio"] }).then((p) => p.items || []), []),
      seguro(
        listarTudo(base44.entities.Lancamento, { status: "publicado" }, { sort: "data_inicio", limit: 100 }).then(async (lista) => {
          const ativos = ordenarLancamentos(lista.filter((l) => situacao(l) !== "encerrado"));
          const ls = await listarPorIds(base44.entities.Loja, "id", ativos.slice(0, 6).map((l) => l.editora_id), { fields: ["slug", "name"] }).catch(() => []);
          return { ativos, editoras: new Map(ls.map((l) => [l.id, l])) };
        }),
        { ativos: [], editoras: new Map() }
      ),
      seguro(base44.entities.Procura.filter({ status: "ativo", ...filtro }, { sort: "-created_date", limit: 100 }).then((p) => (p.items || []).filter((x) => !vencido(x))), []),
      seguro(base44.entities.Testador.filter({ status: "ativo", ...filtro }, { sort: "-created_date", limit: 100 }).then((p) => p.items || []), []),
      seguro(base44.entities.Vaga.filter({ status: "aberta", ...filtro }, { sort: "-created_date", limit: 100 }).then((p) => p.items || []), []),
      seguro(
        listarTudo(base44.entities.Materia, { publicada: true, ...filtro }, { sort: "-publicada_em", limit: 50, maxPaginas: 2, fields: CAMPOS_MATERIA_LISTA }).then((itens) => ordenarMaterias(itens.filter(materiaPublicada))),
        []
      ),
    ]).then(([monitores, influencers, podcasts, lanc, procuras, testadores, vagas, materias]) => {
      if (!ativo) return;
      setDados({ monitores, influencers, podcasts, lancamentos: lanc.ativos, editorasLanc: lanc.editoras, procuras, testadores, vagas, materias });
      setCarregando(false);
    });
    return () => { ativo = false; };
  }, [sigla]);

  return { ...dados, carregando };
}
