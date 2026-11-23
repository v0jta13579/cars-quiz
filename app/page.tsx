import { getGameData } from "@/lib/actions"
import { CarQuizGame } from "@/components/car-quiz-game"

export const dynamic = "force-dynamic"

export default async function Home() {
  const { quizzes, leaderboard } = await getGameData()
  return <CarQuizGame initialQuizzes={quizzes} initialLeaderboard={leaderboard} />
}
