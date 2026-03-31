# MAPA DE CORREOS — Lanzamiento Abril 2026

> Secuencia automatizada de 10 correos para el lanzamiento de Apego Detox
> Workflow n8n: `lanzamiengto 28 febrero` (ID: DiAEqcdFqmZh171K)
> Tabla Airtable: "1 de aril" en base "26nov"

---

## Resumen visual

```
SAB 28  DOM 29  LUN 30  MAR 31  MIE 1 ABR       JUE 2   VIE 3   SAB 4 ABR
  |       |       |       |       |     |          |       |       |     |
 9am     9am     9am     9am    6pm   9pm         --     9am     9am   1pm
  |       |       |       |       |     |                  |       |     |
 [2]     [3]     [4]     [5]    [6]   [7]                [8]     [9]  [10]
  |       |       |       |       |     |                  |       |     |
Seg.    Seg.    Seg.    Seg.   PRE   POST              Antic.   PRE   POST
                                CLASE  CLASE            clase   CLASE  CLASE
                                 |                               |
                              CLASE 1                         CLASE 2
                              8pm COL                         11am COL
```

---

## Los 10 correos en detalle

---

### CORREO 1 — Bienvenida (Webhook)

| Campo | Valor |
|-------|-------|
| **Disparador** | Webhook (al registrarse) |
| **Nodo n8n** | `Webhook` + `Enviar Correo` |
| **Campo Airtable** | `Correo1_Enviado` / `Fecha_envio_1` |
| **Estado** | NO TOCAR — funciona perfecto |

**Funcion:** Es el primer contacto. La persona se registra y recibe este correo inmediatamente. Le da la bienvenida y le dice que ya esta dentro.

---

### CORREO 2 — Seguimiento dia 1

| Campo | Valor |
|-------|-------|
| **Fecha** | Sabado 28 de marzo, 9:00am Colombia |
| **Cron UTC** | `0 14 28 3 *` |
| **Disparador** | `Schedule Trigger` |
| **Nodo Gmail** | `Enviar Correo 1` |
| **Nodo Code** | `Code in JavaScript1` |
| **Campo Airtable** | `Correo2_Enviado` / `Fecha_envio_2` |
| **Busca en** | `Buscar enviado2` |
| **Actualiza en** | `Update record1` |

**Funcion:** Primer seguimiento despues de la bienvenida. Mantiene el contacto caliente. Toca el dolor, recuerda por que se registro.

---

### CORREO 3 — Seguimiento dia 2

| Campo | Valor |
|-------|-------|
| **Fecha** | Domingo 29 de marzo, 9:00am Colombia |
| **Cron UTC** | `0 14 29 3 *` |
| **Disparador** | `Schedule Trigger1` |
| **Nodo Gmail** | `Enviar Correo 2` |
| **Nodo Code** | `Code in JavaScript2` |
| **Campo Airtable** | `Correo3_Enviado` / `Fecha_envio_3` |
| **Busca en** | `Buscar Pendientes1` |
| **Actualiza en** | `Update record2` |

**Funcion:** Segundo seguimiento. Profundiza en el problema. Empieza a generar anticipacion para la clase.

---

### CORREO 4 — Seguimiento dia 3

| Campo | Valor |
|-------|-------|
| **Fecha** | Lunes 30 de marzo, 9:00am Colombia |
| **Cron UTC** | `0 14 30 3 *` |
| **Disparador** | `Schedule Trigger2` |
| **Nodo Gmail** | `Enviar Correo 3` |
| **Nodo Code** | `Code in JavaScript3` |
| **Campo Airtable** | `Correo4_Enviado` / `Fecha_envio_4` |
| **Busca en** | `Buscar Pendientes2` |
| **Actualiza en** | `Update record10` |

**Funcion:** Tercer seguimiento. El dolor se intensifica. La solucion empieza a dibujarse: la clase del miercoles.

---

### CORREO 5 — Seguimiento dia 4

| Campo | Valor |
|-------|-------|
| **Fecha** | Martes 31 de marzo, 9:00am Colombia |
| **Cron UTC** | `0 14 31 3 *` |
| **Disparador** | `Schedule Trigger3` |
| **Nodo Gmail** | `Enviar Correo 4` |
| **Nodo Code** | `Code in JavaScript4` |
| **Campo Airtable** | `Correo5_Enviado` / `Fecha_envio_5` |
| **Busca en** | `Buscar Pendientes3` |
| **Actualiza en** | `Update record9` |

**Funcion:** Ultimo seguimiento antes de la clase. Construye urgencia. "Manana es el dia."

---

### CORREO 6 — Pre-clase miercoles

| Campo | Valor |
|-------|-------|
| **Fecha** | Miercoles 1 de abril, 6:00pm Colombia |
| **Cron UTC** | `0 23 1 4 *` |
| **Disparador** | `Schedule Trigger4` |
| **Nodo Gmail** | `Enviar Correo 5` |
| **Nodo Code** | `Code in JavaScript5` |
| **Campo Airtable** | `Correo6_Enviado` / `Fecha_envio_6` |
| **Busca en** | `Buscar Pendientes4` |
| **Actualiza en** | `Update record3` |

**Funcion:** RECORDATORIO DE CLASE. 2 horas antes. "La clase empieza a las 8pm. Esto es lo que vas a descubrir hoy." Incluye link de acceso.

---

### CORREO 7 — Post-clase miercoles

| Campo | Valor |
|-------|-------|
| **Fecha** | Miercoles 1 de abril, 9:00pm Colombia |
| **Cron UTC** | `0 2 2 4 *` |
| **Disparador** | `Schedule Trigger5` |
| **Nodo Gmail** | `Enviar Correo 6` |
| **Nodo Code** | `Code in JavaScript6` |
| **Campo Airtable** | `Correo7_Enviado` / `Fecha_envio_7` |
| **Busca en** | `Buscar Pendientes5` |
| **Actualiza en** | `Update record7` |

**Funcion:** POST-CLASE. Se envia 1 hora despues del inicio. Para las que asistieron: refuerza lo vivido. Para las que no: les dice lo que se perdieron y genera FOMO.

---

### CORREO 8 — Anticipacion clase sabado

| Campo | Valor |
|-------|-------|
| **Fecha** | Viernes 3 de abril, 9:00am Colombia |
| **Cron UTC** | `0 14 3 4 *` |
| **Disparador** | `Schedule Trigger6` |
| **Nodo Gmail** | `Enviar Correo 7` |
| **Nodo Code** | `Code in JavaScript7` |
| **Campo Airtable** | `Correo8_Enviado` / `Fecha_envio_8` |
| **Busca en** | `Buscar enviado` |
| **Actualiza en** | `Update record6` |

**Funcion:** ANTICIPACION. "Manana a las 11am hay otra clase. Lo del miercoles fue solo la entrada." Genera expectativa para la clase del sabado.

---

### CORREO 9 — Pre-clase sabado

| Campo | Valor |
|-------|-------|
| **Fecha** | Sabado 4 de abril, 9:00am Colombia |
| **Cron UTC** | `0 14 4 4 *` |
| **Disparador** | `Schedule Trigger7` |
| **Nodo Gmail** | `Enviar Correo 8` |
| **Nodo Code** | `Code in JavaScript8` |
| **Campo Airtable** | `Correo9_Enviado` / `Fecha_envio_9` |
| **Busca en** | `Buscar Pendientes6` |
| **Actualiza en** | `Update record8` |

**Funcion:** RECORDATORIO DE CLASE. 2 horas antes. "Hoy a las 11am. No te lo pierdas." Incluye link de acceso.

---

### CORREO 10 — Post-clase sabado

| Campo | Valor |
|-------|-------|
| **Fecha** | Sabado 4 de abril, 1:00pm Colombia |
| **Cron UTC** | `0 18 4 4 *` |
| **Disparador** | `Schedule Trigger8` |
| **Nodo Gmail** | `Enviar Correo 9` |
| **Nodo Code** | `Code in JavaScript9` |
| **Campo Airtable** | `Correo10_Enviado` / `Fecha_envio_10` |
| **Busca en** | `Buscar Pendientes7` |
| **Actualiza en** | `Update record11` |

**Funcion:** POST-CLASE FINAL. Cierre de la secuencia. Refuerza lo vivido, presenta Apego Detox como el siguiente paso. CTA de compra.

---

## Como funciona el flujo tecnico

Cada correo sigue el mismo patron:

```
Schedule Trigger (cron)
    |
    v
Buscar en Airtable (personas que NO han recibido este correo)
    |
    v
Loop Over Items (una por una)
    |
    v
Code in JavaScript (prepara datos: nombre, email, marca campo como enviado)
    |
    v
Enviar Correo via Gmail (HTML con plantilla dorada)
    |
    v
Update record en Airtable (marca CorreoN_Enviado = true, guarda fecha)
    |
    v
Siguiente persona del loop
```

---

## Tabla Airtable: "1 de aril"

| Columna | Tipo | Para que sirve |
|---------|------|----------------|
| Nombre | Texto | Nombre de la persona |
| Email | Texto | Correo electronico |
| Estado_Email | Select | Estado general (Enviado1, etc.) |
| Correo1_Enviado | Checkbox | Bienvenida enviada? |
| Fecha_envio_1 | DateTime | Cuando se envio |
| Correo2_Enviado | Checkbox | Seguimiento 1 enviado? |
| Fecha_envio_2 | DateTime | Cuando se envio |
| ... | ... | Mismo patron hasta Correo10 |
| Correo10_Enviado | Checkbox | Post-clase sabado enviado? |
| Fecha_envio_10 | DateTime | Cuando se envio |
| COMPLETADO | Checkbox | Toda la secuencia terminada |
| live1 | Checkbox | Asistio a la clase 1? |

---

## Notas importantes

1. **Zona horaria:** Colombia = UTC-5. Todos los crons estan en UTC.
2. **Webhook NO se toca** — es la entrada de nuevos registros.
3. **Backup:** `output/n8n-workflow-backup.json` (workflow original antes de cambios).
4. **Los HTMLs de cada correo** todavia necesitan crearse/actualizarse.
5. **El workflow esta ACTIVO** — los triggers se dispararan en las fechas programadas.

---

*Documento generado el 28 de marzo de 2026*
*Workflow n8n: DiAEqcdFqmZh171K | Base Airtable: appOKA2nGovlyj1dw | Tabla: tblPNIejnMmghW4ND*
