import {Elysia, t} from "elysia";
import { registerUser } from "../controllers/authController";
import {jwt} from "@elysiajs/jwt";
import { db } from "../../drizzle/db";
import { users } from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";
import {password as hashingFunction} from 'bun';
import sharp from "sharp";

// export type NewUser = {
//     username: string,
//     email: string,
//     password: string,
//     phoneNumber: string,
//     profilePicture: File
// }
// export type NewUser = {
//     username: string,
//     email: string,
//     password: string,
//     phoneNumber: string,
//     // profilePicture: File
// }

export const CreateNewUserSchema = t.Object({
    username: t.String(),
    email: t.String(),
    password: t.String(),
    phoneNumber: t.String(),
    // profilePicture: t.Optional(t.File())
})
const LoginUserSchema = t.Object({
    email: t.String(),
    password: t.String()
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
        // console.log({body})

        // let {username, email, password, phoneNumber, profilePicture} = body;
        let {username, email, password, phoneNumber} = body;
        username = username.trim();
        email = email.trim();
        password = password.trim();
        phoneNumber = phoneNumber.trim();
        // let blurHash;
        // if(profilePicture) {
        //     const arrayBuffer = await profilePicture.arrayBuffer();
        //     blurHash = await sharp(arrayBuffer, {animated: true}).resize(150, 150).png().toArray();
        //     console.log({blurHash});
        //     return {blurHash}
        // }

        // const returnedUser = await db.insert(users).values({username, email, password, phone: phoneNumber})
        const userExists = (await db.select().from(users).where(eq(users.username, username)).limit(1)).at(0);

        if(userExists) {
            return {succeeded: false, message: 'A user with that username already exists'}
        }

        const encryptedPassword = await hashingFunction.hash(password)
        const newUser = (await db.insert(users).values({username, email, password: encryptedPassword, phone: phoneNumber}).returning()).at(0)

        if(newUser) {
            const {id} = newUser;
            const token = await jwt.sign({id});
            const returnedUser = {id: newUser.id, username: newUser.username, email: newUser.email, phoneNumber: newUser.phone, profilePicture: newUser.profilePicture}
            return {token, user: returnedUser, succeeded: true}
            // auth.value = {
            //     id,
            //     password
            // }
        }else {
            return {succeeded: false, message: "Couldn't create user, please try again later"}
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

    // cookie: t.Cookie({
    //     auth: t.Object({
    //         id: t.String(),
    //         password: t.String()
    //     })
    // })

    // body: NewUserSchema,
    // body: t.Any()
    body: CreateNewUserSchema
})
.patch('log-in', async ({body, jwt}) => {
    try {
        let {email, password} = body;

        // console.log({body})
        email = email.trim();
        password = password.trim();
        const user = (await db.select().from(users).where(eq(users.email, email))).at(0);

        // console.log({user})
        const allUsers = await db.select({username: users.username, email: users.email}).from(users);
        // console.log({allUsers})
        if(!user) {
            return {succeeded: false, message: 'User does not exist'}
        }
        // console.log('Here!')

        const isCorrectPassword = await hashingFunction.verify(password, user.password);

        // console.log({isCorrectPassword})
        if(!isCorrectPassword) {
            return {succeeded: false, message: 'Incorrect password!'};
        }

        const returnedUser = {id: user.id, username: user.username, email: user.email, phoneNumber: user.phone, profilePicture: user.profilePicture};
        const token = await jwt.sign({id: user.id})

        return {user: returnedUser, token, succeeded: true}
    }catch(error) {
        console.log(`Login error: ${error}`)
    }
}, {
    body: LoginUserSchema
})
    

export default authRoutes;