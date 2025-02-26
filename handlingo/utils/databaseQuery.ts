import { createClient } from '@/utils/supabase/server';

let supabase: Awaited<ReturnType<typeof createClient>> | null = null; // Makes client a global var to be used by queries 

async function initializeSupabase() {
    if (!supabase) {
        supabase = await createClient(); // Ensure it's fully initialized
    }
    return supabase;
}

export async function getUserLessonAttempts(userId: number) {
    const supabase = await initializeSupabase(); // Make sure Supabase is ready

    if (!supabase) {
        throw new Error("Supabase client failed to initialize");
    }

    const { data, error } = await supabase
        .from('User_Progress_Table')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user attempts:', error);
        return null;
    }

    console.log("Query result:", data);
    return data;
}

export async function getUserByUsername(username: string) {
    const supabase = await initializeSupabase(); // Make sure Supabase is ready

    if (!supabase) {
        throw new Error("Supabase client failed to initialize");
    }

    const { data, error } = await supabase
        .from("User_Table")
        .select("*") // Select only relevant fields
        .eq("username", username)
        .single()

    if (error) {
        console.error("Error fetching user:", error);
        return null;
    }

    console.log("User result:", data);
    console.log("user email: ", data.email)
    return data;
}