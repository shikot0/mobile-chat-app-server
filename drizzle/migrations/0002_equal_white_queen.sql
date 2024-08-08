ALTER TABLE "conversations" DROP CONSTRAINT "conversations_id_unique";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_id_unique";--> statement-breakpoint
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "conversations" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();