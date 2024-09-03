import {Elysia} from 'elysia';
import { addUser, getAllUsers } from '../controllers/usersController';

// const userRoutes = new Elysia({ prefix: '/users' })
export const userRoutes = new Elysia({ prefix: '/users' })
                    // .get('/', ({cookie: {token}}) => getAllUsers(token))
                    // .get('/', () => getAllUsers())
                    .get('/', ({query: {page, limit}}) => getAllUsers(page, limit))

                    // .get('/?page?limit', ({query}) => {
                    //     console.log({query})
                    //     return getAllUsers()
                    // })
                    .post('/', addUser)