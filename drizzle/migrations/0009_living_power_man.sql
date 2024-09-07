ALTER TABLE "conversation_participants" DROP CONSTRAINT "conversation_participants_participant_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "conversation_participants" DROP COLUMN IF EXISTS "participant_id";