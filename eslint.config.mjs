import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Carpetas de RESULTADOS, no de código fuente: aquí caen los outputs de
    // los agentes y los scripts sueltos de Node (CommonJS). Pasarles el
    // ruleset de Next/TypeScript solo produce ruido — prohíbe require() en
    // archivos que se ejecutan con node, no con Next.
    "output/**",
    "data/**",
    // Directorio de trabajo de Claude Code, no del proyecto. Dentro viven
    // worktrees que son COPIAS completas del repo: sin esto, eslint reporta
    // dos veces cada archivo — una la versión buena y otra la vieja de la
    // copia — y el resultado local deja de parecerse al de la CI.
    ".claude/**",
  ]),
]);

export default eslintConfig;
