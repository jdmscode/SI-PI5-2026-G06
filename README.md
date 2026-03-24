# Melanoma Mapper Pro

Frontend React (Vite) para mapeamento anatômico e fluxo de análise de melanoma.

## Desenvolvimento

```bash
npm install
npm run dev
```

**Ambiente:** ficheiro `.env` na raiz, com base no `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Variáveis `VITE_*` são lidas em tempo de build; reiniciar `npm run dev` após alterações.

## API

Cliente em `src/lib/api/`. Contratos em `src/lib/api/types.ts`. Rotas usadas em `src/lib/api/requests.ts`:

| Método | Caminho | Resposta (resumo) |
|--------|---------|-------------------|
| `POST` | `/auth/login` | `{ accessToken, user? }` |
| `GET` | `/auth/me` | `UserProfile` |
| `GET` | `/dashboard/summary` | `DashboardSummary` |
| `GET` | `/patients` | `PatientListItem[]` |
| `GET` | `/patients/:id` | `PatientDetail` |
| `GET` | `/patients/:id/lesions` | `LesionTimelineEntry[]` |
| `GET` | `/analyses/:id` | `AnalysisDetail` |

Sessão: token em `sessionStorage`, cabeçalho `Authorization: Bearer …`.

## Scripts

- `npm run build` — produção
- `npm run test` — Vitest
- `npx playwright test` — E2E
- `node scripts/inspect-glb.js` — inspeção do `human-body.glb` (hierarquia e bbox)
