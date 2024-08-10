import { db } from "../drizzle/db"
import { conversationParticipants, conversations, users } from "../drizzle/schema"

type User = {
    id: string,
    username: string,
    email: string,
    phone: string,
    password: string
}


const newUsers: User[] = [
    {
        id: '86d18a51-3436-422a-bcd5-799859c8a16d',
        username: 'shikoto',
        email: '1sh1m1da1@gmail.com',
        phone: '+2202195612',
        password: 'testpassword'
    },
    {
        id: 'df51b6f7-87ae-4d1f-854e-c4e1c93cf020',
        username: 'user_number_two',
        email: 'testEmail@gmail.com',
        phone: '+2207024506',
        password: 'testpassword2'
    }
]


// let newConversationParticipants: ConversationParticipants[] = [];
async function addUsers(newUsers: User[]) {
    let newConversationParticipants: ConversationParticipants[] = [];
    await db.delete(users);

    for(let i = 0; i < newUsers.length; i++) {
        const {username, email, phone, password} = newUsers[i];
        const userArray: {id: string}[] = await db.insert(users).values({username, email, phone, password}).returning();
        const newUser = userArray[0];
        newConversationParticipants.push({participantId: newUser.id})
    }
    
    console.log('Added Users!');
    return newConversationParticipants;
}

type ConversationParticipants = {
    // conversationId: string,
    participantId: string,
}

// const newConversationParticipants: ConversationParticipants[]  = [
//     {
//         participantId: '86d18a51-3436-422a-bcd5-799859c8a16d'
//     },
//     {
//         participantId: 'df51b6f7-87ae-4d1f-854e-c4e1c93cf020'
//     }
// ]

async function addConversation(newConversationParticipants: ConversationParticipants[]) {
    await db.delete(conversationParticipants);
    await db.delete(conversations);

    const idArray: {id: string}[] = await db.insert(conversations).values({}).returning();
    const conversationId = idArray[0].id;

    for(let i = 0; i < newConversationParticipants.length; i++) {
        const {participantId} = newConversationParticipants[i];
        console.log({conversationId, participantId})
        await db.insert(conversationParticipants).values({conversationId, participantId})
    }

    console.log('Added Conversation!')
}

// addUsers(newUsers)
// .then(() => {
//     console.log('Added users!')
// })
// .catch(error => {
//     console.error(`Error: ${error}`)
// })

// Promise.all([addUsers(newUsers), addConversation(newConversationParticipants)])
// .then(() => {
//     console.log('Completed Seeding');
// })
// .catch(error => {
//     console.error(`Error: ${error}`)
// })

addUsers(newUsers)
.then((newConversationParticipants) => {
    addConversation(newConversationParticipants)
    .catch(error => {
        console.error(`Error: ${error}`)
    })
})
.catch(error => {
    console.error(`Error: ${error}`)
})
// .finally(() => {
//     console.log('Finished Script')
// })