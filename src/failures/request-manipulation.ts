import type { Request } from "express";
import type { RequestManipulation } from "../config.js";

export function manipulateRequest(req: Request, request: RequestManipulation){
    
    //add new fileds
    if(request.add){
        for(const [field, value] of Object.entries(request.add)){
            req.body[field] = value;
        }
    }

    //modify existing fields
    if(request.set){
        for(const [field, value] of Object.entries(request.set)){
            req.body[field] = value;
        }
    }

    //remove filed
    if(request.remove){
        for(const field of request.remove){
            delete req.body[field];
        }
    }
}