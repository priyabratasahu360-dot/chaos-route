import type {Request, Response, NextFunction} from "express";

import { loadConfig } from "./config.js";
import { httpError } from "./failures/http-error.js";
import { latency } from "./failures/latency.js";
import { timeout } from "./failures/timeout.js";
import { connectionError } from "./failures/connection-error.js";
import { rateLimit } from "./failures/rate-limit.js";

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

    //simulate timeout error
    if(failure.type === "timeout"){
      return await timeout(req, failure);
    }

    //simulate connection error
    if(failure.type === "connection_error"){
      return connectionError(req);
    }

    //simulate rate limit
    if(failure.type === "rate_limit"){
      const result = rateLimit(req, res, failure);

      if(result){
        return result;
      }

      return next();
    }

    return next();
  };
}