import {Elysia, t} from 'elysia';
import { createConversation, getConversations } from '../controllers/messagesController';
import { db } from '../../drizzle/db';
import { conversationParticipants, conversations, users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export const messageRoutes = new Elysia({prefix: '/messages'})
                .get('/conversations', () => getConversations())
                .post('/new-conversation', async ({body}) => {
                    console.log({body})
                    const {createdBy, participants} = body;
                    const creatorExists = (await db.select().from(users).where(eq(users.id, createdBy)).limit(1)).at(0);

                    if(!creatorExists) return {succeeded: false, msg: 'The user trying to create thhis conversation does not exist'}

                    await db.transaction(async (tx) => {
                        const [conversation] = await tx.insert(conversations).values({createdBy}).returning();
                        if(!conversation) await tx.rollback();

                        await tx.insert(conversationParticipants).values({conversationId: conversation.id, participantId: conversation.createdBy});

                        for(let i = 0; i < participants.length; i++) {
                            await tx.insert(conversationParticipants).values({conversationId: conversation.id, participantId: participants[i]})
                        }
                    })
                    return {succeeded: true};
                }, {
                    body: t.Object({
                        createdBy: t.String(),
                        participants: t.Array(t.String()),
                    })
                    // body: t.Array(t.String()),
                })    