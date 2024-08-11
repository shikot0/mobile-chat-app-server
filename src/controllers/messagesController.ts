import { eq } from "drizzle-orm"
import { db } from "../../drizzle/db"
import { conversationParticipants, conversations, users } from "../../drizzle/schema"

export async function createConversation(body: any) {
    console.log({body})
    // const conversationId = await db.insert(conversations).values().returning()
}

export async function getConversations() {
    try {
        console.log('here')
        const returnedConversations = await db.select()
        .from(conversations)
        .innerJoin(
            conversationParticipants, 
            eq(conversations.id, conversationParticipants.conversationId)
        )
        .innerJoin(
            users, 
            eq(conversationParticipants.participantId, users.id)
        )

        return returnedConversations;
    } catch(error) {
        console.log(`Server error: ${error}`)
    }
} 