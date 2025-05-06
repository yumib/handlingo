import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getInternalUserByEmail, updateUserScore } from "@/utils/databaseQuery";

export async function POST(request: Request) {
  console.log("Entered POST /api/points");
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
  // only allows positive numbers to be passed
  const { amount } = await request.json();
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount of points" }, { status: 400 });
  }
  console.log("Received request to update progress:", { user,  amount});
  // if the profile and amount of points is valid(positive) update the user's score with that amount
  try {
    const result=await updateUserScore(internalUser.id, amount);
    if(!result.success)
    {
      return NextResponse.json({ error: result.message || "Score update failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true, newScore: result.newScore });
  } catch (error) {
    console.error("Error updating score:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
