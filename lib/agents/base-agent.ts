import { spawn } from "child_process";
import { readFileSync } from "fs";
import path from "path";

const PROMPTS_DIR = path.join(process.cwd(), "agents-source", "prompts");
const SCRIPTS_DIR = path.join(process.cwd(), "agents-source", "scripts");

const promptCache = new Map<string, string>();

export type AgentModel = "sonnet" | "opus" | "haiku";

// Ollama config - if OLLAMA_MODEL is set, haiku-level tasks will use Ollama instead of CLI
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || ""; // e.g. "llama3", "mistral"

/**
 * Load a prompt .md file from agents-source/prompts/{folder}/{name}.md
 */
export function loadPrompt(folder: string, name: string): string {
  const key = `${folder}/${name}`;
  if (promptCache.has(key)) {
    return promptCache.get(key)!;
  }
  const filePath = path.join(PROMPTS_DIR, folder, `${name}.md`);
  const content = readFileSync(filePath, "utf-8");

  // Replace knowledge base placeholder with actual path
  const kbPath = path.join(process.cwd(), "base_conocimiento");
  const resolved = content.replace(/\{\{BASE_CONOCIMIENTO_PATH\}\}/g, kbPath);

  promptCache.set(key, resolved);
  return resolved;
}

/**
 * Call Claude CLI in print mode with a system prompt and user message.
 * The system prompt is embedded in the stdin message to avoid Windows
 * command-line length limits (~8000 chars). Your prompts stay 100% intact.
 */
export async function callClaudeCli(
  userMessage: string,
  options: {
    systemPrompt: string;
    model?: AgentModel;
    maxTurns?: number;
    webSearch?: boolean;
  }
): Promise<string> {
  // If Ollama is configured and this is a haiku-level task, use Ollama (free)
  if (OLLAMA_MODEL && options.model === "haiku" && !options.webSearch) {
    try {
      return await callOllama(userMessage, options.systemPrompt);
    } catch {
      // Fallback to CLI if Ollama fails
    }
  }

  const model = options.model || "sonnet";
  const maxTurns = String(options.maxTurns || 5);

  const args = [
    "-p",
    "--model", model,
    "--max-turns", maxTurns,
  ];

  if (options.webSearch) {
    args.push("--allowedTools", "web_search");
  }

  // Combine system prompt + user message into stdin
  // This avoids Windows command-line length limits while keeping prompts intact
  const combinedMessage = [
    "<instructions>",
    options.systemPrompt,
    "</instructions>",
    "",
    userMessage,
  ].join("\n");

  return runClaude(args, combinedMessage);
}

/**
 * Call Ollama local model (free, no API cost).
 */
async function callOllama(
  userMessage: string,
  systemPrompt: string
): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: userMessage,
      system: systemPrompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 4096,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
}

/**
 * Run Claude CLI. Uses spawn to avoid shell argument length limits.
 */
function runClaude(args: string[], stdinData: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cliPath = process.env.CLAUDE_CLI_PATH || "claude";

    const child = spawn(cliPath, args, {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true, // Needed on Windows to resolve .cmd files
      env: { ...process.env },
      timeout: 15 * 60 * 1000, // 15 minutes
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("error", (error) => {
      reject(new Error(`Claude CLI error: ${error.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Claude CLI exited with code ${code}: ${stderr.slice(0, 500)}`));
        return;
      }
      resolve(stdout);
    });

    // Send combined message via stdin (no length limit)
    child.stdin.write(stdinData);
    child.stdin.end();
  });
}

/**
 * Execute a Python script with arguments.
 */
export async function callPythonScript(
  scriptName: string,
  args: string[] = [],
  options: { cwd?: string; timeout?: number } = {}
): Promise<string> {
  const pythonPath = process.env.PYTHON_PATH || "python";
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);

  return new Promise((resolve, reject) => {
    const child = spawn(pythonPath, [scriptPath, ...args], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: options.cwd || process.cwd(),
      env: { ...process.env },
      timeout: options.timeout || 5 * 60 * 1000,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => { stdout += data.toString(); });
    child.stderr.on("data", (data: Buffer) => { stderr += data.toString(); });

    child.on("error", (error) => {
      reject(new Error(`Python script error: ${error.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python script error (code ${code}): ${stderr.slice(0, 500)}`));
        return;
      }
      resolve(stdout);
    });
  });
}

/**
 * Run a sequence of agents, calling progress callback after each step.
 */
export async function runAgentPipeline(
  steps: {
    name: string;
    folder: string;
    promptFile: string;
    model?: AgentModel;
    buildMessage: (prevResults: Record<string, string>) => string;
    webSearch?: boolean;
  }[],
  onProgress: (step: string, index: number, total: number) => void
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    onProgress(step.name, i, steps.length);

    const systemPrompt = loadPrompt(step.folder, step.promptFile);
    const userMessage = step.buildMessage(results);

    const response = await callClaudeCli(userMessage, {
      systemPrompt,
      model: step.model || "sonnet",
      webSearch: step.webSearch,
    });

    results[step.name] = response;
  }

  return results;
}
