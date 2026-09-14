import type { ResponseManipulation } from "../config.js";
import { validateManipulation } from "./validateManipulation.js";

export function validateResponseManipulation(route: string, response: ResponseManipulation): void{
    validateManipulation(route, response, "response")
}