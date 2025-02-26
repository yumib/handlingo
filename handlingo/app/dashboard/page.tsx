import { getUserLessonAttempts } from "@/utils/databaseQuery";
import LogoutButton from "@/components/ui/logoutButton";

export default async function dashboard() {
    const userId = 1;
    const userAttempts = await getUserLessonAttempts(userId);

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
        <LogoutButton /> 
      </div>
    );
}