import { Elysia } from "elysia";
import { userRoutes } from "./routes/userRoutes";
import { messageRoutes } from "./routes/messageRoutes";
import authRoutes from "./routes/authRoutes";
import {jwt} from "@elysiajs/jwt";


const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET || '';


const app = new Elysia({
  // cookie: {
  //   secrets: AUTHORIZATION_SECRET,
  //   sign: ['auth']
  // }
})
// .use(
//   jwt({
//     name: 'jwt',
//     secret: AUTHORIZATION_SECRET
//   })
// )
.use(authRoutes)
.use(userRoutes)
.use(messageRoutes)
.get("/", () => "Hello Elysia")
.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
