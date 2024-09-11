DROP TABLE "media_messages";--> statement-breakpoint
ALTER TABLE "text_messages" ALTER COLUMN "text" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "text_messages" ADD COLUMN "media" text[10];