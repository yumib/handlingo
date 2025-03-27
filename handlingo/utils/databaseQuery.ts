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
    const { data, error } = await supabase
        .from("User_Table")
        .select("*") // Select only relevant fields
        .eq("username", username)
        .single()

    if (error) {
        console.error("Error fetching from User_Table:", error);
        return null;
    }

    return data;
}

export async function createNewUser(fname: string, lname: string, email: string, username: string, password: string) {
    const supabase = await initializeSupabase(); // Make sure Supabase is ready
    const { data: userData, error: userError } = await supabase.auth.getUser();

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
        console.error("Error inserting new user in User_Table:", error);
        return { success: false, message: error.message };
    }
    
    return { success: true, data };
}

// DASHBOARD QUERIES:
export async function getUserLessonAttempts(userId: number) {
    const supabase = await initializeSupabase();
    const { data, error } = await supabase
        .from('User_Progress_Table')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching from User_Progress_Table:', error);
        return null;
    }

    return data;
}

export async function getInternalUserByEmail(email: string) {
    const supabase = await initializeSupabase();
    const { data, error } = await supabase
        .from("User_Table") // Your hosted user table
        .select("*") // Select relevant fields
        .eq("email", email) // Match email from auth
        .single()

    if (error) {
        console.error("Error fetching from User_Table:", error);
        return null;
    }
    
    return data; // Returns the internal user object
}

export async function getUnitbyNum(unitNum: number) {
    const supabase = await initializeSupabase();
    const { data, error } = await supabase
        .from('Unit_Table')
        .select('*')
        .eq('id', unitNum)
        .single()

    if (error) {
        console.error("Error fetching user from Unit_Table:", error);
        return null;
    }
        
    return data; 
}

export async function getSectionsbyUnitNum (unitNum: number) {
    const supabase = await initializeSupabase();
    const { data, error } = await supabase
        .from('Section_Table')
        .select('*')
        .eq('unit_id', unitNum)

    if (error) {
        console.error("Error fetching from Section_Table:", error);
        return null;
    }
        
    return data; 
}

// PROFILE QUERIES:
// update our own user info in User_Table
export async function updateUserProfile(email: string, updatedFields: Record<string, any>) {
    const supabase = await initializeSupabase(); 
    const { data, error } = await supabase
        .from("User_Table") // Adjust table name if needed
        .update(updatedFields)
        .eq("email", email);

    if (error) {
        console.error("Error updating User_Table:", error);
        return error;
    }
    return null;
}

// update Supabase Auth email and User Table email
export async function updateUserEmail(newEmail: string, oldEmail: string) {
    const supabase = await initializeSupabase();
    try {
        // Step 1: Update email in the auth table (if email is part of updatedFields)
        const { error } = await supabase.auth.updateUser({ email: newEmail });

        if (error) {
            throw new Error("Error updating email in auth table: ", error);
        }

        // Step 2: Update the User_Table (excluding password & email since email is updated already)
        const { data, error: dbError } = await supabase
            .from('User_Table')
            .update({ email: newEmail })
            .eq('email', oldEmail);

        if (dbError) {
            throw new Error("Error updating user profile in User_Table: " + dbError.message);
        }

        console.log("User profile updated successfully in both auth and User_Table");
        return data;

    } catch (error) {
        console.error("Error updating user profile:", error);
        return { error: error };
    }
}

// update Supabase Auth password
export async function updateUserAuthPassword(newPassword: string) {
    const supabase = await initializeSupabase(); // Make sure Supabase is ready
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        console.error("Error updating auth password:", error);
        return error;
    }
    return null;
}

// [SECTIONID] QUERIES:
// Fetch all questions for a section
export async function getQuestionsForSection(sectionId: number) {
    const supabase = await initializeSupabase();
    const { data, error } = await supabase
        .from("Question_Table")
        .select("*")
        .eq("section_id", sectionId)
        .order("id", { ascending: true });

    if (error) throw new Error("Error fetching questions from Question_Table");
    return data;
}

export async function getUserProgress(userId: number, sectionId: number) {
    const supabase = await initializeSupabase();
    const { data, error } = await supabase
        .from("User_Progress_Table")
        .select("*")
        .eq("user_id", userId)
        .eq("section_id", sectionId)
        .single();

    if (error) throw new Error("Error fetching user progress");
    return data;
}

// Fetch a single question by its section Id
export async function getQuestionById(questionNum: number, sectionId: number) {
    const supabase = await initializeSupabase();
    const { data, error } = await supabase
        .from("Question_Table")
        .select("*")
        .eq("question_num", questionNum)
        .eq("section_id", sectionId)
        .single();

    if (error) throw new Error("Error fetching question");
    return data;
}