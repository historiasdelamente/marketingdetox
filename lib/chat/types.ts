export type ChatMessageRole = "user" | "agent" | "system";

export type ChatMessageType =
  | "text"
  | "suggestion-chips"
  | "progress"
  | "output"
  | "error"
  | "field-prompt"
  | "agent-selector";

export type SuggestionChip = {
  label: string;
  value: string;
};

export type ChatMessage = {
  id: string;
  role: ChatMessageRole;
  type: ChatMessageType;
  content: string;
  timestamp: Date;
  agentType?: string;
  chips?: SuggestionChip[];
  progress?: { step: string; percentage: number };
  output?: { content: string; title: string };
};

export type AgentField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
};

export type AgentConfig = {
  title: string;
  description: string;
  agentCount: number;
  outputType: string;
  fields: AgentField[];
  steps: string[];
  greeting: string;
  icon: string;
  accent: string;
};

export type ChatSession = {
  messages: ChatMessage[];
  activeAgent: string | null;
  collectedFields: Record<string, string>;
  currentFieldIndex: number;
  jobId: string | null;
  isRunning: boolean;
};
