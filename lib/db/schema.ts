import { pgTable } from "drizzle-orm/pg-core";
import { serial, text } from "drizzle-orm/pg-core";

export const testTable = pgTable("test", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});
