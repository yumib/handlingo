'use client'
import Image from "next/image";
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type User = {
  id: string;
  username: string;
  score: number;
  created_or_updated_on: string;
};

{/* PimpLeader is the box with pimp tip + leaderboard and stats */}
export default function PimpLeader ({ currentUserId }: { currentUserId: string }) {

    const [leaderboard, setLeaderboard] = useState<User[]>([]);
    const supabase = createClient(); 

  useEffect(() => {

    const fetchLeaderboard = async () => {
        const { data, error } = await supabase
        .from('User_Table')
        .select("id, username, score, created_or_updated_on")
        .order('score', { ascending: false })
        .order("created_or_updated_on", { ascending: true });

      if (!error) setLeaderboard(data as User[]);
    };

    fetchLeaderboard();

    // Create channel for real-time updates
    const channel = supabase
      .channel('supabase_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'User_Table' },
        (payload) => {
          console.log('Change received!', payload);
          fetchLeaderboard(); // re-fetch data when score updates
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // clean up on unmount
    };
  }, []);

  const currentUser = leaderboard.find((u) => u.id === currentUserId);
  const currentUserRank = leaderboard.findIndex((u) => u.id === currentUserId);
  console.log(currentUser)
  console.log(currentUserRank)

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
                        #{currentUserRank}
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
                        {currentUser?.score ?? 0}
                    </h1>
                </div>

                
            </div>
        </div>
        


        <div className="flex flex-col h-full"> 
            {/* Title */}
            <h1 className="text-lg font-bold font-fira text-black pt-2 pl-4">
                LEADERBOARD
            </h1>

            {/* PENDING - Table */}
            {/* Leaderboard Table */}
            <div className="flex flex-col h-full px-6 py-4 overflow-y-auto">
            {leaderboard.length === 0 ? (
                <p className="text-center text-gray-600">No leaderboard data available.</p>
            ) : (
                <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                <thead className="bg-purple-300 text-black">
                    <tr>
                    <th className="py-2 px-4 text-left">Rank</th>
                    <th className="py-2 px-4 text-left">Username</th>
                    <th className="py-2 px-4 text-left">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((user, index) => (
                    <tr
                        key={user.id}
                        className={`${
                        user.id === currentUserId ? 'bg-yellow-100 font-semibold' : 'hover:bg-purple-100'
                        } border-b`}
                    >
                        <td className="py-2 px-4">{index + 1}</td>
                        <td className="py-2 px-4">{user.username}</td>
                        <td className="py-2 px-4">{user.score}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
            </div>


        </div>
    </div>
    </>
}