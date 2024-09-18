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
type Conversation = typeof conversations.$inferSelect;
type ConversationParticipant = typeof conversationParticipants.$inferSelect & Omit<User, 'password'>

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


    // console.log({route: context.request.destination, body: context.request.body})
    // const userToken = context.request.headers.get('token');
    const userToken = context.request.headers.get('token') || context.query.userToken;
    // console.log({userToken})
    // console.log({params: context.params, query: context.query})
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
            userToken
        }
    }

    const {id} = tokenResult;
    const [user] = await db.select().from(users).where(eq(users.id, id.toString()));
    return {
        user,
        userToken
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
.get('/conversations/:id/get-messages', async ({params: {id: conversationId}, headers: {token}, jwt, user, userToken}) => { 
    try {
        if(!userToken) return error('Non-Authoritative Information');
        if(!user) return error('Non-Authoritative Information');

        // const [userVerificationResult] = await db.select()
        // .from(users)
        // // .where(eq(users.id, id))
        // .leftJoin(
        //     conversationParticipants,
        //     eq(users.id, conversationParticipants.userId)
        // ).where(and(eq(users.id, user.id), eq(conversationParticipants.conversationId, conversationId))).limit(1);
        // const {users: verifiedUser, conversation_participants: verifiedParticipant} = userVerificationResult;

        // .where(eq(users.id, id))

        // if(!verifiedUser || !verifiedParticipant) {
        //     return error('Expectation Failed')
        // }
        const [userVerificationResult] = await db.select()
        .from(conversationParticipants)
        .where(and(eq(conversationParticipants.userId, user.id), eq(conversationParticipants.conversationId, conversationId))).limit(1);
        
        if(!userVerificationResult) {
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

        // console.log({result})
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
        const {user, userToken} = ws.data;
        // console.log({user, userToken})
        if(!user) ws.close();
        // ws.data.params.id

        // ws.subscribe(`conversations/${ws.}`)
        // ws.subscribe(`${ws.data.params.id}`)
        ws.subscribe(`message`)
    }, 
    async message(ws, body) {
        const {user} = ws.data;
        // console.log({messageUser: user})
        if(!user) return;
        try {
            const {text, media} = body;
            console.log({text, media})
            if(!text && !media) return {succeeded: false, msg: 'Insufficient data provided'};
            // console.log({id: ws.data.params.id})
            // await db.delete(messages).where(eq(messages.conversationId, "76f06528-576b-4b4e-850f-c2578b67fae5"));
            const [message] = await db.insert(messages).values({conversationId: ws.data.params.id, userId: user.id, text}).returning();
            if(!message) return {succeeded: false, msg: "Couldn't add message"}
            // return {succeeded: true, res}
            // ws.publish('message', JSON.stringify(body))
            // const returnedMessages = await db.select()
            // .from(messages)
            // .innerJoin(users, eq(messages.userId, users.id))
            // .where(eq(messages.conversationId, conversationId))
            const [messageUser] = await db.select()
            .from(users)
            .where(eq(users.id, message.userId))
            // ws.publish('message', JSON.stringify(res))
            ws.publish('message', JSON.stringify({message, user: messageUser}))
        }catch(error) {
            console.log(`Error using websockets: ${error}`)
        }
        // ws.publish("message", JSON.stringify(body))
    }
})
.get('/conversations/:id', async ({params: {id}, headers: {token}, user, userToken}) => {
    if(!userToken) return error('Non-Authoritative Information');
    if(!user) return error('Non-Authoritative Information');

    // const [conversation] = await db.select()
    // .from(conversations)
    // .where(eq(conversations.id, id))
    const [userVerificationResult] = await db.select()
        .from(conversationParticipants)
        .where(and(eq(conversationParticipants.userId, user.id), eq(conversationParticipants.conversationId, id))).limit(1);
        
    if(!userVerificationResult) {
        return error('Unauthorized')
    } 

    const returnedConversation = await db.select()
        .from(conversations)
        // .where(eq(conversationParticipants.participantId, id))
        .leftJoin(
            conversationParticipants, 
            eq(conversations.id, conversationParticipants.conversationId)
        )
        .leftJoin(
            users, 
            eq(conversationParticipants.userId, users.id)
        )
        .where(eq(conversations.id, id))

    const resultObj = returnedConversation.reduce<Record<string, { conversation: Conversation; conversationParticipants: ConversationParticipant[] }>>(
        (acc, row) => {
            const conversation = row.conversations;
            const conversationParticipant = row.conversation_participants;
            const user = row.users;
            
            //   console.log({conversation})
            if (conversation && !acc[`${conversation.id}`]) {
                acc[`${conversation.id}`] = { conversation, conversationParticipants: [] };
                // console.log({conversationParticipant, user})
            }
            if (conversation && conversationParticipant && user) {
                const userWithoutPassword = {id: user.id, username: user?.username, email: user.email, phone: user.phone, profilePicture: user.profilePicture, createdAt: user.createdAt}
                //   acc[`${conversation.id}`].conversationParticipants.push({...conversationParticipant, ...userWithoutPassword});
                // const newConversationParticipants = [...acc[`${conversation.id}`].conversationParticipants, {...conversationParticipant, ...userWithoutPassword}]
                // acc[`${conversation.id}`].conversationParticipants = newConversationParticipants;
                acc[`${conversation.id}`].conversationParticipants.push({...conversationParticipant, ...userWithoutPassword});
            }
            
        //     if (conversationParticipant && user) {
        //       const userWithoutPassword = {id: user.id, username: user?.username, email: user.email, phone: user.phone, profilePicture: user.profilePicture, createdAt: user.createdAt}
        //     // const newConversationParticipants = [...acc[`${conversations.id}`].conversationParticipants, {...conversationParticipants, ...userWithoutPassword}]
        //     // acc[`${conversations.id}`].conversationParticipants = newConversationParticipants
        //         acc[`${conversation.id}`].conversationParticipants.push({...conversationParticipant, ...userWithoutPassword});
        //     }
      
            return acc;
        },
        {}
    );
    const [result] = Object.values(resultObj);
    if(!result) return error('No Content')
    // console.log({result})
    return {result, succeeded: true};
}) 
.post('/conversations/:id/post-message', async ({body, params: {id: conversationId}, headers: {token}, jwt, user, userToken}) => {
    try {
        if(!userToken) return error('Non-Authoritative Information');
        if(!user) return error('Non-Authoritative Information');
        // const jwtResult = await jwt.verify(token)
        // if(!jwtResult) return error('Non-Authoritative Information');

        // let {id} = jwtResult;
        // id = id.toString();
        // const [result] = await db.select()
        // .from(users)
        // // .where(eq(users.id, id))
        // .leftJoin(
        //     conversationParticipants,
        //     eq(users.id, conversationParticipants.userId)
        // ).where(and(eq(users.id, id), eq(conversationParticipants.conversationId, conversationId))).limit(1);

        // const {users: verifiedUser, conversation_participants: verifiedParticipant} = result;
        // if(!verifiedUser || !verifiedParticipant) {
        //     return error('Expectation Failed')
        // }

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
        const [userVerificationResult] = await db.select()
        .from(conversationParticipants)
        .where(and(eq(conversationParticipants.userId, user.id), eq(conversationParticipants.conversationId, conversationId))).limit(1);
        
        if(!userVerificationResult) {
            return error('Expectation Failed')
        } 

        const {text, media} = body;
        if(!text && !media) return {succeeded: false, msg: 'Insufficient data provided'};

        // const [res] = await db.insert(messages).values({conversationId, userId: verifiedUser.id, text}).returning();
        const [res] = await db.insert(messages).values({conversationId, userId: user.id, text}).returning();
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