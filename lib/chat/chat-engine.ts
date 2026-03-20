import type { ChatMessage, AgentField } from "./types";
import { AGENT_CONFIGS } from "./agent-configs";

let msgId = 0;
function createMsg(
  role: ChatMessage["role"],
  type: ChatMessage["type"],
  content: string,
  extra?: Partial<ChatMessage>
): ChatMessage {
  return {
    id: `msg-${++msgId}`,
    role,
    type,
    content,
    timestamp: new Date(),
    ...extra,
  };
}

function getRequiredFields(agentType: string): AgentField[] {
  const config = AGENT_CONFIGS[agentType];
  if (!config) return [];
  return config.fields.filter((f) => f.required);
}

function getAllFields(agentType: string): AgentField[] {
  const config = AGENT_CONFIGS[agentType];
  if (!config) return [];
  return config.fields;
}

function fieldToChips(field: AgentField) {
  if (field.type === "select" && field.options) {
    return field.options.map((o) => ({ label: o.label, value: o.value }));
  }
  return undefined;
}

function fieldPromptText(field: AgentField): string {
  const hints: Record<string, string> = {
    tema: "¿Cuál es el tema?",
    categoria: "¿Qué categoría?",
    tipo: "¿Qué tipo?",
    tipo_email: "¿Qué tipo de email?",
    audiencia: "¿Para qué audiencia?",
    modo: "¿Modo dolor o invitación a clase?",
    concepto: "Descríbeme el concepto del video",
    tono: "¿Qué tono emocional quieres?",
    formato: "¿Qué formato?",
    clase_num: "¿Qué número de clase?",
    comando: "¿Qué parte quieres generar?",
    version: "¿Qué versión?",
    fase: "¿Qué fase?",
    plataforma: "¿Para qué plataforma?",
    categoria_metafora: "¿Qué tipo de metáfora?",
  };
  return hints[field.name] || `${field.label}:`;
}

export function processAgentSelection(agentType: string): ChatMessage[] {
  const config = AGENT_CONFIGS[agentType];
  if (!config) return [createMsg("agent", "text", "No encontré ese agente.")];

  const messages: ChatMessage[] = [
    createMsg("agent", "text", config.greeting, { agentType }),
  ];

  const firstField = getAllFields(agentType)[0];
  if (firstField) {
    const chips = fieldToChips(firstField);
    messages.push(
      createMsg("agent", "field-prompt", fieldPromptText(firstField), {
        agentType,
        chips,
      })
    );
  }

  return messages;
}

export function processUserInput(
  agentType: string,
  collectedFields: Record<string, string>,
  currentFieldIndex: number,
  userInput: string
): { messages: ChatMessage[]; newFields: Record<string, string>; newIndex: number; readyToExecute: boolean } {
  const allFields = getAllFields(agentType);
  const currentField = allFields[currentFieldIndex];

  if (!currentField) {
    return { messages: [], newFields: collectedFields, newIndex: currentFieldIndex, readyToExecute: true };
  }

  const newFields = { ...collectedFields, [currentField.name]: userInput };
  const nextIndex = currentFieldIndex + 1;

  if (nextIndex >= allFields.length) {
    const config = AGENT_CONFIGS[agentType];
    const summary = Object.entries(newFields)
      .map(([key, val]) => {
        const field = allFields.find((f) => f.name === key);
        const label = field?.label || key;
        const displayVal = field?.options?.find((o) => o.value === val)?.label || val;
        return `• **${label}:** ${displayVal}`;
      })
      .join("\n");

    return {
      messages: [
        createMsg("agent", "text", `Perfecto. Esto es lo que voy a generar:\n\n${summary}`),
        createMsg("agent", "suggestion-chips", "¿Listo para ejecutar?", {
          chips: [
            { label: "✨ Ejecutar agente", value: "__execute__" },
            { label: "Cambiar algo", value: "__reset__" },
          ],
        }),
      ],
      newFields,
      newIndex: nextIndex,
      readyToExecute: false,
    };
  }

  const nextField = allFields[nextIndex];
  const isOptional = !nextField.required;
  const chips = fieldToChips(nextField);
  const skipChip = isOptional ? [{ label: "Saltar", value: "__skip__" }] : [];
  const allChips = chips ? [...chips, ...skipChip] : skipChip.length > 0 ? skipChip : undefined;

  return {
    messages: [
      createMsg("agent", "field-prompt", fieldPromptText(nextField), {
        agentType,
        chips: allChips,
      }),
    ],
    newFields,
    newIndex: nextIndex,
    readyToExecute: false,
  };
}

export function skipField(
  agentType: string,
  collectedFields: Record<string, string>,
  currentFieldIndex: number
): { messages: ChatMessage[]; newIndex: number; readyToExecute: boolean } {
  const allFields = getAllFields(agentType);
  const nextIndex = currentFieldIndex + 1;

  if (nextIndex >= allFields.length) {
    const summary = Object.entries(collectedFields)
      .map(([key, val]) => {
        const field = allFields.find((f) => f.name === key);
        const label = field?.label || key;
        const displayVal = field?.options?.find((o) => o.value === val)?.label || val;
        return `• **${label}:** ${displayVal}`;
      })
      .join("\n");

    return {
      messages: [
        createMsg("agent", "text", `Perfecto. Esto es lo que voy a generar:\n\n${summary}`),
        createMsg("agent", "suggestion-chips", "¿Listo para ejecutar?", {
          chips: [
            { label: "✨ Ejecutar agente", value: "__execute__" },
            { label: "Cambiar algo", value: "__reset__" },
          ],
        }),
      ],
      newIndex: nextIndex,
      readyToExecute: false,
    };
  }

  const nextField = allFields[nextIndex];
  const isOptional = !nextField.required;
  const chips = fieldToChips(nextField);
  const skipChip = isOptional ? [{ label: "Saltar", value: "__skip__" }] : [];
  const allChips = chips ? [...chips, ...skipChip] : skipChip.length > 0 ? skipChip : undefined;

  return {
    messages: [
      createMsg("agent", "field-prompt", fieldPromptText(nextField), {
        agentType,
        chips: allChips,
      }),
    ],
    newIndex: nextIndex,
    readyToExecute: false,
  };
}
