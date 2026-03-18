import { spawn } from "child_process";
import { readFileSync, writeFileSync, unlinkSync, mkdirSync } from "fs";
import path from "path";
import { tmpdir } from "os";

const PROMPTS_DIR = path.join(process.cwd(), "agents-source", "prompts");
const SCRIPTS_DIR = path.join(process.cwd(), "agents-source", "scripts");
const TEMP_DIR = path.join(tmpdir(), "marketingdetox-prompts");

const promptCache = new Map<string, string>();

export type AgentModel = "sonnet" | "opus" | "haiku";

// Ollama config
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "";

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

  const kbPath = path.join(process.cwd(), "base_conocimiento");
  const resolved = content.replace(/\{\{BASE_CONOCIMIENTO_PATH\}\}/g, kbPath);

  promptCache.set(key, resolved);
  return resolved;
}

/**
 * Call Claude CLI with system prompt via temp file to avoid Windows limits.
 * Uses PowerShell to read the file and pass it as --system-prompt argument.
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
  const maxTurns = options.maxTurns || 5;

  // Write system prompt to temp file
  mkdirSync(TEMP_DIR, { recursive: true });
  const tempFile = path.join(TEMP_DIR, `sp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.md`);
  writeFileSync(tempFile, options.systemPrompt, "utf-8");

  try {
    const result = await runClaudeWithTempPrompt(
      tempFile,
      userMessage,
      model,
      maxTurns,
      options.webSearch || false
    );
    return result;
  } finally {
    try { unlinkSync(tempFile); } catch { /* ignore */ }
  }
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
      options: { temperature: 0.7, num_predict: 4096 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
}

/**
 * Run Claude CLI using PowerShell to read system prompt from temp file.
 * This bypasses the Windows command-line 8191 char limit.
 */
function runClaudeWithTempPrompt(
  systemPromptFile: string,
  userMessage: string,
  model: string,
  maxTurns: number,
  webSearch: boolean
): Promise<string> {
  return new Promise((resolve, reject) => {
    const cliPath = process.env.CLAUDE_CLI_PATH || "claude";
    const isWindows = process.platform === "win32";

    if (isWindows) {
      // PowerShell: read system prompt from file, pass to claude CLI
      const toolsArg = webSearch ? " --allowedTools 'web_search'" : "";
      const psScript = `
$sp = Get-Content -Path '${systemPromptFile.replace(/'/g, "''")}' -Raw -Encoding UTF8
$input = '${userMessage.replace(/'/g, "''").replace(/\n/g, "`n")}'
$input | & '${cliPath}' -p --model '${model}' --max-turns ${maxTurns} --system-prompt $sp${toolsArg}
`.trim();

      const child = spawn("powershell", ["-NoProfile", "-NonInteractive", "-Command", psScript], {
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env },
        timeout: 15 * 60 * 1000,
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data: Buffer) => { stdout += data.toString(); });
      child.stderr.on("data", (data: Buffer) => { stderr += data.toString(); });

      child.on("error", (error) => {
        reject(new Error(`Claude CLI error: ${error.message}`));
      });

      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr.slice(0, 300)}`));
          return;
        }
        resolve(stdout);
      });
    } else {
      // Unix: use shell to read file into --system-prompt
      const escapedFile = systemPromptFile.replace(/'/g, "'\\''");
      const toolsArg = webSearch ? " --allowedTools web_search" : "";
      const command = `'${cliPath}' -p --model '${model}' --max-turns ${maxTurns} --system-prompt "$(cat '${escapedFile}')"${toolsArg}`;

      const child = spawn("/bin/sh", ["-c", command], {
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env },
        timeout: 15 * 60 * 1000,
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data: Buffer) => { stdout += data.toString(); });
      child.stderr.on("data", (data: Buffer) => { stderr += data.toString(); });

      child.on("error", (error) => {
        reject(new Error(`Claude CLI error: ${error.message}`));
      });

      child.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`Claude CLI exited with code ${code}: ${stderr.slice(0, 300)}`));
          return;
        }
        resolve(stdout);
      });

      child.stdin.write(userMessage);
      child.stdin.end();
    }
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
