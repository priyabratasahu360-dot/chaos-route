import type { ChaosFailure } from "../config.js";

export function httpError(res: any, failure: ChaosFailure){
    const status = failure.status ?? 500;
    const message = failure.message ?? "Chaos Error"

    return res.status(status).json({
        error: message,
        chaos: true
    })
}