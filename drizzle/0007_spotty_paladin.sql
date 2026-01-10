ALTER TABLE "answer" DROP CONSTRAINT "answer_graded_by_user_id_fk";
--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_graded_by_user_id_fk" FOREIGN KEY ("graded_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;