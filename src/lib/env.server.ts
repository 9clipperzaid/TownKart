import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

let localEnv: Record<string, string> | undefined;

function parseEnvFile(contents: string) {
  const values: Record<string, string> = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function readLocalEnv() {
  if (localEnv) return localEnv;

  const envPath = resolve(process.cwd(), ".env");
  localEnv = existsSync(envPath) ? parseEnvFile(readFileSync(envPath, "utf8")) : {};
  return localEnv;
}

export function readServerEnv(name: string) {
  return process.env[name] ?? readLocalEnv()[name];
}
