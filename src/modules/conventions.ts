/**
 * Convenção de imports (Fase 2+):
 * - Código de módulo importa apenas de `@/shared` ou da API pública (`index.ts`) de outro módulo.
 * - Evitar importar `pages/X/...` ou internals de outro módulo.
 * - Páginas legadas em `src/pages` migram módulo a módulo (Fases 3–11); até lá, `routes.tsx` reexporta o legado.
 */
export {}
