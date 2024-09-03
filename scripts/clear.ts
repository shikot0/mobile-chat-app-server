import { db } from "../drizzle/db";
import { conversationParticipants, conversations, mediaMessages, messages, textMessages, users } from "../drizzle/schema";

async function clearDB() {
    console.log('Started')
    await db.delete(messages);
    await db.delete(textMessages);
    await db.delete(mediaMessages);
    await db.delete(conversationParticipants);
    await db.delete(conversations);
    await db.delete(users);
}

clearDB()
.catch(error => console.error(`Error clearing database: ${error}`))
.finally(() => {
    console.log('Cleared Database!')
})