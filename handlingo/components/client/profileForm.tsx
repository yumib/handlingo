//edited
'use client'
import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

import styles from "./profileForm.module.css";

interface User{
  first_name: string
  last_name: string
  username: string
  email: string
  password: string
  profile_pic_url: string //image
}

export default function AccountForm({ user }: { user: User}) {

  // setting information for the profile page
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profilePicUrl, setProfilePicUrl] = useState(user.profile_pic_url || ''); // Store the URL of the profile picture
  const [imageFile, setImageFile] = useState<File | null>(null); // Track the selected image file
  const [firstName, setFirstName] = useState('name') // create state
  const [isEditable, setIsEditable] = useState(false) // current state when user hasn't pressed button
  const inputRef = useRef<HTMLInputElement>(null); //first name
  
  // first name edit
  const handleEditClick = () => {
    setIsEditable(true); // enable editing when the pencil is clicked
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // last name
  const [lastName, setLastName] = useState('name')
  const [isLastEditable, setIsLastEditable] = useState(false) // last name
  const inputLastRef = useRef<HTMLInputElement>(null); //last name
  const handleLastEditClick = () => {
    setIsLastEditable(true); // change
    setTimeout(() => {
      inputLastRef.current?.focus(); //change
    }, 0);
  };

  // user name
  const [userName, setUserName] = useState('name')
  const [isUserEditable, setIsUserEditable] = useState(false) // last name
  const inputUserRef = useRef<HTMLInputElement>(null); //last name
  const handleUserEditClick = () => {
    setIsUserEditable(true); // change
    setTimeout(() => {
      inputUserRef.current?.focus(); //change
    }, 0);
  };

  // password
    // user name
    const [userP, setP] = useState('name')
    const [isPEditable, setIsPEditable] = useState(false) // last name
    const inputPRef = useRef<HTMLInputElement>(null); //last name
    const handlePEditClick = () => {
      setIsPEditable(true); // change
      setTimeout(() => {
        inputPRef.current?.focus(); //change
      }, 0);
    };

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')


  //getProfile function, fills in the form fields with the passed user object
  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      if (user) {
        setFirstName(user.first_name)
        setLastName(user.last_name)
        setUsername(user.username)
        setEmail(user.email)
        setPassword(user.password)
        setProfilePicUrl(user.profile_pic_url)
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

  // handle profile picture change
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]){
      const selectedFile = e.target.files[0];
      setImageFile(selectedFile);
    }
  };

  // upload image to supabase
  const uploadProfilePic = async () => {
    if(!imageFile) return;
      const filePath = `profile_pics/${user.email}/${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
      .from('profile-pics')
      .upload(filePath, imageFile, { upsert: true });

      if (uploadError) {
        alert('Error uploading image: ' + uploadError.message);
        return;
      }
      // Get public URL
      const { data: urlData } = supabase.storage.from('profile-pics').getPublicUrl(filePath);
      const fileUrl = urlData?.publicUrl;
      if (!fileUrl) {
        alert("Couldn't get image URL");
        return;
      }
      setProfilePicUrl(fileUrl);
      return fileUrl;
  }

  // action taken after user clicks update button
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload image if there's a new one
      const newProfilePicUrl = await uploadProfilePic();
      // collect updated fields for profile if it has changed 
      // {* Prepare an object with any updated fields, limited to the keys defined in the (User) *}
      const updatedFields: { [key: string]: string } = {};
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
        setProfilePicUrl(data.internalUser.profile_pic_url);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  return (
// html for form w/ typescript to call variables 
// container with the outer border
  <div className={`${styles.container_wrapper} flex w-10/12 justify-center align-middle mx-auto`}>
    {/* Display the current profile picture */}
<div className="flex flex-col items-center gap-2 mb-4">
  {profilePicUrl ? (
    <img
      src={profilePicUrl}
      alt="Profile Picture"
      className="w-32 h-32 rounded-full object-cover border border-gray-400"
    />
  ) : (
    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
      No image
    </div>
  )}
  
  {/* File input for new profile picture */}
  <input
    type="file"
    accept="image/*"
    onChange={handleProfilePicChange}
    className="text-sm"
  />
</div>
    <div className="w-11/12 flex justify-center items-center border border-black">
          <div className = {`${styles['flex_container']} form-widget w-full max-w-xl p-6`}>
            <div className="border border-black flex flex-col">
              <label htmlFor="firstName" className="font-nunito text-lg">First Name</label>
                <div className = "flex justify-between">
                <input
                  ref = {inputRef}
                  id="firstName"
                  type="text"
                  value={firstName || ''}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={!isEditable} //if not editable, the input is disabled
                />
                <img
                  src = "/assets/pencil-edit-button.png"
                  alt = "Edit"
                  className = "w-6 h-6 cursor-pointer"
                  onClick = {handleEditClick} //handle click to enable editing
                />
              </div>
            </div>
            {/* Profile pic upload */}
            
            
            <div className = "border border-black flex flex-col">
              <label htmlFor="lastName" className="font-nunito text-lg">Last Name</label>
                <div className = "flex justify-between">
                  <input
                    ref = {inputLastRef}
                    id="lastName"
                    type="text"
                    value={lastName || ''}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled = {!isLastEditable}
                    className={styles.input}
                  />
                  <img
                    src = "/assets/pencil-edit-button.png"
                    alt = "Edit"
                    className = "w-6 h-6 cursor-pointer"
                    onClick = {handleLastEditClick} //handle click to enable editing
                  />
                </div>
              </div>
            <div className = "border border-black flex flex-col">
              <label htmlFor="username">Username</label>
                <div className="flex justify-between" >
                  <input
                    ref = {inputUserRef}
                    id="username"
                    type="text"
                    value={username || ''}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled = {!isUserEditable}
                  />
                  <img
                    src = "/assets/pencil-edit-button.png"
                    alt = "Edit"
                    className = "w-6 h-6 cursor-pointer"
                    onClick = {handleUserEditClick} //handle click to enable editing
                  />
                </div>
            </div>
            <div className = "border border-black flex flex-col">
              <label htmlFor="email">Email (Cannot be changed)</label>
              <input
                id="email"
                type="text"
                value={email || ''} 
                disabled
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className = "border border-black">
              <label htmlFor="password">Password</label>
              <div className="flex justify-between">
                <input
                  ref = {inputPRef}
                  id="password"
                  type="text"
                  value={password || ''}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <img
                    src = "/assets/pencil-edit-button.png"
                    alt = "Edit"
                    className = "w-6 h-6 cursor-pointer"
                    onClick = {handlePEditClick} //handle click to enable editing
                  />
              </div>
            </div>

            <div className = "relative w-full">
              <button
                // calls handle submit on click 
                onClick={handleSubmit}
                disabled={loading}
                className="py-2 px-4 rounded-lg text-black font-semibold text-[18px] bg-[#63A5C5] transition-colors duration-200 disabled:opacity-50 absolute top-0 right-0"
                style={{
                  backgroundColor: '#6098B3'
                }}
              >
                {loading ? 'Loading ...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
    </div>
  )
}