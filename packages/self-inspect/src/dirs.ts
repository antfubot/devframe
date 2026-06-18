import { fileURLToPath } from 'node:url'

/**
 * Directory where the pre-built SPA lives. Served at the devframe's
 * mount path by the framework adapter.
 */
export const clientPublicDir: string = fileURLToPath(new URL('../dist/client', import.meta.url))
