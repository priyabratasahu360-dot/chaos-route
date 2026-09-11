import { loadConfig } from "./config.js";
import { httpError } from "./failures/http-error.js";
import { latency } from "./failures/latency.js";

type Request = {
  path: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type Response = {
  status(code: number): Response;
  json(body: unknown): Response;
  send(body: unknown): Response;
};

type NextFunction = () => void;

export function chaos() {
  const config = loadConfig();
  const routes = config.routes ?? {};

  return async function chaosMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const chaosConfig = routes[req.path];

    // No chaos configuration for this route
    if (!chaosConfig) {
      return next();
    }

    const failure = chaosConfig.failure;

    // Route exists in config but has no failure
    if (!failure) {
      return next();
    }

    // Simulate HTTP error
    if (failure.type === "http_error") {
      return httpError(res, failure);
    }

    // Add latency, then allow the real Express route to continue
    if (failure.type === "latency") {
      await latency(failure);
      return next();
    }

    return next();
  };
}