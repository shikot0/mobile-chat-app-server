ALTER TABLE "conversation_participants" DROP CONSTRAINT "conversation_participants_conversationId_conversations_id_fk";
--> statement-breakpoint
ALTER TABLE "conversation_participants" DROP CONSTRAINT "conversation_participants_participantId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD COLUMN "conversation_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD COLUMN "participant_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_participant_id_users_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "conversation_participants" DROP COLUMN IF EXISTS "conversationId";--> statement-breakpoint
ALTER TABLE "conversation_participants" DROP COLUMN IF EXISTS "participantId";