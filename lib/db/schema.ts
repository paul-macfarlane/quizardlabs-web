import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// --- Auth Schema ---
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  roles: many(userRole),
  testsCreated: many(test),
  submissions: many(submission),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
// --- End Auth Schema ---

export const userRole = pgTable(
  "user_role",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["test_maker", "test_taker"] }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_role_userId_idx").on(table.userId),
    index("user_role_role_idx").on(table.role),
  ],
);

export const userRoleRelations = relations(userRole, ({ one }) => ({
  user: one(user, {
    fields: [userRole.userId],
    references: [user.id],
  }),
}));

export const test = pgTable(
  "test",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("test_createdBy_idx").on(table.createdBy),
    index("test_createdAt_idx").on(table.createdAt),
  ],
);

export const testRelations = relations(test, ({ one, many }) => ({
  creator: one(user, {
    fields: [test.createdBy],
    references: [user.id],
  }),
  questions: many(question),
  submissions: many(submission),
}));

export const question = pgTable(
  "question",
  {
    id: text("id").primaryKey(),
    testId: text("test_id")
      .notNull()
      .references(() => test.id, { onDelete: "cascade" }),
    orderIndex: text("order_index").notNull(),
    text: text("text").notNull(),
    type: text("type", {
      enum: ["multi_choice", "multi_answer", "free_text"],
    }).notNull(),
    imageUrl: text("image_url"),
    audioUrl: text("audio_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("question_testId_idx").on(table.testId),
    index("question_orderIndex_idx").on(table.orderIndex),
  ],
);

export const questionRelations = relations(question, ({ one, many }) => ({
  test: one(test, {
    fields: [question.testId],
    references: [test.id],
  }),
  choices: many(choice),
}));

export const choice = pgTable(
  "choice",
  {
    id: text("id").primaryKey(),
    questionId: text("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    orderIndex: text("order_index").notNull(),
    text: text("text").notNull(),
    audioUrl: text("audio_url"),
    isCorrect: boolean("is_correct").default(false).notNull(),
  },
  (table) => [
    index("choice_questionId_idx").on(table.questionId),
    index("choice_orderIndex_idx").on(table.orderIndex),
  ],
);

export const choiceRelations = relations(choice, ({ one }) => ({
  question: one(question, {
    fields: [choice.questionId],
    references: [question.id],
  }),
}));

export const submission = pgTable(
  "submission",
  {
    id: text("id").primaryKey(),
    testId: text("test_id")
      .notNull()
      .references(() => test.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    submittedAt: timestamp("submitted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("submission_testId_idx").on(table.testId),
    index("submission_userId_idx").on(table.userId),
  ],
);

export const answer = pgTable(
  "answer",
  {
    id: text("id").primaryKey(),
    submissionId: text("submission_id")
      .notNull()
      .references(() => submission.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => question.id, { onDelete: "cascade" }),
    choiceId: text("choice_id").references(() => choice.id, {
      onDelete: "cascade",
    }),
    textResponse: text("text_response"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("answer_submissionId_idx").on(table.submissionId),
    index("answer_questionId_idx").on(table.questionId),
    index("answer_choiceId_idx").on(table.choiceId),
  ],
);

// Storage pattern:
// - multi_choice: 1 answer row with choiceId set
// - multi_answer: N answer rows with different choiceIds
// - free_text: 1 answer row with textResponse set, choiceId null

export const submissionRelations = relations(submission, ({ one, many }) => ({
  test: one(test, {
    fields: [submission.testId],
    references: [test.id],
  }),
  user: one(user, {
    fields: [submission.userId],
    references: [user.id],
  }),
  answers: many(answer),
}));

export const answerRelations = relations(answer, ({ one }) => ({
  submission: one(submission, {
    fields: [answer.submissionId],
    references: [submission.id],
  }),
  question: one(question, {
    fields: [answer.questionId],
    references: [question.id],
  }),
  choice: one(choice, {
    fields: [answer.choiceId],
    references: [choice.id],
  }),
}));
