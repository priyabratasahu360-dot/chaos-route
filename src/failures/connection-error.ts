import type { Request } from "express";
export function connectionError(req: Request){
    req.socket.destroy();
}