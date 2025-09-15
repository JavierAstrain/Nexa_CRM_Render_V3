# DB (PostgreSQL) para Nexa CRM

Este proyecto usa **Prisma** con PostgreSQL. Aunque el esquema vive en `/backend/prisma/schema.prisma`,
aquí tienes utilidades relacionadas con la base de datos.

## Migraciones y Seed
- Ejecuta migraciones: `pnpm prisma migrate dev`
- Genera el cliente: `pnpm prisma generate`
- Carga datos de ejemplo (seed): `pnpm prisma db seed` o `pnpm ts-node src/seed.ts`

> En Docker Compose, el backend corre `prisma migrate deploy` al iniciar en modo dev.
