import { eq } from "drizzle-orm";
import { db } from "../../drizzle/db";
import { users } from "../../drizzle/schema";

export type NewUser = {
    username: string,
    email: string,
    password: string,
    phoneNumber: string,
    // profilePicture: File
}

export type ReturnedUser = {
    username: string;
    email: string;
    password: string;
    profilePicture: string | null;
    id: string;
    phone: string;
    createdAt: Date;
}


export async function registerUser(body: NewUser): Promise<ReturnedUser | undefined> {
    try {
        // const {username, email, password, phoneNumber, profilePicture} = body;
        const {username, email, password, phoneNumber} = body;

        // const returnedUser = await db.insert(users).values({username, email, password, phone: phoneNumber})
        const userExists = (await db.select().from(users).where(eq(users.username, username)).limit(1)).at(0);


        const returnedUser = await db.insert(users).values({username, email, password, phone: phoneNumber}).returning()

        return returnedUser[0]
    }catch(error) {
        console.log(`Server error: ${error}`)
    } 
}