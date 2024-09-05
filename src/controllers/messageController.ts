import { eq } from "drizzle-orm"
import { db } from "../../drizzle/db"
import { conversationParticipants, conversations, users } from "../../drizzle/schema"
import { error } from "elysia";
import { password as hashingFunction } from "bun";
import { JWTOption, JWTPayloadSpec } from "@elysiajs/jwt";

export async function createConversation(body: any) {
    console.log({body})
    // const conversationId = await db.insert(conversations).values().returning()
}

type Conversation = typeof conversations.$inferSelect;
type ConversationParticipant = typeof conversationParticipants.$inferSelect;
type Users = typeof users.$inferSelect;

export async function getConversations(token: string | undefined, jwt:{
    readonly sign: (morePayload: Record<string, string | number> & JWTPayloadSpec) => Promise<string>;
    readonly verify: (jwt?: string) => Promise<false | (Record<string, string | number> & JWTPayloadSpec)>;
}) {
    try {
        // console.log('here')
        // console.log({test})
        if(!token) return error('Non-Authoritative Information');


        // const returnedConversations = await db.select()
        // .from(conversations)
        // .innerJoin(
        //     conversationParticipants, 
        //     eq(conversations.id, conversationParticipants.conversationId)
        // )
        // .innerJoin(
        //     users, 
        //     eq(conversationParticipants.participantId, users.id)
        // )

        const jwtResult = await jwt.verify(token)

        if(!jwtResult) return error('Non-Authoritative Information');

        let {id} = jwtResult;
        id = id.toString();
        const [user] = await db.select().from(users).where(eq(users.id, id));

        if(!user) {
            return error('Expectation Failed')
        }

        const returnedConversations = await db.select()
        .from(conversationParticipants)
        .where(eq(conversationParticipants.participantId, id))
        .innerJoin(
            conversations, 
            eq(conversationParticipants.conversationId, conversations.id)
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
              const userWithoutPassword = {id: user.id, username: user.username, email: user.email, phone: user.phone, profilePicture: user.profilePicture, createdAt: user.createdAt}
            
          
              if (!acc[`${conversations.id}`]) {
                acc[`${conversations.id}`] = { conversation, conversationParticipants: [] };
              }
          
              if (conversationParticipant) {
                acc[`${conversations.id}`].conversationParticipants.push({...conversationParticipant, ...userWithoutPassword});
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
        return {result, succeeded: true};
    } catch(error) {
        console.log(`Server error: ${error}`)
    }
} 