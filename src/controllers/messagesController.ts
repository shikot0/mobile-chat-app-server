import { db } from "../../drizzle/db"
import { conversations } from "../../drizzle/schema"

export async function createConversation(body: any) {
    console.log({body})
    // const conversationId = await db.insert(conversations).values().returning()
}