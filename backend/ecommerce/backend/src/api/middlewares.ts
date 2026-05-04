import { defineMiddlewares } from "@medusajs/framework/http";
import cors from "cors";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/*",
      middlewares: [
        // This function will handle the preflight request directly
        (req, res, next) => {
          if (req.method === "OPTIONS") {
            res.setHeader(
              "Access-Control-Allow-Origin",
              "http://localhost:8080",
            );
            res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            res.setHeader(
              "Access-Control-Allow-Headers",
              "Content-Type, Authorization, x-publishable-api-key",
            );
            res.setHeader("Access-Control-Allow-Credentials", "true");
            // Send a successful preflight response
            return res.status(204).send();
          }
          // For non-OPTIONS requests, proceed to the next middleware
          next();
        },
        // This is your existing CORS middleware
        cors({
          origin: process.env.STORE_CORS || "http://localhost:8080",
          credentials: true,
          allowedHeaders: [
            "Content-Type",
            "Authorization",
            "x-publishable-api-key",
          ],
        }),
      ],
    },
  ],
});
