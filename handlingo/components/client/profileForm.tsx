"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// CSS Modules
import styles from "./profileForm.module.css";

// Field Component Imports
import UserInputField from "./profileForm/UserInputField";
import NameInputField from "./profileForm/NameInput";
import PictureInputField from "./profileForm/PictureInput";

interface User {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  profile_pic_url: string; //image
}

export default function AccountForm({ user }: { user: User }) {
  // setting information for the profile page
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profileErrors, setProfileErrors] = useState<string[]>([]);
  const [profilePicUrl, setProfilePicUrl] = useState(
    user.profile_pic_url || ""
  ); // Store the URL of the profile picture
  const [imageFile, setImageFile] = useState<File | null>(null); // Track the selected image file
  const [firstName, setFirstName] = useState("name"); // create state
  const [lastName, setLastName] = useState("name");
  const [username, setUsername] = useState("name");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState<User>(user);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  let initialFistName = "";
  let initialLastName = "";

  //////////////////////
  // FULL NAME STATES //
  //////////////////////

  const [fullName, setFullName] = useState("");

  const handleNameSubmit = (val: string) => {
    if (!/^[a-zA-Z\s]+$/.test(val)) {
      // TODO: Error message here
      alert("Only letters and spaces, my dude.");
      return;
    }

    if (!val) {
      setFirstName(initialFistName);
      setLastName(initialLastName);
    }

    const [first, ...last] = val.trim().split(" ");
    const updatedFirstName = first;
    const updatedLastName = last.join(" ");

    setFirstName(updatedFirstName);
    setLastName(updatedLastName);

    // Send to controller, backend, etc.
    console.log("Submitted:", { updatedFirstName, updatedLastName });
  };

  //getProfile function, fills in the form fields with the passed user object
  const getProfile = useCallback(async () => {
    const getAccessToken = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        setAccessToken(data.session.access_token);
      }
    };
    try {
      setLoading(true);

      if (user) {
        getAccessToken();
        setUserData(user);
        setFirstName(user.first_name);
        setLastName(user.last_name);
        setUsername(user.username);
        setEmail(user.email);
        setPassword(user.password);
        setProfilePicUrl(user.profile_pic_url);
      }
    } catch (error) {
      alert("Error loading user data!");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

  // handle profile picture change
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setImageFile(selectedFile);
    }
  };

  // upload image to supabase
  const uploadProfilePic = async () => {
    if (!imageFile) return;
    const filePath = `profile_pics/${user.email}/${imageFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("profile-pics")
      .upload(filePath, imageFile, { upsert: true });

    if (uploadError) {
      alert("Error uploading image: " + uploadError.message);
      return;
    }
    // Get public URL
    const { data: urlData } = supabase.storage
      .from("profile-pics")
      .getPublicUrl(filePath);
    const fileUrl = urlData?.publicUrl;
    if (!fileUrl) {
      alert("Couldn't get image URL");
      return;
    }
    setProfilePicUrl(fileUrl);
    return fileUrl;
  };

  // action taken after user clicks update button
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    setLoading(true);

    try {
      // Upload image if there's a new one
      const newProfilePicUrl = await uploadProfilePic();

      // collect updated fields for profile if it has changed
      const updatedFields: { [key: string]: string } = {};
      if (firstName !== userData.first_name)
        updatedFields["first_name"] = firstName;
      if (lastName !== userData.last_name) updatedFields["last_name"] = lastName;
      if (username !== userData.username) updatedFields["username"] = username;
      if (email !== userData.email) updatedFields["email"] = email;
      if (password !== userData.password) updatedFields["password"] = password;

      // error handling   
      if (!firstName.trim()) errors.push("First name cannot be empty");
      if (!lastName.trim()) errors.push("Last name cannot be empty");
      if (!username.trim()) errors.push("Username cannot be empty");
      if (password.length <= 5) errors.push("Password must be at least 6 characters long")

      // update profile info
      if (Object.keys(updatedFields).length > 0) {
        // updates the database w/ new user using file "../api/updateProfile/route.ts"
        // hosts all queries and logic
        const res = await fetch("../api/updateProfile", {
          method: "POST",
          body: JSON.stringify({
            email: userData.email,
            password: userData.password,
            updatedFields,
            access_token: accessToken
          }),
          headers: { "Content-Type": "application/json" },
        });

        const result = await res.json();
        
        if (result.message.includes("Username is already taken")) {
          console.log(result.message)
          errors.push(result.message);
        }
        
        if (res.ok && errors.length === 0) {
          if (result.message === "Profile updated successfully") {
            alert("Profile updated!");

            await supabase.auth.signInWithPassword({
              email: email,
              password: password,
            });
            
            // refetch the profile data after update without reloading entire page
            await fetchProfileData();
          }
        }
      }

      // @JERRY here is where you would handle showing the errors however u want 
      if (errors.length > 0) {
        setProfileErrors(errors); // save errors in state if you want to keep them
        alert(errors.join("\n")); // show all errors in one alert, line by line (temporary)
        // Now fetch fresh profile data after alert is closed
        await fetchProfileData();
        return;
      }

      setProfileErrors([]);

    } catch (error) {
      console.log("Error updating profile!: ", error);
    } finally {
      setLoading(false);
    }
  };

  // // refetches changed user information
  const fetchProfileData = async () => {
    try {
      // refetches changed user info in the database w/ using file "../api/getProfile/route.ts"
      // hosts all queries and logic
      setLoading(true);
      const response = await fetch("/api/getProfile");
      const data = await response.json();

      if (data.internalUser) {
        // update profile state with new data from the server
        setUserData(data.internalUser);
        setFirstName(data.internalUser.first_name);
        setLastName(data.internalUser.last_name);
        initialFistName = data.internalUser.first_name;
        initialLastName = data.internalUser.last_name;

        setUsername(data.internalUser.username);
        setEmail(data.internalUser.email);
        setPassword(data.internalUser.password);
        setProfilePicUrl(data.internalUser.profile_pic_url);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // html for form w/ typescript to call variables
    // container with the outer border
    <div
      className={`${styles.container_wrapper} flex w-full justify-center align-middle mx-auto`}
    >
      <div className="w-11/12 flex justify-center items-center border border-black">
        <div
          className={`${styles["flex_container"]} form-widget w-full max-w-xl p-6`}
        >
          <div className="flex justify-center mb-3">
            <p className="font-fira text-3xl font-extrabold"> My Profile</p>
          </div>
          <PictureInputField
            picUrl={profilePicUrl}
            handlePicChange={handleProfilePicChange}
          />

          <NameInputField
            firstName={firstName}
            lastName={lastName}
            fullName={fullName}
            setFullName={setFullName}
            onSubmit={handleNameSubmit}
          />

          {/* Input Fields */}
          <p className="font-fira text-xl" style={{color: "#626367"}}>Security Settings</p>
          <>
            <UserInputField
              label="Username"
              userDataValue={username}
              setValueChange={setUsername}
              isPasswordField={false}
              isLocked={false}
            />
            <UserInputField
              label="Email"
              userDataValue={email}
              setValueChange={setUsername}
              isPasswordField={false}
              isLocked={true}
            />
            <UserInputField
              label="Password"
              userDataValue={password}
              setValueChange={setPassword}
              isPasswordField={true}
              isLocked={false}
            />
          </>
          <div className="flex justify-center">
            <button
              // calls handle submit on click
              onClick={handleSubmit}
              disabled={loading}
              className="py-2 px-4 mt-8 w-40 text-black font-semibold text-[18px]"
              style={{
                backgroundColor: "#6098B3",
              }}
            >
              {loading ? "Loading ..." : "Save Changes"}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
