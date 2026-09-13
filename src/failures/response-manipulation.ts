import type { Response } from "express";
import type { ResponseManipulation } from "../config.js";

export function manipulateResponse(res: Response, responseConfig: ResponseManipulation){
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
        if(!body || typeof body !== "object"){
            originalJson(body);
        }

        if(responseConfig.add){
            for(const [field, value] of Object.entries(responseConfig.add)){
                body[field] = value;
            }
        }

        if(responseConfig.set){
            for(const [field, value] of Object.entries(responseConfig.set)){
                body[field] = value;
            }
        }

        if(responseConfig.remove){
            for(const field of responseConfig.remove){
                delete body[field];
            }
        }

        return originalJson(body);
    }
}