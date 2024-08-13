import { Elysia } from "elysia";
import { userRoutes } from "./routes/userRoutes";
import { messageRoutes } from "./routes/messageRoutes";
import authRoutes from "./routes/authRoutes";
import {jwt} from "@elysiajs/jwt";


const AUTHORIZATION_KEY = process.env.AUTHORIZATION_KEY || '';

const app = new Elysia({
  // cookie: {
  //   secrets: AUTHORIZATION_KEY,
  //   sign: ['auth']
  // }
})
.use(
  jwt({
    name: 'jwt',
    secret: AUTHORIZATION_KEY
  })
)
.use(authRoutes)
.use(userRoutes)
.use(messageRoutes)
.get("/", () => "Hello Elysia")
.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
