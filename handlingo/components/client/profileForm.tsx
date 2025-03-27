'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AccountForm({ user }) {

  // setting information for the profile page
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      if (user) {
        setFirstName(user.first_name)
        setLastName(user.last_name)
        setUsername(user.username)
        setEmail(user.email)
        setPassword(user.password)
      }
    } catch (error) {
      alert('Error loading user data!')
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    getProfile()
  }, [user, getProfile])

  // action taken after user clicks update button
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {

      // collect updated fields for profile if it has changed 
      const updatedFields = {};
      if (firstName !== user.first_name) updatedFields['first_name'] = firstName;
      if (lastName !== user.last_name) updatedFields['last_name'] = lastName;
      if (username !== user.username) updatedFields['username'] = username;
      if (email !== user.email) updatedFields['email'] = email;
      if (password !== user.password) updatedFields['password'] = password;

    // update profile info
    if (Object.keys(updatedFields).length > 0) {

        // updates the database w/ new user using file "../api/updateProfile/route.ts"
        // hosts all queries and logic 
        const res = await fetch('../api/updateProfile', {
            method: 'POST',
            body: JSON.stringify({ email: user.email, password: user.password, updatedFields }),
            headers: { 'Content-Type': 'application/json' },
        });
          
        const result = await res.json();

        // attempt to resign in user, will be fixed later since user won't be able to change email
        if (email !== user.email) {
          const { error } = await supabase.auth.signInWithPassword({
              email: user.email,
              password,
          });
            console.log('RESIGNED IN')
          if (error) {
            console.error('Error refreshing session:', error.message);
          } else {
            console.log('Session refreshed successfully');
          }
        }
    
        if (result.message === 'Profile updated successfully') {
            alert('Profile updated!');
            // refetch the profile data after update without reloading entire page
            await fetchProfileData();
        } else {
            alert('Error updating profile');
        }
      }
      
    } catch (error) {
        console.log('Error updating profile!: ', error)
    } finally {
      setLoading(false);
    }
  };


  // refetches changed user information
  const fetchProfileData = async () => {
    try {
      // refetches changed user info in the database w/ using file "../api/getProfile/route.ts"
      // hosts all queries and logic 
      const response = await fetch('/api/getProfile'); 
      const data = await response.json();

      if (data.internalUser) {
        // update profile state with new data from the server
        setFirstName(data.internalUser.first_name);
        setLastName(data.internalUser.last_name);
        setUsername(data.internalUser.username);
        setEmail(data.internalUser.email);
        setPassword(data.internalUser.password);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  return (
    // html for form w/ typescript to call variables 
    <div className="form-widget">
      <div>
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          value={firstName || ''}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          type="text"
          value={lastName || ''}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username || ''}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="text"
          value={email || ''}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="text"
          value={password || ''}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
      <button
          // calls handle submit on click 
          className="button primary block"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>
    </div>
  )
}