"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUserByUsername, createNewUser } from "@/utils/databaseQuery";

// export async function getUserSession() {
//   // Access cookies in the server-side context
//   const cookieStore = await cookies();

//   // Get the session token from cookies (e.g., using 'sb-access-token')
//   const accessToken = cookieStore.get('sb-qqtnelaznnlkzntopfwd-auth-token')?.value;
//   if (!accessToken) {
//     // If no token, redirect to login
//     return redirect("/sign-in");
//   }

//   // Initialize the Supabase client with the access token from cookies
//   const supabase = createServerActionClient({ cookies: () => Promise.resolve(cookieStore)});

//   // Retrieve session using the access token
//   const { data: { session }, error } = await supabase.auth.getSession();
//   console.log('here5')
//   console.log(session)
//   // Handle errors or session not found
//   if (error || !session) {
//     console.log(session)
//     return redirect("/sign-in"); // Handle session invalidation
//   }

//   // Return the user from the session
//   return session.user;
// }

export const signUpAction = async (formData: FormData) => {
  const fname = formData.get("firstName")?.toString();
  const lname = formData.get("lastName")?.toString();
  const email = formData.get("email")?.toString();
  const username = formData.get("username")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  console.log(fname, lname, email, username, password);

  if (!fname || !lname || !email || !username || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const {success, data} = await createNewUser(fname, lname, email, username, password);
  
  if (success == false) {
    console.error("Not able to add user to User_Table");
    return encodedRedirect("error", "/sign-up", "Not able to add user to User_Table");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    // options: {
    //   emailRedirectTo: `${origin}/auth/callback`,
    // },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/",
      "Thanks for signing up! You can now log in.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const user = await getUserByUsername(username);

  if (!user) {
    return encodedRedirect("error", "/sign-in", "User not found or not authorized.");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/", error.message);
  }
  revalidatePath('/', 'layout')
  redirect("/dashboard");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/");
};
