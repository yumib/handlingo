// /app/api/getProfile/route.ts (Server-Side Route)

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Server-side Supabase client import
import { getInternalUserByEmail } from "@/utils/databaseQuery";

export async function GET(request: Request) {
  try {
    const supabase = await createClient(); // Create the Supabase client on the server
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user || error) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }
    
    // Fetch the user profile based on the authenticated email
    let internalUser = await getInternalUserByEmail(String(user.email));

    if (error) {
      return NextResponse.json({ message: 'Error fetching profile', error: error }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile fetched successfully', internalUser });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ message: 'Error fetching profile' }, { status: 500 });
  }
}
