import type { Request, Response } from "express";
import type { ChaosFailure } from "../config.js";

type RateLimitEntry = {
    count: number,
    resetTime: number
}

const requests = new Map<string, RateLimitEntry>();

export function rateLimit(req: Request, res: Response, failure: ChaosFailure){
    const limit = failure.limit ?? 10;
    const windowMs = failure.windowMs ?? 60_000

    const key = req.ip ?? "unknown";
    const now = Date.now();

    const existing = requests.get(key);

    //if no previous req or previous window expired
    if(!existing || now >= existing.resetTime){
        requests.set(key, {
            count: 1,
            resetTime: now + windowMs
        })

        return null;
    }

    //user excessed limit
    if(existing.count >= limit){
        return res.status(429)
                  .json({
                    error: failure.message ?? "Too many request",
                    chaos: true
                  })
    }

    existing.count++;

    return null;
}