CREATE TABLE "choice" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"order_index" text NOT NULL,
	"text" text NOT NULL,
	"audio_url" text,
	"is_correct" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question" (
	"id" text PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"order_index" text NOT NULL,
	"text" text NOT NULL,
	"type" text NOT NULL,
	"image_url" text,
	"audio_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "choice" ADD CONSTRAINT "choice_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_test_id_test_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."test"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "choice_questionId_idx" ON "choice" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "choice_orderIndex_idx" ON "choice" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX "question_testId_idx" ON "question" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "question_orderIndex_idx" ON "question" USING btree ("order_index");