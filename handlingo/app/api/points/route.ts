import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getInternalUserByEmail, updateUserScore } from "@/utils/databaseQuery";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }
  // get the user's profile through their email
  const internalUser = await getInternalUserByEmail(user.email);
  if (!internalUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // only works for a nonzero or negative amount of points right now so we might need to fix 
  // this if we want to add those to keep track when someone backtracks
  const { amount } = await request.json();
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount of points" }, { status: 400 });
  }
  // if the profile and amount of points is valid(positive) update the user's score with that amount
  try {
    await updateUserScore(internalUser.id, amount);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating XP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
