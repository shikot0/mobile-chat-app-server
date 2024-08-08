import {Elysia} from 'elysia';
import { addUser, getAllUsers } from '../controllers/usersController';

// const userRoutes = new Elysia({ prefix: '/users' })
export const userRoutes = new Elysia({ prefix: '/users' })
                    .get('/', getAllUsers)
                    .post('/', addUser)