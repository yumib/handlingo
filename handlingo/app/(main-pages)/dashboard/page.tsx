import { getUserLessonAttempts, getInternalUserByEmail, getUnitbyNum, getSectionsbyUnitNum } from "@/utils/databaseQuery";
import { createClient } from "@/utils/supabase/server";
import Link from 'next/link';
import Image from "next/image";

{/* Gabe Lira recommended breaking this up into Functional Components! Cleaner way to organize*/}
type LessonsOverviewProps = {
    sectionInfo: any[];
    userAttempts: any[];
    unitInfo: any;
};

{/* LessonsOverview is the box with unit selection + the subunits that are part of it */}
const LessonsOverview = ({ sectionInfo, userAttempts, unitInfo }: LessonsOverviewProps) => {
    return <>
    <div className="flex flex-col h-[calc(100vh-5rem)]"> {/* full height minus top margin */}

    {/* Unit Select */}
    <div className="flex items-center px-4 pt-4 w-full mb-8">
        <div className="flex items-center gap-4">
            
            <button className="font-semibold font-fira text-black border-b-4 border-black pb-1 whitespace-nowrap">
            Unit 1
            </button>

            <button className="font-semibold font-fira text-gray border-b-2 border-gray max-w-max pb-1 whitespace-nowrap">
            Unit 2 {/* Link page once more lessons exist */}
            </button>

            <span className="text-gray text-lg">→</span>
        </div>
    </div>

    {/* Unit Title and Progress */}
    <div className="flex justify-between">
        {/* Unit Title and Progress */}
        <h1 className="text-3xl font-bold font-fira pl-7 pb-5">
            {unitInfo?.unit_name ?? "Unknown Unit"}
        </h1>

        {/* PENDING-- Actually use lesson progress */}
        <div className="flex pt-2 gap-1.5 w-6/12 pr-9">
            <span className="text-sm text-gray-600 font-nunito">
                {Math.round(14)}%
            </span>
            <div className="w-full h-4 border border-black bg-white rounded-full">
                <div
                className="h-full bg-darkBlue rounded-full"
                style={{ width: `${14}%` }}
                />
                </div>
        </div>
    </div>
   
    
    {/* Scrollable Section List */}
    <div className="overflow-y-auto flex-grow px-5 pr-8 pb-4">
    {sectionInfo.length > 0 ? (
        <ul>
            {sectionInfo.map((sec) => {
                // Find user's latest attempt progress for this section
                const attempt = userAttempts.find(attempt => attempt.section_id === sec.id);
                const progress = attempt?.progress_pct ?? 0;

                return (
                    <li key={sec.id} className="justify-items-center">

                    {/* Link to dynamic section page (handles logic for lesson, quiz, exam) */}
                    <Link href={`/sections/${sec.id}`} 
                        className="flex justify-between items-center transition-all 
                                    px-14 py-10
                                    border-b-2 border-zinc-300 
                                    w-min-96 w-10/12">
                        
                        {/* Section Number and Name */}
                        <span className="text-lg font-medium font-fira text-black">
                            {sec.title ?? "Untitled Section"} {sec.description ?? "No description"}
                        </span>

                        {/* Progress Bar for Section */}
                        <div className="flex flex-col items-center gap-0.5 w-5/12">
                            <div className="w-full h-4 border border-black bg-white rounded-full">
                                <div
                                className="h-full bg-lightBlue rounded-full"
                                style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-sm text-gray-600 font-nunito">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </Link>
                    </li>
                );
            })}
        </ul>
        ) : (
            <p>Lessons Coming Soon!</p>
        )
    } </div> 
    </div> </>
}

{/* PimpLeader is the box with pimp tip + leaderboard and stats */}
const PimpLeader = () => {
    return <>

    {/* Pimp Tip */}
    <div className="flex flex-col w-full h-32 bg-purple-300 rounded-xl"> 
        {/* Title */}
        <h1 className="text-lg font-bold font-fira text-black pt-2 pl-4">
            Pimp Tip!
        </h1>

        {/* Pimp + Tip */}
        <div className="flex w-min-56 w-full h-28">
            {/* Pimp */}
            <div style={{justifySelf: 'start'}} className="pl-10 py-3">
                <Image
                src = "/assets/actually-pimp.png"
                alt = "Nerd"
                width = {70}
                height = {70}
                />
            </div>

            {/* Tip */}
            <div style={{justifySelf: 'center'}} className="px-5 py-3">
                <p className="text-sm font-medium font-fira text-black"> 
                    Flap those fingers like wings!
                    The more you practice, the smoother 
                    you'll fly through ASL. 
                </p>
            </div>
        </div>
    </div>    

    {/* Stats and Leaderboard */}
    <div className="flex flex-col w-full mt-7 border-2 border-black overflow-y-auto h-[69vh] bg-purple-200"> 
        {/* Title */}
        <h1 className="text-lg font-bold font-fira text-black pt-2 pl-4">
                YOUR STATS
            </h1>
        {/* Stats */}
        <div className="flex flex-col items-center mb-5"> 
            {/* Info (rank and XP ) */}
            <div className="flex flex-col items-center w-72 mx-5">
                <div className='flex items-center justify-between w-40'>
                    <div className='flex'>
                    <h1 className="text-2xl font-bold font-fira text-black pb-1 pr-2">
                        👑
                    </h1>
                    <h1 className="text-lg font-medium font-fira text-black pt-1">
                        RANK
                    </h1>
                    </div>
                    {/* Add RANK data grab here */}
                    <h1 className="text-lg font-normal font-fira text-black">
                        #10000
                    </h1>
                </div>

                <div className='flex items-center justify-between w-40'>
                    <div className='flex'>
                    <h1 className="text-2xl font-bold font-fira text-black pb-1 pr-2">
                        ✨
                    </h1>
                    <h1 className="text-lg font-medium font-fira text-black pt-1">
                        XP
                    </h1>
                    </div>
                    {/* Add XP data grab here */}
                    <h1 className="text-lg font-normal font-fira text-black">
                        999999
                    </h1>
                </div>

                
            </div>
        </div>
        


        {/* Leaderboard */}
        <div className="flex flex-col h-full"> 
            {/* Title */}
            <h1 className="text-lg font-bold font-fira text-black pt-2 pl-4">
                LEADERBOARD
            </h1>

            {/* PENDING - Table */}
            <div className="flex justify-center my-5 mx-10 min-h-0 h-96 bg-slate-300">
                Coming Soon!
            </div>

        </div>
    </div>
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
        <div className= "flex flex-grow w-full overflow-hidden">
            {/* unit selection + subunits */}
            <div className= "flex flex-col w-2/3 h-5/6 ml-7 border-2 border-black overflow-hidden">
                <LessonsOverview
                    sectionInfo={sectionInfo}
                    userAttempts={userAttempts}
                    unitInfo={unitInfo}
                />
            </div>

            {/* pimp tip + leaderboard */}
            <div className= "flex flex-col w-1/3 m-2 mx-7 overflow-hidden">
                <PimpLeader /> 
            </div>
        </div>
    </> );
}