import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { FolderController, FileController, SearchController } from "./controllers";

const app = new Elysia()
  .use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],
    credentials: true,
  }))
  .get("/", () => "File Explorer API is running!")
  .get("/health", () => ({ status: "healthy", timestamp: new Date().toISOString() }))
  .use(new FolderController().routes())
  .use(new FileController().routes())
  .use(new SearchController().routes())
  .listen(3001);

console.log(`🦊 Elysia is running at http://localhost:3001`);

export type App = typeof app;
