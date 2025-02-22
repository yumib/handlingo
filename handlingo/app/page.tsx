import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { getUserLessonAttempts } from "@/utils/databaseQuery";


export default async function Home() {
  const userId = 1;
  const userAttempts = await getUserLessonAttempts(userId);
  console.log(userAttempts)

  return (
    <div>
      <h1>Welcome to My Next.js App</h1>
      <p>Home page is working without deleted components.</p>

      <h1 className="text-2xl font-bold">User Lesson Attempts</h1>
            {userAttempts && userAttempts.length > 0 ? (
                <ul>
                    {userAttempts.map((attempt, index) => (
                        <li key={index} className="p-2 border-b">
                            Lesson ID: {attempt.lesson_id} - 
                            Attempts: {attempt.completion_status} - 
                            Score: {attempt.score}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No attempts found.</p>
            )}

    </div>
  );
}
