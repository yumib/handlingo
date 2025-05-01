import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getInternalUserByEmail, updateUserProgress } from "@/utils/databaseQuery";
console.log("it went into the file");
export async function POST(request: Request) {
  const supabase = await createClient();
  console.log("Received request to update progress");
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }
  console.log("Authenticated user:", user);

  const internalUser = await getInternalUserByEmail(user.email);
  if (!internalUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { sectionId, progress_pct } = await request.json();
  if (!sectionId || typeof progress_pct !== "number" || progress_pct <=0) {
    return NextResponse.json({ error: "Missing or invalid input" }, { status: 400 });
  }
  console.log("Incoming progress request:", sectionId, progress_pct);
  console.log("Received request to update progress:", { sectionId, progress_pct });

  try {
    const result = await updateUserProgress(internalUser.id, sectionId, progress_pct);
    if(!result.success)
    {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}