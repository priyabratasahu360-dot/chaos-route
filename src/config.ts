import fs from "node:fs";
import path from "node:path";

// Defines what failure options look like
export interface ChaosFailure {
  type: "http_error" | "latency" | "timeout" | "connection_error" | "rate_limit";

  status?: number;
  message?: string;
  latencyMs?: number;
  timeoutMs?: number;
  limit?: number;
  windowMs?: number;
}

export interface RequestManipulation{
  remove?: string[];
  set?: Record<string, unknown>;
  add?: Record<string, unknown>;
}
export interface ResponseManipulation{
  remove?: string[];
  set?: Record<string, unknown>;
  add?: Record<string, unknown>;
}

export interface ChaosRouteConfig {
  failure?: ChaosFailure;
  request?: RequestManipulation;
  response?: ResponseManipulation;
}

export interface ChaosConfig {
  routes: Record<string, ChaosRouteConfig>;
}

/**
 * Loads the chaos configuration from the host project's root directory.
 */
export function loadConfig(): ChaosConfig {
  const configPath = path.join(process.cwd(), "chaos.config.json");

  // If the file doesn't exist, return a safe fallback structure
  if (!fs.existsSync(configPath)) {
    return {
      routes: {},
    };
  }

  try {
    const content = fs.readFileSync(configPath, "utf-8");

    return JSON.parse(content) as ChaosConfig;
  } catch (error) {
    console.warn(
      "[Chaos Route] Warning: chaos.config.json contains invalid JSON. Falling back to default configuration."
    );

    return {
      routes: {},
    };
  }
}