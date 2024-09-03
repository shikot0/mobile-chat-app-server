import { pgTable, uuid, text, varchar, timestamp, foreignKey } from "drizzle-orm/pg-core";


export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    username: text('username').unique().notNull(),
    email: text('email').unique().notNull(),
    phone: varchar('phone_number', {length: 256}).notNull(),
    password: text('password').notNull(),
    profilePicture: text('profile_picture'),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow().notNull()
})

// export const messages = pgTable('messages', {
//     id: uuid('id').defaultRandom().primaryKey(),
//     senderId: uuid('sender_id').references(() => users.id).notNull(),
//     // status: text('status', {enum: ['sent', 'delivered', 'read']}).notNull(),
//     status: text('status', {enum: ['sent', 'delivered', 'read']}).default('sent').notNull(),
//     // conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
//     text: text('text').notNull(),
// })
export const messages = pgTable('messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    type: text('type', {enum: ['text', 'media', 'audio']}),
    // text: text('text').notNull(),
    // messageId: uuid('message_id').references(() => textMessages.id, mediaMessages.id),
    // messageId: uuid('message_id').references(() => [textMessages.id, mediaMessages.id]),
    messageId: uuid('message_id').references(() => textMessages.id).notNull(),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).defaultNow().notNull()
})
// }, (table) => {
//     return {
//         messagesReference: foreignKey({
//             // columns: [table.messageId],
//             // foreignColumns: [textMessages.id, mediaMessages.id],
//             // foreignColumns: [table.messageId],
//             // columns: [textMessages.id, mediaMessages.id],
//             // foreignColumns: {"0"},
//             columns: [table.messageId],
//             foreignColumns: [users],
//             name: 'message_reference'
//         })
//     }
// })

export const textMessages = pgTable('text_messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    text: text('text').notNull(),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).defaultNow().notNull()
})

// export const imageMessages = pgTable('image_messages', {
export const mediaMessages = pgTable('media_messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    medias: text('media').array(10).notNull(),
    text: text('text'),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', {withTimezone: true}).defaultNow().notNull()
})

export const conversations = pgTable('conversations', { 
    id: uuid('id').defaultRandom().primaryKey(),
    createdBy: uuid('created_by').references(() => users.id).notNull(),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
    // createdBy: uuid('id').references(() => users.id).notNull()
})

export const conversationParticipants = pgTable('conversation_participants', {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
    participantId: uuid('participant_id').references(() => users.id).notNull(),
    joinDate: timestamp('join_date', {withTimezone: true}).defaultNow(),
})