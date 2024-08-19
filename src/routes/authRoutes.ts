import {Elysia, t} from "elysia";
import { registerUser } from "../controllers/authController";
import {jwt} from "@elysiajs/jwt";

// export type NewUser = {
//     username: string,
//     email: string,
//     password: string,
//     phoneNumber: string,
//     profilePicture: File
// }

export const NewUserSchema = t.Object({
    username: t.String(),
    email: t.String(),
    password: t.String(),
    phoneNumber: t.String(),
    // profilePicture: t.File()
})


const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET || '';

const authRoutes = new Elysia({prefix: '/auth'})
.use(
    jwt({
      name: 'jwt',
      secret: AUTHORIZATION_SECRET
    })
)
    // .put('/register', ({body}: {body: NewUser}) => registerUser(body))
    // .post('/register', async ({body, cookie: {auth}}) => {
    // .post('/register', async ({body, cookie: {auth}, jwt}) => {
.post('/register', async ({body, jwt}) => {
    try {
        console.log({body})
        const result = await registerUser(body);
        if(result !== undefined) {
            const {id, password} = result;
            const token = await jwt.sign({id})
            return {token, succeeded: true}
            // auth.value = {
            //     id,
            //     password
            // }
        }else {
            return {succeeded: false}
        } 
    } catch(error) {
        console.log(`Server error: ${error}`)
    }
}, {
    // body: t.Object({
    //     username: t.String(),
    //     email: t.String(),
    //     password: t.String(),
    //     phoneNumber: t.String(),
    //     profilePicture: t.File()
    // })
    body: NewUserSchema,
    // cookie: t.Cookie({
    //     auth: t.Object({
    //         id: t.String(),
    //         password: t.String()
    //     })
    // })
})
    

export default authRoutes;