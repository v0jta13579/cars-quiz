"use server"

import { db } from "@/lib/db"
import { leaderboardEntries, quizzes, type QuizQuestion } from "@/lib/schema"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type QuizRecord = { id: string; title: string; questions: QuizQuestion[]; createdAt: string }
export type ScoreRecord = { id: string; nickname: string; score: number; totalQuestions: number; quizTitle: string; createdAt: string }

export async function getGameData(): Promise<{ quizzes: QuizRecord[]; leaderboard: ScoreRecord[] }> {
  try {
    const [savedQuizzes, scores] = await Promise.all([
      db.select().from(quizzes).orderBy(desc(quizzes.createdAt)),
      db.select().from(leaderboardEntries).orderBy(desc(leaderboardEntries.score), desc(leaderboardEntries.createdAt)).limit(20),
    ])
    return {
      quizzes: savedQuizzes.map((quiz) => ({ ...quiz, createdAt: quiz.createdAt.toISOString() })),
      leaderboard: scores.map((score) => ({ ...score, createdAt: score.createdAt.toISOString() })),
    }
  } catch (error) {
    console.error("[v0] Unable to load CAR QUIZ RACE data", error)
    return { quizzes: [], leaderboard: [] }
  }
}

function validQuestions(value: unknown): value is QuizQuestion[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) =>
    item && typeof item.question === "string" && item.question.trim().length > 0 &&
    Array.isArray(item.options) && item.options.length === 4 && item.options.every((option: unknown) => typeof option === "string" && option.trim().length > 0) &&
    Number.isInteger(item.answer) && item.answer >= 0 && item.answer < 4,
  )
}

export async function saveQuiz(input: { id?: string; title: string; questions: QuizQuestion[] }) {
  const title = input.title.trim().slice(0, 80)
  if (!title || !validQuestions(input.questions)) return { error: "Zkontroluj název a otázky kvízu." }
  let savedQuiz
  if (input.id) {
    ;[savedQuiz] = await db.update(quizzes).set({ title, questions: input.questions }).where(eq(quizzes.id, input.id)).returning()
  } else {
    ;[savedQuiz] = await db.insert(quizzes).values({ title, questions: input.questions }).returning()
  }
  if (!savedQuiz) return { error: "Kvíz se nepodařilo uložit." }
  revalidatePath("/")
  return { ok: true, quiz: { ...savedQuiz, createdAt: savedQuiz.createdAt.toISOString() } }
}

export async function deleteQuiz(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Neplatný kvíz." }
  await db.delete(quizzes).where(eq(quizzes.id, id))
  revalidatePath("/")
  return { ok: true }
}

export async function submitScore(input: { nickname: string; score: number; totalQuestions: number; quizTitle: string }) {
  const nickname = input.nickname.trim().replace(/[<>]/g, "").slice(0, 24)
  const quizTitle = input.quizTitle.trim().slice(0, 80)
  if (!nickname || !quizTitle || !Number.isInteger(input.score) || !Number.isInteger(input.totalQuestions) || input.score < 0 || input.totalQuestions < 1 || input.score > input.totalQuestions * 100) {
    return { error: "Zkontroluj přezdívku a výsledek." }
  }
  await db.insert(leaderboardEntries).values({ nickname, score: input.score, totalQuestions: input.totalQuestions, quizTitle })
  revalidatePath("/")
  return { ok: true }
}
