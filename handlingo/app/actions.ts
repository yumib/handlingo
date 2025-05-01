"use server";

import { FormMessage } from "@/components/form-message";
import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUserByUsername, createNewUser } from "@/utils/databaseQuery";

export const signUpAction = async (formData: FormData) => {

  // converts sent data to strings
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

   // creates new user on Auth table
   const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  // db query to create new user on User_Table in file ./utils/databaseQuery.ts
  const {success, data} = await createNewUser(fname, lname, email, username, password);

  console.log("create new user: " + success)
  
  if (success == false) {
    console.error("Not able to add user to User_Table");
    return encodedRedirect("error", "/sign-up", "Username or Email already exists, try again");
  }

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-in",
      "Thanks for signing up! You can now log in.",
    );
  }
 
};

export const signInAction = async (formData: FormData) => {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  // 1) Lookup in your users table
  const user = await getUserByUsername(username);
  if (!user) {
    // No such username
    return encodedRedirect(
      "error",
      "/sign-in",
      "User not found or not authorized."
    );
  }

  // 2) Try to sign in via Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (error) {
    // 2a) Wrong password specifically
    if (
      error.status === 400 &&
      /invalid login credentials/i.test(error.message)
    ) {
      return encodedRedirect(
        "error",
        "/sign-in",
        "Incorrect password. Please try again."
      );
    }
    // 2b) Any other Auth error
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // 3) Success → refresh cache + go to dashboard
  revalidatePath("/", "layout");
  redirect("/dashboard");
};

// FUTURE WORK, NOT SET UP YET
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

// FUTURE WORK, NOT SET UP YET
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
