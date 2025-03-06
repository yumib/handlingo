import { createClient } from '@/utils/supabase/server';

let supabase: Awaited<ReturnType<typeof createClient>> | null = null; // Makes client a global var to be used by queries 

async function initializeSupabase() {
    if (!supabase) {
        supabase = await createClient(); // Ensure it's fully initialized
    }
    return supabase;
}

// SIGN-IN / SIGN-UP QUERIES:
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

export async function createNewUser(fname: string, lname: string, email: string, username: string, password: string) {
    const supabase = await initializeSupabase(); // Make sure Supabase is ready
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (!supabase) {
        throw new Error("Supabase client failed to initialize");
    }
    if (userError || !userData?.user) {
        throw new Error("Failed to get authenticated user.");
    }

    // Insert user into 'User_Table'
    const { data, error } = await supabase
        .from("User_Table")
        .insert([
            {
                first_name: fname,
                last_name: lname,
                email: email,
                username: username,
                password: password, 
                // auth_user_id: userData.user.id, // Link to Supabase Auth
                created_or_updated_on: new Date().toISOString(),
            }
        ]);

    if (error) {
        console.error("Error inserting new user:", error);
        return { success: false, message: error.message };
    }
    
    return { success: true, data };
}

// DASHBOARD QUERIES:
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

    return data;
}

export async function getInternalUserByEmail(email: string) {
    const supabase = await initializeSupabase(); // Make sure Supabase is ready

    if (!supabase) {
        throw new Error("Supabase client failed to initialize");
    }
    const { data, error } = await supabase
        .from("User_Table") // Your hosted user table
        .select("*") // Select relevant fields
        .eq("email", email) // Match email from auth

    if (error) {
        console.error("Error fetching user from User_Table:", error);
        return null;
    }
    
    return data; // Returns the internal user object
}