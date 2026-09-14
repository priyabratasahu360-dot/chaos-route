import fs from "node:fs";
import path from "node:path";
import { validateConfig } from "./config-validator.js";

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
  //check .env if true read config and create chaos if not fallback to original api route *default=true
  const chaos = process.env.CHAOS;
  if(chaos === "false"){
    return {
      routes: {}
    }
  }

  const configPath = path.join(process.cwd(), "chaos.config.json");

  // If the file doesn't exist, return a safe fallback structure
  if (!fs.existsSync(configPath)) {
    return {
      routes: {},
    };
  }

  try {
    const content = fs.readFileSync(configPath, "utf-8");

    const config = JSON.parse(content) as ChaosConfig;

    validateConfig(config);


    return config;

  } catch (error: any) {
     // If it's a validation error from validateFailure, show ONLY the colored message and exit
  if (error.message) {
    console.error(error.message); 
    process.exit(1); // Stop execution cleanly
  }

   // Fallback only if the JSON file itself is corrupt/broken syntax
  console.warn(
    "[Chaos Route] Warning: chaos.config.json contains invalid JSON syntax. Falling back to default configuration."
  );

    return {
      routes: {},
    };
  }
}