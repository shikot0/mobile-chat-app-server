ALTER TABLE "text_messages" DROP CONSTRAINT "text_messages_user_id_conversations_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "text_messages" ADD CONSTRAINT "text_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
