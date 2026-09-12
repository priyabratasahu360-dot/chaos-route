import type { ChaosFailure } from "../config.js"
export async function timeout(req: any, failure: ChaosFailure){
    const timeoutMs = failure.timeoutMs ?? 5000;

    await new Promise<void>((resolve) => {
        setTimeout(resolve, timeoutMs);
    });

    req.socket.destroy();
}