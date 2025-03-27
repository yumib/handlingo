import { getUserLessonAttempts, getInternalUserByEmail, getUnitbyNum, getSectionsbyUnitNum } from "@/utils/databaseQuery";
import Layout from '@/components/ui/layout'; 
import { createClient } from "@/utils/supabase/server";
import Link from 'next/link';

export default async function dashboard() {

    // get auth user 
    const supabase = await createClient(); 
    const { data: { user }, error } = await supabase.auth.getUser();

    
    if (!user) {
        return (
            <div>
                <h1>Unauthorized</h1>
                <p>Please log in to view this page.</p>
            </div>
        );
    }
    

    // get user from User_Table 
    let internalUser = await getInternalUserByEmail(String(user.email));
    
    if (!internalUser) {
        return (
            <div>
                <h1>Error</h1>
                <p>User not found in the system.</p>
            </div>
        );
    }

    // user specific information
    const userAttempts = await getUserLessonAttempts(internalUser.id) ?? [];
    const unitInfo = await getUnitbyNum(1);
    const sectionInfo = await getSectionsbyUnitNum(unitInfo?.id) ?? [];

    return (
        <Layout>
        <h1 className="text-2xl font-bold">Hello, {internalUser.first_name ?? "User"}</h1>
        <br />
        <h1 className="text-2xl font-bold">User Lessons</h1>
        <h2>{unitInfo?.unit_name ?? "Unknown Unit"}</h2>
        {sectionInfo.length > 0 ? (
            <ul>
                {sectionInfo.map((sec) => {
                    // Find user's latest attempt progress for this section
                    const attempt = userAttempts.find(attempt => attempt.section_id === sec.id);
                    const progress = attempt?.progress_pct ?? 0;

                    return (
                        <li key={sec.id} className="p-2 border-b">
                            <strong>{sec.title ?? "Untitled Section"}</strong> - {sec.description ?? "No description"}
                            <p className="ml-4 text-gray-500">Progress: {progress}%</p>

                            {/* Link to dynamic section page (handles logic for lesson, quiz, exam) */}
                            <Link href={`/sections/${sec.id}`} className="ml-4 mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded">
                                Continue
                            </Link>
                        </li>
                    );
                })}
            </ul>
        ) : (
            <p>No sections found.</p>
        )}
        </Layout>
    );
}