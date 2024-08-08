import { pgTable, uuid, text, varchar, timestamp } from "drizzle-orm/pg-core";


export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    username: text('username').unique().notNull(),
    email: text('email').unique().notNull(),
    phone: varchar('phone_number', {length: 256}).notNull(),
    password: text('password').notNull(),
    profilePicture: text('profile_picture'),
    createdAt: timestamp('created_at').defaultNow().notNull()
})

export const messages = pgTable('messages', {
    id: uuid('id').defaultRandom().primaryKey(),
    senderId: uuid('sender_id').references(() => users.id).notNull(),
    // status: text('status', {enum: ['sent', 'delivered', 'read']}).notNull(),
    status: text('status', {enum: ['sent', 'delivered', 'read']}).default('sent').notNull(),
    // conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
    text: text('text').notNull(),
})

export const conversations = pgTable('conversations', { 
    id: uuid('id').defaultRandom().primaryKey(),
    createdAt: timestamp('created_at').defaultNow(),
    // createdBy: uuid('id').references(() => users.id).notNull()
})

export const conversationParticipants = pgTable('conversation_participants', {
    id: uuid('id').defaultRandom().primaryKey(),
    conversationId: uuid('id').references(() => conversations.id).notNull(),
    participantId: uuid('id').references(() => users.id).notNull(),
    joinDate: timestamp('join_date').defaultNow(),
})