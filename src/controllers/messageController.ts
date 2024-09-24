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
// type ConversationParticipant = typeof conversationParticipants.$inferSelect;
// type ConversationParticipant = typeof conversationParticipants.$inferSelect & {
//     id: string,
//     username: string,
//     email: string,
//     phone: string,
//     profilePicture: string | null, 
//     createdAt: string
// }
type ConversationParticipant = typeof conversationParticipants.$inferSelect & Omit<Users, 'password'>
type Users = typeof users.$inferSelect;

export async function getConversations(token: string | undefined, jwt:{
    readonly sign: (morePayload: Record<string, string | number> & JWTPayloadSpec) => Promise<string>;
    readonly verify: (jwt?: string) => Promise<false | (Record<string, string | number> & JWTPayloadSpec)>;
}) {
    try {
        if(!token) return error('Non-Authoritative Information');

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
        .leftJoin(
            users, 
            eq(conversationParticipants.userId, users.id)
        )
        .leftJoin(
            conversations, 
            eq(conversationParticipants.conversationId, conversations.id)
        )

        const resultObj = returnedConversations.reduce<Record<string, { conversation: Conversation; conversationParticipants: ConversationParticipant[] }>>(
            (acc, row) => {
                const conversation = row.conversations;
                const conversationParticipant = row.conversation_participants;
                const user = row.users;
                
                if (conversation && !acc[`${conversation.id}`]) {
                    acc[`${conversation.id}`] = { conversation, conversationParticipants: [] };
                }
                if (conversation && conversationParticipant && user) {
                    const userWithoutPassword = {id: user.id, username: user?.username, email: user.email, phone: user.phone, profilePicture: user.profilePicture, createdAt: user.createdAt}
                    acc[`${conversation.id}`].conversationParticipants.push({...conversationParticipant, ...userWithoutPassword});
                }
                
                return acc;
            },
            {}
        );
        const result = Object.values(resultObj);

        return {result, succeeded: true};
    } catch(error) {
        console.log(`Server error: ${error}`)
    }
} 