import { getUserLessonAttempts, getInternalUserByEmail, getUnitbyNum, getSectionsbyUnitNum } from "@/utils/databaseQuery";
import { createClient } from "@/utils/supabase/server";
import Link from 'next/link';

{/* Gabe Lira recommended breaking this up into Functional Components! Cleaner way to organize*/}
type LessonsOverviewProps = {
    sectionInfo: any[];
    userAttempts: any[];
    unitInfo: any;
};

{/* LessonsOverview is the box with unit selection + the subunits that are part of it */}
const LessonsOverview = ({ sectionInfo, userAttempts, unitInfo }: LessonsOverviewProps) => {
    return <>
    {/* Unit Select */}
    <div className="flex items-center justify-between pt-5 pl-5 w-1/4">
        <h1 className="w-1/3 text-sm font-semibold font-fira text-black pl-5 mb-4 pb-2 border-b-2 border-black">
            Unit 1
        </h1>

        <h1 className="w-1/3 text-sm font-semibold font-fira text-gray mb-4 pb-2 border-b-2 border-gray max-w-max">
            Unit 2   {/* Change to Link once more lessons exist */}
        </h1>

        <h1 className="w-1/3 text-sm font-semibold font-fira text-gray mb-4 pb-2 border-b-2 border-gray max-w-max">
            Unit 3   {/* Change to Link once more lessons exist */}
        </h1>
    </div>

    {/* Unit Title */}
    <h2>{unitInfo?.unit_name ?? "Unknown Unit"}</h2>
    
    {/* Section List */}
    {sectionInfo.length > 0 ? (
        <ul>
            {sectionInfo.map((sec) => {
                // Find user's latest attempt progress for this section
                const attempt = userAttempts.find(attempt => attempt.section_id === sec.id);
                const progress = attempt?.progress_pct ?? 0;

                return (
                    <li key={sec.id} className="p-2 border-b">
                        <strong>{sec.title ?? "Untitled Section"}</strong> - {sec.description ?? "No description"}
                        <p className="ml-4 text-gray-500">Progress: {Math.round(progress)}%</p>

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
        )
    } </>
}

{/* PimpLeader is the box with pimp tip + leaderboard and stats */}
const PimpLeader = () => {
    return <>
    <h2>
        <ul>
            <li>Item 1</li>
        </ul>
    </h2>
    <h2>
        <ul>
            <li>Item 1</li>
        </ul>
    </h2>
    <h2>
        <ul>
            <li>Item 1</li>
        </ul>
    </h2>
    <h2>
        <ul>
            <li>Item 1</li>
        </ul>
    </h2>
    
    </>
}

{/* Everything below is part of whats getting output */}
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

    // UI stuff
    return ( <>
        <div className= "flex min-h-screen min-w-48 w-full mt-14 bg-green-400">
            {/* unit selection + subunits */}
            <div className= "w-2/3 m-7 mr-4 border-2 border-black bg-blue-400">
                <LessonsOverview
                    sectionInfo={sectionInfo}
                    userAttempts={userAttempts}
                    unitInfo={unitInfo}
                />
            </div>

            {/* pimp tip + leaderboard */}
            <div className= "w-1/3 m-7 ml-4 border-2 border-black bg-red-400">
                <PimpLeader /> 
            </div>
        </div>
        
    </> );
}