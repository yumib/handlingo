import { NextResponse } from 'next/server';
import { updateUserProfile, updateUserAuthPassword, isUsernameUnique } from '@/utils/databaseQuery'; 

export async function POST(request: Request) {
  try {
    
    // getting needed information from request
    const { email, password, updatedFields } = await request.json();

    // If username is being updated, check uniqueness first
    if (updatedFields.username) {
      const unique = await isUsernameUnique(updatedFields.username);
      if (!unique) {
        return NextResponse.json({ message: "Username is already taken. Please choose another one." }, { status: 400 });
      } else (
        console.log("here")
      )
    }

    // compare password in db to changed password
    const passwordChanged = updatedFields.password && updatedFields.password !== password;

    // update password in auth table 
    if (passwordChanged) {
      try {
        // db query to update password in auth table
        await updateUserAuthPassword(updatedFields.password);
      } catch (e) {
        console.error('Error updating password in auth table:', e);
        return NextResponse.json({ message: 'Error updating password in auth table' }, { status: 500 });
      };
    }
    
    try {
      // db query to update anything that's changed 
      await updateUserProfile(email, updatedFields);
    } catch (e) {
      console.error('Error updating profile:', e);
      return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
  }
}
