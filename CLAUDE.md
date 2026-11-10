# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

"grp" is a Create React App (react-scripts 5) frontend for Asinova's time-tracking / project-management tool. Users log work time entries (**registros**) against a hierarchy **clientes → centros → proyectos**; administrators also manage **usuarios**. The UI and code identifiers are in Spanish. The app is deployed under `https://www.asinova.es/grp` (`homepage` in package.json, `basename="/grp"` in `src/index.js`). The backend (REST + Socket.IO at `/webapi`) is a separate project that is not in this repo.

## Commands

- `npm start` — dev server at http://localhost:3000/grp
- `npm run build` — production build into `build/`
- `npm test` — Jest watch mode; run one file with `npm test -- src/App.test.js`, or by name with `npm test -- -t "name"`. Use `CI=true npm test` to run once without watch mode.
- There is no separate lint or typecheck script. ESLint runs through react-scripts (`react-app` config). For a type check, run `npx tsc --noEmit` (tsconfig has `strict` on and `noEmit`).

The only test (`src/App.test.js`) is the CRA placeholder. It fails, because App needs the Router and DataProvider and contains no "learn react" text.

## Architecture

**Mixed JS/TS.** The entry point (`index.js`), `App.js` and `theme.js` are JavaScript; everything else is `.tsx`. The current branch is `typescript`, so the migration is in progress. Imports include the `.tsx` extension explicitly (e.g. `import api from './Api.tsx'`), which `allowImportingTsExtensions` permits; follow that convention. Types are loose: entities are typed as `Record<string, any>` (`elemento`), and `useData` is typed `any`.

**Backend target (`src/Api.tsx`).** `secure` is a hardcoded flag that switches `host` between production `https://www.asinova.es` and local `http://localhost:8080`. Point it at localhost to develop against a local backend, and switch it back before committing or building. `api` is an axios instance with `withCredentials: true`; auth uses HTTP-only cookies. A response interceptor catches a 401, calls `POST refresh` once, and retries the original request.

**Realtime (`src/Socket.tsx`).** A single module-level socket.io client connects to `host` with `path: /webapi/socket.io` and websocket transport only. On a `TOKEN_EXPIRED` connect error it refreshes the token and reconnects.

**Global state (`src/DataContext.tsx`).** `DataProvider` is the core of the app:
- On mount it calls `POST usuario` to restore the session. `init(body, 'login' | 'register' | ...)` is how Login and Register authenticate. Both paths connect the socket and set `usuario`.
- When `usuario.id` changes, it loads every table (`clientes/abierto-cerrado`, `centros/abierto-cerrado`, `proyectos/orden-cc/abierto-cerrado`, `usuarios/abierto-cerrado`, `registros/ccpu`). It then subscribes to socket events named `{insert|update|delete}-{clientes|centros|proyectos|usuarios|registros}`.
- Socket handlers patch local state directly instead of refetching. They are index-based: `i` is the action and `j` is the table, matching the `acciones`, `tablas` and `sets` arrays. They also keep the sort order (by client, then centre, then project name, and by date descending for registros). They cascade changes: renaming a parent rewrites the denormalized name fields in registros, and closing or reopening a project or user removes or refetches that one's registros. Changes here should keep the `j` indices aligned with those arrays.
- "Open" means a different field per entity: `abierto` for clientes and centros, `fin == null` for proyectos and registros, and `operativo` for usuarios. If the current user stops being `operativo`, they are logged out automatically.
- Derived lists (`clientes_abiertos`, `centros_con_proyecto`, etc.) and the lookup refs `getClienteByCentro`, `getCentroByProyecto` and `getClienteByProyecto` (call them with `.current(x)`) are exposed through `useData()`.

**Mutations.** Components call `api.post`, `api.put` or `api.delete` and generally do not update local state themselves. The resulting socket broadcast updates every connected client, including the sender.

**Routing and UI (`src/App.js`).** Tabs and routes are built from parallel arrays, `enlaces` (labels) and `paginas` (components). The path comes from `url(label)` in `Funciones.tsx`, which lowercases the label, strips accents and replaces spaces with dashes. The first entry maps to `/`. A logged-out user sees Login and Register. A logged-in user sees Registros, Proyectos, Centros and Clientes, plus Usuarios if they are `administrador`. UI is MUI v9 with the theme in `theme.js`, plus `material-react-table` for grids. Each list page (`Registros`, `Proyectos`, ...) has a matching `AddEdit*` dialog component.

**Helpers (`src/Funciones.tsx`).** Date utilities (`fechaSQL` converts dd/mm/yyyy to a sortable form, plus `formatear`, `sumDias` and others), accent-stripping and validation (`comprobar`, `comprobar_telefono`), and `toExcel`, which exports styled .xlsx files through `xlsx-js-style`, including the "parte de trabajo" format.

Login and password recovery use Cloudflare Turnstile (`react-turnstile`) captcha tokens sent to the backend.
