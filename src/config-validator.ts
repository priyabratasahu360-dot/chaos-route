import type { ChaosConfig, ChaosFailure, RequestManipulation, ResponseManipulation } from "./config.js";
import { colorize } from "./helper/colorizer.js";
import { validateFailure } from "./helper/validateFailure.js";
import { validateRequestManipulation } from "./helper/validateReqManipulation.js";
import { validateResponseManipulation } from "./helper/validateResManipulation.js";


export function validateConfig(config: ChaosConfig): void{
    if(!config || typeof config !== "object"){
        throw new Error(
            colorize("[Chaos Route] configuration must be an object", "red")
        );
    }

    if(!config.routes || typeof config.routes !== "object"){
        throw new Error(
            colorize("[Chaos Route] 'routes' must be an object", "red")
        );
    }

    for(const [route, routeConfig] of Object.entries(config.routes)){
        if(!route.startsWith("/")){
            throw new Error(
                colorize(`[Chaos Route] Invalid route '${route}'. Routes must starts with '/'\nMake sure your routes matches exactly to your route path`, "red")
            );
        }

        if(!routeConfig || typeof routeConfig !== "object"){
            throw new Error(
                colorize(`[Chaos Route] Invalid configuration for route '${route}`, "red")
            )
        }

        if(routeConfig.failure){
            validateFailure(route, routeConfig.failure)
        }
        if(routeConfig.request){
            validateRequestManipulation(route, routeConfig.request)
        }
        if(routeConfig.response){
            validateResponseManipulation(route, routeConfig.response)
        }
    }
}
