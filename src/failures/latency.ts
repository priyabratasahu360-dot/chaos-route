import type { ChaosFailure } from "../config.js";

export async function latency(failure: ChaosFailure){
    const delay = failure.latencyMs ?? 3000;

    await new Promise<void>((resolve) => {
        setTimeout(resolve, delay)
    })
}