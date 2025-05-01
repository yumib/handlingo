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
        .from("User_Table") 
        .update(updatedFields)
        .eq("email", email);

    if (error) {
        console.error("Error updating User_Table:", error);
        return error;
    }
    return null;
}

// update Supabase Auth password
export async function updateUserAuthPassword(newPassword: string, access_token: string) {
    const supabase = await initializeSupabase(); // Make sure Supabase is ready

    // Inject the token into the auth state
    await supabase.auth.setSession({
        access_token: access_token,
        refresh_token: '', // not needed here
      });
      
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        console.error("Error updating auth password:", error);
        return error;
    }
    return null;
}

export async function isUsernameUnique (username: string) {
    const supabase = await initializeSupabase(); 
    const { data, error } = await supabase
        .from("User_Table") 
        .select("id")
        .eq("username", username);

    if (error) {
        console.error('Error checking username uniqueness:', error);
        return error;
    }

    // username is unique
    if (data.length === 0) {
        return true;
    }

    return false;
}

// [SECTIONID] QUERIES:
export async function createOrFetchProgress(userId: number, sectionId: number) {
    const supabase = await initializeSupabase();
    
    let progress = await getUserProgress(userId, sectionId);
    if (!progress) {
      const { success } = await createNewUserProgress(userId, sectionId);
      if (!success) throw new Error("Failed to insert new progress row");
      progress = await getUserProgress(userId, sectionId);
    }
    return progress;
  }
  

export async function getUserProgress(userId: number, sectionId: number) {
    const supabase = await initializeSupabase();
    const { data, error } = await supabase
        .from("User_Progress_Table")
        .select("*")
        .eq("user_id", userId)
        .eq("section_id", sectionId)
        .single();

    // check for errors first
    if (error) {
        console.error("Error fetching user progress:", error);  // Log the actual error from Supabase
        return null;  // Return null in case of error
    }

    // if no data was returned, explicitly return null (no need for a separate check for data === null)
    return data || null;
}

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

export async function getQuestionByNum(questionNum: number, sectionId: number) {
    const supabase = await initializeSupabase();
    const { data, error } = await supabase
        .from("Question_Table")
        .select("*")
        .eq("question_num", questionNum)
        .eq("section_id", sectionId)
        .single();

    if (error) throw new Error("Error fetching question");
    console.log(data)
    return data;
}

export async function createNewUserProgress(userId: number, sectionId: number) {
    const supabase = await initializeSupabase();
    const { data, error } = await supabase
        .from("User_Progress_Table")
        .insert([
            {
                user_id: userId,
                completion_status: "incomplete",
                score: 0,
                last_attempted_at: new Date().toISOString(),
                progress_pct: 0,
                section_id: sectionId
            }
        ]);

    if (error) {
        console.error("Error inserting new user in User_Table:", error);
        return { success: false, message: error.message };
    }
    
    return { success: true, data };
}

// Adds points by updating a user's score and returning the new score
export async function updateUserScore(userId: number, amount: number) {
    const supabase = await initializeSupabase();

    // selecting the score from the user progress table 
    const { data, error: fetchError } = await supabase
        .from("User_Progress_Table")
        .select("score")
        .eq("user_id", userId)
        .single();

    if (fetchError) {
        console.error("Error fetching score: ", fetchError);
        throw new Error("Failed to fetch user score.");
    }
    const newScore = data.score + amount;
    if (amount <= 0) {
        console.log("Ignoring update: score amount not positive.");
        return { success: false, message: "Score update must be positive." };
    }
    

    // updating the score in the database
    // this might break if the permissions do the same thing as the email 
    const { error } = await supabase
        .from("User_Progress_Table")
        .update({ score: newScore })
        .eq("user_id", userId);

    if (error) {
        console.error("Error updating score: ", error);
        throw new Error("Failed to update user score.");
    }
    return { success: true, newScore };
}

// get url of video lessons
export const getSignedVideoUrl = async (sectionId: number, questionNum: number) => {
  const supabase = await initializeSupabase();
  const path = `section_${sectionId}/question_${questionNum}.mp4`;

  const { data, error } = await supabase
    .storage
    .from('lesson-vids')
    .createSignedUrl(path, 60)

    if (error) {
        console.error("Error getting lesson vid url: ", error);
        throw new Error("Failed to get URL to lesson video.");
    }

  return data.signedUrl;
}
export async function updateUserProgress(userId: number, sectionId: number, progress_pct: number) {
    const supabase = await initializeSupabase();
    // updating the progress in the database it should be both over all and per lesson
    // this might break if the permissions do the same thing as the email     
    const { error } = await supabase
      .from("User_Progress_Table")
      .update({ progress_pct })
      .match({ user_id: userId, section_id: sectionId });
  
    if (error) {
      throw new Error(`Error updating progress: ${error.message}`);
    }
    return { success: true };
};
