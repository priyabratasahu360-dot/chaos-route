import type { RequestManipulation } from "../config.js";
import { validateManipulation } from "./validateManipulation.js";

export function validateRequestManipulation(route: string, request: RequestManipulation): void{
    validateManipulation(route, request, "request")
}