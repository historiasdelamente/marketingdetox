# Sistema /cuentos — Videos cuento Facebook 60s

> Backup en repo del skill + supervisor + validator que viven en `~/.claude/` del usuario.

## Arquitectura

```
USUARIO dice "/cuentos" o "hagamos un cuento"
        ↓
SKILL.md (este archivo)
   — punto de entrada, delega al supervisor
        ↓
SUBAGENTE cuentos-general (../../agents/cuentos-general.md)
   — el GENERAL, orquesta end-to-end:
   1. Lee SKILL.md + cuentos-validator.md + últimos 3 cuentos Hecho de Airtable
   2. Pull Estilo (appe6pvFi9EZzv3gU/tblJgm3L9ZLcwgvs8) — anti-repetición vs últimos 3
   3. Pull Ambiente exterior (appe6pvFi9EZzv3gU/tbl3OSe9IB9XFo3pf) — anti-repetición vs últimos 3
   4. Pull Tema con Status="Falta por hacer" (appEtIptqwNt0DEKw/tblWrHL4DtpMW0ap4)
   5. Marca Tema → "En proceso"
   6. Anuncia picks al usuario (header 3 líneas)
   7. Genera 6 narraciones español + 6 prompts Grok aplicando ingenio:
      - Mecanismo P4 ROTA por tema (NO default a foto-en-sobre)
      - 6 posturas diferentes, secuencia distinta a últimos 3 cuentos
      - Apertura P1 sintaxis distinta a último Hecho
      - Flashbacks adaptados al tema, no al banco genérico
        ↓
   SUBAGENTE cuentos-validator (../../agents/cuentos-validator.md)
      — VALIDADOR estricto, 33 reglas, loop máx 3 iteraciones
        ↓
   8. Si PASS → marca Tema → "Hecho"
   9. Si FAIL iter 3 → mantiene "En proceso" + disclaimer
   10. Entrega output al usuario
```

## Bases Airtable usadas

| Base | Tabla | Función |
|---|---|---|
| `appe6pvFi9EZzv3gU` (VIDEOS GROK) | `tblJgm3L9ZLcwgvs8` | Estilos Mujer Colombiana (15 estilos enriquecidos) |
| `appe6pvFi9EZzv3gU` (VIDEOS GROK) | `tbl3OSe9IB9XFo3pf` | Ambientes cinematográficos (25) |
| `appEtIptqwNt0DEKw` (Temas Brutales) | `tblWrHL4DtpMW0ap4` | 100 temas con Status (Falta por hacer / En proceso / Hecho) |

## Reglas críticas (resumen, ver SKILL.md para las 28 completas)

1. Cada parte: 16-19 palabras, tercera persona, voice-over only
2. HER block IDÉNTICO en los 6 prompts (Look general de Airtable + capa empatía/movimiento)
3. Apertura literal: `Cinematic editorial drama film scene with cinematic motion and quick flashback insert.`
4. Tear progression: P1-P2 sonrisa cálida → P3 vidriosa → P4 suspendida → P5 trazando → P6 calma + sonrisa de regreso
5. Cámara siempre en movimiento, slow motion en P4/P5/P6
6. P4 mecanismo ROTA por tema (anillo, calendario, diario antiguo, foto familiar 3 generaciones, etc — NUNCA default a foto-en-sobre)
7. ANTI-REPETICIÓN entre cuentos: estilo, ambiente, mecanismo, sintaxis P1, flashbacks
8. Default escena = exterior; interior solo si la narración lo demanda

## Cómo instalar localmente (en otro equipo)

```bash
# Copiar al lugar correcto en ~/.claude/
cp .claude/skills/cuentos/SKILL.md ~/.claude/skills/cuentos/SKILL.md
cp .claude/agents/cuentos-general.md ~/.claude/agents/cuentos-general.md
cp .claude/agents/cuentos-validator.md ~/.claude/agents/cuentos-validator.md
```

Reiniciar Claude Code para que detecte los agentes.

## Versión

- **2026-05-09 v1.0** — Sistema completo con supervisor + validator + tabla Temas Brutales
- **2026-05-09 v1.1** — Reglas duras anti-repetición (mecanismo P4 rotativo, cross-check vs últimos 3 Hecho)
