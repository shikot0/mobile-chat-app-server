ALTER TABLE "conversation_participants" DROP CONSTRAINT "conversation_participants_id_conversations_id_fk";
--> statement-breakpoint
ALTER TABLE "conversation_participants" DROP CONSTRAINT "conversation_participants_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "conversation_participants" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD COLUMN "conversationId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD COLUMN "participantId" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_participantId_users_id_fk" FOREIGN KEY ("participantId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
