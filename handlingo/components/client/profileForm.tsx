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
  const [profilePicUrl, setProfilePicUrl] = useState(
    user.profile_pic_url || ""
  ); // Store the URL of the profile picture
  const [imageFile, setImageFile] = useState<File | null>(null); // Track the selected image file
  const [firstName, setFirstName] = useState("name"); // create state
  const [isEditable, setIsEditable] = useState(false); // current state when user hasn't pressed button
  const inputRef = useRef<HTMLInputElement>(null); //first name

  // first name edit
  const handleEditClick = () => {
    setIsEditable(true); // enable editing when the pencil is clicked
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // last name
  const [lastName, setLastName] = useState("name");
  const [isLastEditable, setIsLastEditable] = useState(false); // last name
  const inputLastRef = useRef<HTMLInputElement>(null); //last name
  const handleLastEditClick = () => {
    setIsLastEditable(true); // change
    setTimeout(() => {
      inputLastRef.current?.focus(); //change
    }, 0);
  };

  // user name
  const [userName, setUserName] = useState("name");
  const [isUserEditable, setIsUserEditable] = useState(false); // last name
  const inputUserRef = useRef<HTMLInputElement>(null); //last name
  const handleUserEditClick = () => {
    setIsUserEditable(true); // change
    setTimeout(() => {
      inputUserRef.current?.focus(); //change
    }, 0);
  };

  // password
  // user name
  const [userP, setP] = useState("name");
  const [isPEditable, setIsPEditable] = useState(false); // last name
  const inputPRef = useRef<HTMLInputElement>(null); //last name
  const handlePEditClick = () => {
    setIsPEditable(true); // change
    setTimeout(() => {
      inputPRef.current?.focus(); //change
    }, 0);
  };

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    try {
      setLoading(true);

      if (user) {
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
  }, [user, supabase]);

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
    setLoading(true);

    try {
      // Upload image if there's a new one
      const newProfilePicUrl = await uploadProfilePic();

      // TODO: SPLIT FULL NAME INTO FIRST AND LAST NAME BEFORE
      //       ASSIGNING IT TO UPDATED FIELDS OBJ
      // fullName;

      // collect updated fields for profile if it has changed
      // {* Prepare an object with any updated fields, limited to the keys defined in the (User) *}
      const updatedFields: { [key: string]: string } = {};
      if (firstName !== user.first_name)
        updatedFields["first_name"] = firstName;
      if (lastName !== user.last_name) updatedFields["last_name"] = lastName;
      if (username !== user.username) updatedFields["username"] = username;
      if (email !== user.email) updatedFields["email"] = email;
      if (password !== user.password) updatedFields["password"] = password;

      // update profile info
      if (Object.keys(updatedFields).length > 0) {
        // updates the database w/ new user using file "../api/updateProfile/route.ts"
        // hosts all queries and logic
        const res = await fetch("../api/updateProfile", {
          method: "POST",
          body: JSON.stringify({
            email: user.email,
            password: user.password,
            updatedFields,
          }),
          headers: { "Content-Type": "application/json" },
        });

        const result = await res.json();

        if (result.message === "Profile updated successfully") {
          alert("Profile updated!");
          // refetch the profile data after update without reloading entire page
          await fetchProfileData();
        } else {
          alert("Error updating profile");
        }
      }
    } catch (error) {
      console.log("Error updating profile!: ", error);
    } finally {
      setLoading(false);
    }
  };

  // refetches changed user information
  const fetchProfileData = async () => {
    try {
      // refetches changed user info in the database w/ using file "../api/getProfile/route.ts"
      // hosts all queries and logic
      const response = await fetch("/api/getProfile");
      const data = await response.json();

      if (data.internalUser) {
        // update profile state with new data from the server
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
          {/* <div className = "relative w-full"> */}
          {/* here is where the button can be */}
          {/* <button
            // calls handle submit on click
            onClick={handleSubmit}
            disabled={loading}
            className="py-2 px-4 mt-4 rounded-sm text-black font-semibold text-[18px] bg-[#63A5C5] transition-colors duration-200 disabled:opacity-50 absolute top-12 right-48"
            style={{
              backgroundColor: "#6098B3",
            }}
          >
            {loading ? "Loading ..." : "Save Changes"}
          </button> */}
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
              setValueChange={setUserName}
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

// const OldInputs = () => {
//   return (
//     <>
//       <div className="border border-black flex flex-col -mb-px">
//         <label htmlFor="username" className="font-nunito text-xl font-semibold">
//           Username
//         </label>
//         <div className="flex justify-between">
//           <input
//             className="mb-0 border border-transparent font-nunito font-light"
//             ref={inputUserRef}
//             id="username"
//             type="text"
//             value={username || ""}
//             onChange={(e) => setUsername(e.target.value)}
//             disabled={!isUserEditable}
//           />
//           <img
//             src="/assets/pencil-edit-button.png"
//             alt="Edit"
//             className="w-6 h-6 cursor-pointer"
//             onClick={handleUserEditClick} //handle click to enable editing
//           />
//         </div>
//       </div>
//       <div className="border border-black flex flex-col -mb-px">
//         <label htmlFor="email" className="font-nunito text-xl font-semibold">
//           Email (Cannot be changed)
//         </label>
//         <div className="flex justify-between">
//           <input
//             className="mb-0 border border-transparent"
//             id="email"
//             type="text"
//             value={email || ""}
//             disabled
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <img src="/assets/x-icon.png" className="w-6 h-6 cursor-pointer" />
//         </div>
//       </div>
//       <div className="border border-black flex flex-col -mb-0">
//         <label htmlFor="password" className="font-nunito text-xl font-semibold">
//           Password
//         </label>
//         <div className="flex justify-between">
//           <input
//             className="mb-0 border border-transparent font-nunito font-light"
//             ref={inputPRef}
//             id="password"
//             type="text"
//             value={password || ""}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <img
//             src="/assets/pencil-edit-button.png"
//             alt="Edit"
//             className="w-6 h-6 cursor-pointer"
//             onClick={handlePEditClick} //handle click to enable editing
//           />
//         </div>
//       </div>
//     </>
//   );
// };

// <div className="flex flex-col items-center gap-2">
//   {" "}
//   {/* Display the current profile picture */}
//   {profilePicUrl ? (
//     <img
//       src={profilePicUrl}
//       alt="Profile Picture"
//       className="w-32 h-32 rounded-full object-cover border border-gray-400"
//     />
//   ) : (
//     <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
//       No image
//     </div>
//   )}
//   {/* File input for new profile picture */}
//   <input
//     type="file"
//     accept="image/*"
//     onChange={handleProfilePicChange}
//     className="text-sm"
//   />
// </div>
