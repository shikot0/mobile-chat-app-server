import {Elysia, t} from "elysia";
import { registerUser } from "../controllers/authController";

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
    profilePicture: t.File()
})


const authRoutes = new Elysia({prefix: '/auth'})
    // .put('/register', ({body}: {body: NewUser}) => registerUser(body))
    // .post('/register', async ({body, cookie: {auth}}) => {
    .post('/register', async ({body, cookie: {auth}}) => {
        const result = await registerUser(body);
        if(result !== undefined) {
            const {id, password} = result;
            auth.value = {
                id,
                password
            }
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
        cookie: t.Cookie({
            auth: t.Object({
                id: t.String(),
                password: t.String()
            })
        })
    })
    

export default authRoutes;