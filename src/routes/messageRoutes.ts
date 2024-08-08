import {Elysia, t} from 'elysia';
import { createConversation } from '../controllers/messagesController';

export const messageRoutes = new Elysia({prefix: '/messages'})
                .post('/conversations', ({body}) => createConversation(body), {
                    body: t.Object({
                        participants: t.Array(t.String()),
                    })
                })