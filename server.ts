import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { askController, classifyException } from "./src/ai/gemini";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Ask Controller API
  app.post("/api/ask", async (req, res) => {
    try {
      const { question, context } = req.body;
      const result = await askController(question, context);
      res.json(result);
    } catch (error) {
      console.error("Ask Controller error:", error);
      res.json({ response: "AI reasoning temporarily unavailable due to an error." });
    }
  });

  // Exception Classification API
  app.post("/api/classify-exception", async (req, res) => {
    try {
      const { exception } = req.body;
      const result = await classifyException(exception);
      res.json(result);
    } catch (error) {
      console.error("Classification error:", error);
      res.json({ 
        probableCause: "Classification failed",
        recommendedAction: "manual_review",
        reasoning: "AI reasoning temporarily unavailable. Deterministic reconciliation completed successfully." 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
