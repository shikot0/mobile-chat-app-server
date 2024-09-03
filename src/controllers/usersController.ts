import { Cookie } from "elysia";
import { db } from "../../drizzle/db";
import { users } from "../../drizzle/schema";

// type AddUserProps = {
//     page: number,
//     limit?: number
// }

export async function addUser() {
    try {
        // const newUser = await db.insert(users).values({username: 'shikoto', email: '1sh1m1da1@gmail.com', password: 'testPassword', phone: '+2202195612'}).returning();
        const newUser = await db.insert(users).values({username: 'second-user', email: 'testEmail@gmail.com', password: 'secondTestPassword', phone: '+2207024506'}).returning();

        return newUser
    } catch(error) {
        console.error(`Error: ${error}`)
    }
}

// export async function getAllUsers(token?: Cookie<string | undefined>, page?: number, limit?: number) {
// export async function getAllUsers(page?: number, limit?: number) {
export async function getAllUsers(pageProp?: string, limitProp?: string) {
    try {

        // console.log({query})
        // console.log({token, value: token?.value})
        // let page: number;
        // let limit: number;
        // if(pageProp === undefined || parseInt(pageProp) <= 0) page = 1;
        // if(limitProp === undefined || parseInt(limitProp) <= 0) limit = 20;
        // page--
        let page: number = pageProp ? parseInt(pageProp) : 1;
        let limit: number = limitProp ? parseInt(limitProp) : 20;
        if(page <= 0) page = 1;
        if(limit) limit = 20;
        page--

        // console.log('started')

        const returnedUsers = await db.select({id: users.id, username: users.username, phoneNumber: users.phone, profilePicture: users.profilePicture}).from(users).limit(limit).offset(page * limit);
        return returnedUsers;
    }catch (error) {
        console.error(`Error: ${error}`)
    }
} 