import { getUserLessonAttempts, getInternalUserByEmail } from "@/utils/databaseQuery";
import Layout from '@/components/ui/layout'; 
import { createClient } from "@/utils/supabase/server";

export default async function dashboard() {
    const supabase = await createClient(); // Use your `server.ts` function
    const { data: { user }, error } = await supabase.auth.getUser();

    
    if (!user) {
        return (
            <div>
                <h1>Unauthorized</h1>
                <p>Please log in to view this page.</p>
            </div>
        );
    }
    


    let internalUser = await getInternalUserByEmail(String(user.email));
    
    if (!internalUser) {
        return (
            <div>
                <h1>Error</h1>
                <p>User not found in the system.</p>
            </div>
        );
    }
    const userAttempts = await getUserLessonAttempts(internalUser.id);

    return (
        <Layout>
        <h1 className="text-2xl font-bold">Hello, {internalUser.first_name}</h1>
        <br></br>
        <h1 className="text-2xl font-bold">User Lesson Attempts</h1>
              {userAttempts && userAttempts.length > 0 ? (
                  <ul>
                      {userAttempts.map((attempt, index) => (
                          <li key={index} className="p-2 border-b">
                              Section ID: {attempt.section_id} - 
                              Attempts: {attempt.completion_status} - 
                              Progress: {attempt.progress_pct} - 
                              Score: {attempt.score}
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p>No attempts found.</p>
              )} 
      </Layout>
    );
}