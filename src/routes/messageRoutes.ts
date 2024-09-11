import {Elysia, error, t} from 'elysia';
import { createConversation, getConversations } from '../controllers/messageController';
import { db } from '../../drizzle/db';
// import { conversationParticipants, conversations, textMessages, users } from '../../drizzle/schema';
import { conversationParticipants, conversations, messages, users } from '../../drizzle/schema';
import { eq, and, asc, desc } from 'drizzle-orm';
import {jwt} from '@elysiajs/jwt';
import { criticallyDampedSpringCalculations } from 'react-native-reanimated/lib/typescript/reanimated2/animation/springUtils';

type Message = typeof messages.$inferSelect
type User = typeof users.$inferSelect

const AUTHORIZATION_SECRET = process.env.AUTHORIZATION_SECRET || '';

const authMiddleWare = new Elysia().use(
    jwt({
      name: 'jwt',
      secret: AUTHORIZATION_SECRET
    })
).derive({as: "global"}, async (context) => {
    if(context.request.method !== "GET") {
        const originHeader = context.request.headers.get('Origin');
        const hostHeader = context.request.headers.get("Host");
        if(!originHeader || !hostHeader) {
            return {
                user: null,
                token: null
            }
        }
    }


    const userToken = context.request.headers.get('token');
    if(!userToken) {
        return {
            user: null,
            token: null
        }
    };

    const tokenResult = await context.jwt.verify(userToken);
    if(!tokenResult) {
        return {
            user: null,
            token: userToken
        }
    }

    const {id} = tokenResult;
    const [user] = await db.select().from(users).where(eq(users.id, id.toString()));

    return {
        user,
        token: userToken
    }
})




export const messageRoutes = new Elysia({prefix: '/messages'})
.use(
    jwt({
      name: 'jwt',
      secret: AUTHORIZATION_SECRET
    })
)
.use(authMiddleWare)
.get('/conversations', ({headers: {token}, jwt}) => getConversations(token, jwt))
.get('/conversations/:id/get-messages', async ({params: {id: conversationId}, headers: {token}, jwt}) => { 
    try {
        if(!token) return error('Non-Authoritative Information');

        const jwtResult = await jwt.verify(token)
        if(!jwtResult) return error('Non-Authoritative Information');

        let {id} = jwtResult;
        id = id.toString();
        const [userVerificationResult] = await db.select()
        .from(users)
        // .where(eq(users.id, id))
        .leftJoin(
            conversationParticipants,
            eq(users.id, conversationParticipants.userId)
        ).where(and(eq(users.id, id), eq(conversationParticipants.conversationId, conversationId))).limit(1);

        const {users: verifiedUser, conversation_participants: verifiedParticipant} = userVerificationResult;
        if(!verifiedUser || !verifiedParticipant) {
            return error('Expectation Failed')
        }

        // const returnedMessages = await db.select()
        // .from(messages)
        // .where(eq(messages.conversationId, conversationId))
        // return returnedMessages

        // const returnedMessages = await db.select()
        // .from(textMessages)
        // .where(eq(textMessages.conversationId, conversationId))
        // return {succeeded: true, returnedMessages}
        const returnedMessages = await db.select()
        .from(messages)
        .innerJoin(users, eq(messages.userId, users.id))
        .where(eq(messages.conversationId, conversationId))
        // .orderBy(desc(messages.createdAt));
        .orderBy(asc(messages.createdAt)); 

        const result = returnedMessages.reduce<{ message: Message, user: User }[]>((acc, item) => {
        // const result = returnedMessages.reduce((acc, item) => {
            const {messages, users} = item;
            acc.push({message: messages, user: users})
            return acc
        }, [])

        console.log({result})
        // console.log({returnedMessages})
        return {succeeded: true, result}
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
.ws('/conversations/:id', {
    body: t.Object({
        text: t.Optional(t.String()),
        media: t.Optional(t.Array(t.File()))
    }),

    open(ws) {
        const {user} = ws.data;
        if(!user) ws.close();

        ws.subscribe(`conversations/${ws.id}`)
    }, 

    async message(ws, body) {
        const {user} = ws.data;
        if(!user) return;
        try {
            const {text, media} = body;
            if(!text && !media) return {succeeded: false, msg: 'Insufficient data provided'};

            const [res] = await db.insert(messages).values({conversationId: ws.id, userId: user.id, text}).returning();
            if(!res) return {succeeded: false, msg: "Couldn't add message"}
            // return {succeeded: true, res}
            ws.publish(`conversations/${ws.id}`, JSON.stringify(body))
        }catch(error) {
            console.log(`Error using websockets: ${error}`)
        }
        ws.publish("message", JSON.stringify(body))
    }
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

        // const {conversationId, type, text, media} = body;
        // const {type, text, media} = body;
        // if(type === 'text') {
        //     if(text) {
        //         const [res] = await db.insert(textMessages).values({conversationId, text}).returning();
        //         if(!res) return {succeeded: false, msg: "Couldn't add message"}
        //         return {succeeded: true, res}
        //     }else return {succeeded: false, msg: "Text was not provided"}
        // }else if(type === 'media') {
        //     if(media && media.length !== 0) {
        //         // TODO ADD MEDIA  
        //     }else return {succeeded: false, media: "Media was not provided"};
        // }
        // const {type, text, media} = body;
        const {text, media} = body;
        if(!text && !media) return {succeeded: false, msg: 'Insufficient data provided'};

        const [res] = await db.insert(messages).values({conversationId, userId: verifiedUser.id, text}).returning();
        if(!res) return {succeeded: false, msg: "Couldn't add message"}
        return {succeeded: true, res}
        
        

        // return error('Internal Server Error')
        // const {}

        // const {type}
    }catch(error) {
        console.log(`Error posting message: ${error}`)
    }
}, {
    body: t.Object({
        // type: t.String({default: 'text'}),
        // conversationId: t.String(),
        // type: t.String({examples: ['text', 'media']}),
        text: t.Optional(t.String()),
        media: t.Optional(t.Array(t.File()))
    }) 
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