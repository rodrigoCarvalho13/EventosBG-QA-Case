# AGENTS.md

## Project Context

This is a Base44 app repository. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and publish workflow.

## Base44 References

- CLI overview: https://docs.base44.com/developers/references/cli/get-started/overview.md
- Agent skills: https://docs.base44.com/developers/backend/overview/skills.md

If your agent supports Agent Skills, install or update Base44 skills before Base44-specific work:

```bash
npx skills add base44/skills
```

## Key Files

- `src/`: frontend application source.
- `src/api/base44Client.js`: frontend Base44 SDK client.
- `vite.config.js`: Vite config and Base44 Vite plugin setup.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `base44 dev` as the default local development command when you need the local Base44 backend. It can run the backend and frontend together.
- When docs or code mention the frontend being started automatically, that usually means the Base44 project config includes `site.serveCommand`, for example `"serveCommand": "npm run dev"` in `base44/config.jsonc`.
- Use `npm run dev` only for frontend-only work against the hosted Base44 backend.
- Prefer the existing Base44 CLI workflow over adding new npm scripts for Base44-specific tasks.
- Reuse the existing SDK client and Vite plugin patterns before adding new Base44 integration paths.
- Run the relevant checks from `package.json` before finishing code changes.

## RLS no Base44 (leitura)

A sintaxe usada neste repositório, conferida nas entidades existentes:

- Leitura pública irrestrita: `"read": {}`. É o caso de Criador, Podcast, Video, Episodio, Pergunta, Parceria, Seguindo e AvaliacaoMonitor. Objeto vazio não nega a leitura.
- Leitura pública condicional: `"read": { "$or": [ { "data.<campo>": <valor> }, { "created_by_id": "{{user.id}}" }, { "user_condition": { "role": "admin" } } ] }`. Loja e Comentario usam `data.status` aprovado; Programacao segue o mesmo desenho; Monitor usa `data.publicado: true` ou dono (`data.owner_id` / `created_by_id`) ou admin.
- Só admin: `{ "user_condition": { "role": "admin" } }`. Suporte na leitura; criação e atualização de Monitor, ReservaMonitor e AvaliacaoMonitor.
- Leitura privada de participante: `$or` de `data.cliente_id`, `data.monitor_owner_id` (ou o papel equivalente) e admin. Inscricao e ReservaMonitor. Não é pública.

RLS não esconde campo dentro do registro. Dado que não pode aparecer na leitura pública sai do schema (AvaliacaoMonitor não tem `cliente_id`; Monitor não tem WhatsApp, Instagram nem e-mail). O nome público da avaliação é só o primeiro nome, em `cliente_nome`. Idade e gênero do monitor continuam no perfil público, porque a pessoa escolhe exibir. O contato fica em `ContatoMonitor`, com leitura só do dono (`data.owner_id`), de quem criou o registro ou de admin. Quem reservou só recebe o contato pela função `lerContatoMonitor`, e apenas com reserva `confirmada`, `paga` ou `finalizada`. Validação em `base44/shared/contatoMonitor.js`.

## Publicação (regra do dono do projeto)

Sempre que uma mudança for para a `main`, publique no Base44 logo em seguida, para as últimas atualizações ficarem on-line:

1. Faça o merge na `main`.
2. Puxe a `main` para o Base44: `POST /api/apps/{app_id}/github/sync` (confira que `latest_commit_hash` é o commit novo da `main`).
3. Publique: `POST /api/apps/{app_id}/deploy` e confira que `last_deployed_git_commit_hash` é esse mesmo commit.

- App: **EventosBG**, `app_id` `6ac9783cda52a3915aaaacd6` (site: eventosboardgame.com).
- Antes de publicar, confira que o `status.state` do app não é `processing`.
- Se a publicação falhar, avise o dono com o erro; não deixe a `main` à frente do site sem dizer.
