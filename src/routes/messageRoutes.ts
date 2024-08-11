import {Elysia, t} from 'elysia';
import { createConversation, getConversations } from '../controllers/messagesController';

export const messageRoutes = new Elysia({prefix: '/messages'})
                .get('/conversations', () => getConversations())
                .post('/conversations', ({body}) => createConversation(body), {
                    body: t.Object({
                        participants: t.Array(t.String()),
                    })
                })    