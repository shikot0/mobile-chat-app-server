ALTER TABLE "text_messages" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "text_messages" ADD CONSTRAINT "text_messages_user_id_conversations_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
