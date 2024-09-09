DROP TABLE "messages";--> statement-breakpoint
ALTER TABLE "media_messages" ADD COLUMN "conversation_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "text_messages" ADD COLUMN "conversation_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media_messages" ADD CONSTRAINT "media_messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "text_messages" ADD CONSTRAINT "text_messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
