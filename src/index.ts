import { Elysia } from "elysia";
import { userRoutes } from "./routes/userRoutes";
import { messageRoutes } from "./routes/messageRoutes";

const app = new Elysia()
                .use(userRoutes)
                .use(messageRoutes)
                .get("/", () => "Hello Elysia")
                .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
