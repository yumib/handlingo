import { createClient } from '@/utils/supabase/server';
//this is a sample of how we can query we can change this to do what we need and
export async function getUserLessonAttempts(userId: number) {
    const supabase = await createClient(); //Make sure the client is connected

    const { data, error } = await supabase
    //we change this to change what we get from the database
        .from('User_Progress_Table')
        .select('*')//gets everything from the table
        // .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user attempts:', error);
        return null;
    }

    console.log("Query result:", data);
    return data;
}
