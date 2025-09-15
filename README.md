# Nexa CRM — SaaS listo para producción

**Stack**
- Frontend: React + Vite + TypeScript + Tailwind + Headless UI + Apollo Client + Recharts
- Backend: Node.js + TypeScript + Express + Apollo Server (GraphQL) + Prisma (PostgreSQL)
- Auth: JWT, soporte opcional SSO (OAuth2 y SAML) vía Passport (simulado)
- Contenedores: Docker / Docker Compose
- Deploy: Render.com (`render.yaml` incluido)

## Estructura
```
/frontend     → UI React (dashboard, tablas, kanban, CPQ, workflows, widget chat, etc.)
/backend      → API GraphQL + REST de leads, scoring, RAG simulado, workflows
/db           → prisma schema y seeds
render.yaml   → definición de servicios Render (backend + static frontend + PostgreSQL)
docker-compose.yml → entorno local completo
```

## Variables de entorno
Crea un archivo `.env` en `/backend` (y opcionalmente `/frontend`) con:

```
# Backend
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://postgres:postgres@db:5432/nexa?schema=public
JWT_SECRET=supersecreto_cambia_esto
CORS_ORIGIN=http://localhost:5173

# OAuth opcional (si usas Google, Okta, Auth0, etc.)
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=
OAUTH_GOOGLE_CALLBACK_URL=http://localhost:8080/auth/google/callback

# SAML opcional
SAML_ENTRY_POINT=
SAML_ISSUER=
SAML_CALLBACK_URL=http://localhost:8080/auth/saml/callback
SAML_PUBLIC_CERT=
SAML_PRIVATE_KEY=

# Frontend (si deseas configurar endpoint en build)
VITE_GRAPHQL_URL=http://localhost:8080/graphql
VITE_REST_URL=http://localhost:8080
```

> En Render, el servicio Postgres gestionado provee su `DATABASE_URL`. Ajusta `CORS_ORIGIN` al dominio final del frontend.

## Desarrollo local
1) **Arranca con Docker Compose** (recomendado):
```bash
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend:  http://localhost:8080/graphql

2) **Sin Docker** (requiere Node 18+, pnpm o npm y PostgreSQL local):
```bash
# Backend
cd backend
pnpm i
pnpm prisma migrate dev
pnpm dev

# Frontend
cd ../frontend
pnpm i
pnpm dev
```

## Despliegue en Render
- `render.yaml` crea:
  - **nexa-backend** (Web Service, Dockerfile)
  - **nexa-frontend** (Static Site, Vite build)
  - **nexa-postgres** (Managed PostgreSQL)
- En Render, configura variables de entorno del backend. El frontend usará `VITE_GRAPHQL_URL` apuntando al backend público.

## Módulos incluidos
- **Core CRM**: contactos, cuentas, oportunidades, actividades (Task/Call/Meeting/Note), listas, filtros, edición inline, acciones masivas, vista Kanban.
- **Integraciones**: simulación de sincronización con Calendar/Email, modelo `EmailThread`.
- **CPQ**: productos, listas de precios, cotizaciones con editor en tiempo real.
- **Leads**: endpoint REST `/api/leads` y widget web de captura.
- **IA & Copiloto**: scoring 0–100, respuestas simuladas (resúmenes, next‑best action), RAG simulado con dataset ficticio.
- **Analítica**: funnel, win‑rate, sales velocity, dashboards con gráficos.
- **Automatización**: Workflow Builder no‑code (triggers y actions simples) + ejecución simulada.

## Usuarios demo
El seed crea un usuario admin:
```
email: admin@nexa.dev
password: nexa1234
```
Puedes crear más usuarios desde la UI o via GraphQL.

## Seguridad y permisos a nivel de campo
Ejemplo: si el rol del usuario no incluye `viewFinancials`, ciertos campos sensibles (p. ej. `amount`, `revenue`) serán enmascarados en resolvers.

---

Hecho con ❤️ para Nexa.
