import { integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

export type QuizQuestion = {
  question: string
  options: [string, string, string, string]
  answer: number
}

export const quizzes = pgTable("quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  questions: jsonb("questions").$type<QuizQuestion[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  nickname: varchar("nickname", { length: 24 }).notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  quizTitle: text("quiz_title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})
