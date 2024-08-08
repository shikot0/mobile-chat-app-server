import { db } from "../../drizzle/db";
import { users } from "../../drizzle/schema";

export async function addUser() {
    try {
        // const newUser = await db.insert(users).values({username: 'shikoto', email: '1sh1m1da1@gmail.com', password: 'testPassword', phone: '+2202195612'}).returning();
        const newUser = await db.insert(users).values({username: 'second-user', email: 'testEmail@gmail.com', password: 'secondTestPassword', phone: '+2207024506'}).returning();

        return newUser
    } catch(error) {
        console.error(`Error: ${error}`)
    }
}

export async function getAllUsers() {
    try {
        const returnedUsers = await db.select({id: users.id, username: users.username}).from(users);
        return returnedUsers;
    }catch (error) {
        console.error(`Error: ${error}`)
    }
}