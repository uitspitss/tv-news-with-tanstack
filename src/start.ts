import { createStart } from "@tanstack/react-start";
import { basicAuthMiddleware } from "./middleware/auth";

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [basicAuthMiddleware],
  };
});
