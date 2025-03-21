import { NextResponse } from 'next/server';
import { updateUserProfile, updateUserEmail, updateUserAuthPassword } from '@/utils/databaseQuery'; // Import your DB logic

export async function POST(request: Request) {
  try {
    const { email, password, updatedFields } = await request.json();

    const emailChanged = updatedFields.email && updatedFields.email !== email;
    const passwordChanged = updatedFields.password && updatedFields.password !== password;

    if (emailChanged) {
      try {
        await updateUserEmail(updatedFields.email, email);
        await updateUserAuthPassword(updatedFields.password);
        console.log("AUTH EMAIL");
      } catch (e) {
        console.error('Error updating email in auth table:', e);
        return NextResponse.json({ message: 'Error updating email in auth table' }, { status: 500 });
      };
    }

    if (passwordChanged) {
      try {
        await updateUserEmail(updatedFields.email, email);
        await updateUserAuthPassword(updatedFields.password);
        console.log("AUTH PASSWORD");
      } catch (e) {
        console.error('Error updating password in auth table:', e);
        return NextResponse.json({ message: 'Error updating password in auth table' }, { status: 500 });
      };
    }
    
    // Call your query function to update the user profile
    try {
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
