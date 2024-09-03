import { eq } from "drizzle-orm"
import { db } from "../../drizzle/db"
import { conversationParticipants, conversations, users } from "../../drizzle/schema"

export async function createConversation(body: any) {
    console.log({body})
    // const conversationId = await db.insert(conversations).values().returning()
}

type Conversation = typeof conversations.$inferSelect;
type ConversationParticipant = typeof conversationParticipants.$inferSelect;
type Users = typeof users.$inferSelect;

export async function getConversations() {
    try {
        console.log('here')
        const returnedConversations = await db.select()
        .from(conversations)
        .innerJoin(
            conversationParticipants, 
            eq(conversations.id, conversationParticipants.conversationId)
        // ).groupBy(conversationParticipants.conversationId)
        )
        .innerJoin(
            users, 
            eq(conversationParticipants.participantId, users.id)
        )

        // const result = returnedConversations.reduce<Record<number, { conversation: Conversation; conversationParticipants: ConversationParticipant[] }>>(
        const resultObj = returnedConversations.reduce<Record<string, { conversation: Conversation; conversationParticipants: ConversationParticipant[] }>>(
            (acc, row) => {
              const conversation = row.conversations;
              const conversationParticipant = row.conversation_participants;
              const user = row.users;
          
              if (!acc[`${conversations.id}`]) {
                acc[`${conversations.id}`] = { conversation, conversationParticipants: [] };
              }
          
              if (conversationParticipant) {
                acc[`${conversations.id}`].conversationParticipants.push({...conversationParticipant, ...user});
              }
          
              return acc;
            },
            {}
        );
        const result = Object.values(resultObj);
        console.log({result})
        // const returnedConversations = await db.select()
        // .from(conversations)
        // .innerJoin(
        //     conversationParticipants, 
        //     eq(conversations.id, conversationParticipants.conversationId)
        // // ).groupBy(conversationParticipants.conversationId)
        // )

        // const returnedConversations = await db.select().from(conversationParticipants)
        // .leftJoin(users, eq(conversationParticipants.participantId, users.id))
        // .leftJoin(conversations, eq(conversationParticipants.conversationId, conversations.id))
        // const returnedConversations = await db.select()
        // .from(conversations)
        // .fullJoin(
        //     conversationParticipants, 
        //     eq(conversations.id, conversationParticipants.conversationId)
        // )
        // .fullJoin(
        //     users, 
        //     eq(conversationParticipants.participantId, users.id)
        // )

        // console.log({returnedConversations})

        // return {returnedConversations, succeeded: true};
        return {returnedConversations: result, succeeded: true};
    } catch(error) {
        console.log(`Server error: ${error}`)
    }
} 