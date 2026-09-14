import type { ChaosFailure } from "../config.js";
import { colorize } from "./colorizer.js";

const validFailureTypes = [
  "http_error",
  "latency",
  "timeout",
  "connection_error",
  "rate_limit",
] as const;

const VALID_STATUS_CODES = [
  200, 201, 202, 204,
  301, 302, 304,
  400, 401, 403, 404, 405, 409, 422, 429,
  500, 501, 502, 503, 504,
];

export function validateFailure(route: string, failure: ChaosFailure): void {
  if (!validFailureTypes.includes(failure.type)) {
    throw new Error(
      colorize(
        `[Chaos Route] Invalid failure type ${failure.type} for route '${route}'`,
        "red",
      ),
    );
  }

  if (
    failure.type === "http_error" &&
    failure.status !== undefined &&
    (!VALID_STATUS_CODES.includes(failure.status) ||
      failure.status < 100 ||
      failure.status > 599)
  ) {
    throw new Error(
      colorize(
        `[Chaos Route] Invalid status for route '${route}'. Must be a valid code.`,
        "red",
      ),
    );
  }

  if (
    failure.type === "latency" &&
    failure.latencyMs !== undefined &&
    (!Number.isFinite(failure.latencyMs) ||
      failure.latencyMs < 0)
  ) {
    throw new Error(
      colorize(`[Chaos Route] Invalid latencyMs for route '${route}'. Must be 0 or greater.`, "red")
    );
  }

  if (
    failure.type === "timeout" &&
    failure.timeoutMs !== undefined &&
    (!Number.isFinite(failure.timeoutMs) ||
      failure.timeoutMs <= 0)
  ) {
    throw new Error(
      colorize(`[Chaos Route] Invalid timeoutMs for route '${route}'. Must be greater than 0.`, "red")
    );
  }

  if (
    failure.type === "rate_limit" &&
    failure.limit !== undefined &&
    (!Number.isInteger(failure.limit) ||
      failure.limit <= 0)
  ) {
    throw new Error(
      colorize(`[Chaos Route] Invalid limit for route '${route}'. Must be greater than 0 default is 10.`, "red")
    );
  }

  if (
    failure.type === "rate_limit" &&
    failure.windowMs !== undefined &&
    (!Number.isFinite(failure.windowMs) ||
      failure.windowMs <= 0)
  ) {
    throw new Error(
      colorize(`[Chaos Route] Invalid windowMs for route '${route}'. Must be greater than 0. default is 60000ms`, "red")
    );
  }
}
