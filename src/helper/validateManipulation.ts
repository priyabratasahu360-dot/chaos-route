import type { RequestManipulation, ResponseManipulation } from "../config.js";
import { colorize } from "./colorizer.js";

export function validateManipulation(
  route: string,
  manipulation: RequestManipulation | ResponseManipulation,
  type: "request" | "response"
): void {
  if (manipulation.remove !== undefined) {
    if (!Array.isArray(manipulation.remove)) {
      throw new Error(
        colorize(`[Chaos Route] '${type}.remove' for route '${route}' must be an array.`, "red")
      );
    }

    for (const field of manipulation.remove) {
      if (typeof field !== "string") {
        throw new Error(
          colorize(`[Chaos Route] '${type}.remove' for route '${route}' must contain only strings.`, "red")
        );
      }
    }
  }

  if (
    manipulation.set !== undefined &&
    (typeof manipulation.set !== "object" ||
      manipulation.set === null ||
      Array.isArray(manipulation.set))
  ) {
    throw new Error(
      colorize(`[Chaos Route] '${type}.set' for route '${route}' must be an object.`, "red")
    );
  }

  if (
    manipulation.add !== undefined &&
    (typeof manipulation.add !== "object" ||
      manipulation.add === null ||
      Array.isArray(manipulation.add))
  ) {
    throw new Error(
      colorize(`[Chaos Route] '${type}.add' for route '${route}' must be an object.`, "red")
    );
  }
}