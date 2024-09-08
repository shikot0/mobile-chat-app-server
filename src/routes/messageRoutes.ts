import {Elysia, error, t} from 'elysia';
import { createConversation, getConversations } from '../controllers/messageController';
import { db } from '../../drizzle/db';
import { conversationParticipants, conversations, messages, users } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import {jwt} from '@elysiajs/jwt';


const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET || '';
export const messageRoutes = new Elysia({prefix: '/messages'})
.use(
    jwt({
      name: 'jwt',
      secret: AUTHORIZATION_SECRET
    })
)
.get('/conversations', ({headers: {token}, jwt}) => getConversations(token, jwt))
.get('/conversations/:id/get-messages', async ({params: {id: conversationId}, headers: {token}, jwt}) => { 
    try {
        if(!token) return error('Non-Authoritative Information');

        const jwtResult = await jwt.verify(token)
        if(!jwtResult) return error('Non-Authoritative Information');

        let {id} = jwtResult;
        id = id.toString();
        const [result] = await db.select()
        .from(users)
        // .where(eq(users.id, id))
        .leftJoin(
            conversationParticipants,
            eq(users.id, conversationParticipants.userId)
        ).where(and(eq(users.id, id), eq(conversationParticipants.conversationId, conversationId))).limit(1);

        const {users: verifiedUser, conversation_participants: verifiedParticipant} = result;
        if(!verifiedUser || !verifiedParticipant) {
            return error('Expectation Failed')
        }

        const returnedMessages = await db.select()
        .from(messages)
        .where(eq(messages.conversationId, conversationId))
        return returnedMessages
    }catch(error) {
        console.log(`Error getting messages: ${error}`)
    }
}, {
    headers: t.Object({
        token: t.String()
    }),
    params: t.Object({
        id: t.String()
    })
})
.post('/conversations/:id/post-message', async ({body, params: {id: conversationId}, headers: {token}, jwt}) => {
    try {
        if(!token) return error('Non-Authoritative Information');

        const jwtResult = await jwt.verify(token)
        if(!jwtResult) return error('Non-Authoritative Information');

        let {id} = jwtResult;
        id = id.toString();
        const [result] = await db.select()
        .from(users)
        // .where(eq(users.id, id))
        .leftJoin(
            conversationParticipants,
            eq(users.id, conversationParticipants.userId)
        ).where(and(eq(users.id, id), eq(conversationParticipants.conversationId, conversationId))).limit(1);

        const {users: verifiedUser, conversation_participants: verifiedParticipant} = result;
        if(!verifiedUser || !verifiedParticipant) {
            return error('Expectation Failed')
        }

        // const {type}
    }catch(error) {
        console.log(`Error posting message: ${error}`)
    }
}, {
    body: t.Object({})
})
.post('/new-conversation', async ({body}) => {
    try {
        console.log({body})
        const {createdBy, participants} = body;
        const creatorExists = (await db.select().from(users).where(eq(users.id, createdBy)).limit(1)).at(0);
        if(!creatorExists) return {succeeded: false, msg: 'The user trying to create thhis conversation does not exist'}

        await db.transaction(async (tx) => {
            const [conversation] = await tx.insert(conversations).values({createdBy, conversationType: participants.length > 1 ? 'group' : 'one-to-one'}).returning();
            if(!conversation) await tx.rollback();
            await tx.insert(conversationParticipants).values({conversationId: conversation.id, userId: conversation.createdBy});
            for(let i = 0; i < participants.length; i++) {
                await tx.insert(conversationParticipants).values({conversationId: conversation.id, userId: participants[i]})
            }
        })
        return {succeeded: true};
    } catch(error) {
        console.log(`Error creating new conversation: ${error}`)
    }
}, {
    body: t.Object({
        createdBy: t.String(),
        participants: t.Array(t.String()),
    })
    // body: t.Array(t.String()),
})    