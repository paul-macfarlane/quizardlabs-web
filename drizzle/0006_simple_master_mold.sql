ALTER TABLE "answer" ADD COLUMN "is_correct" boolean;--> statement-breakpoint
ALTER TABLE "answer" ADD COLUMN "graded_at" timestamp;--> statement-breakpoint
ALTER TABLE "answer" ADD COLUMN "graded_by" text;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "free_text_mode" text;--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "expected_answer" text;--> statement-breakpoint
ALTER TABLE "submission" ADD COLUMN "score" integer;--> statement-breakpoint
ALTER TABLE "submission" ADD COLUMN "max_score" integer;--> statement-breakpoint
ALTER TABLE "submission" ADD COLUMN "is_fully_graded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_graded_by_user_id_fk" FOREIGN KEY ("graded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;