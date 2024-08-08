ALTER TABLE "conversations" ADD CONSTRAINT "conversations_id_unique" UNIQUE("id");--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_id_unique" UNIQUE("id");