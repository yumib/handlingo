"use client";

import { useRouter } from "next/navigation";
import { signOutAction } from "@/app/actions";  // Make sure the path is correct

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOutAction(); // Call the sign-out action
    router.push("/"); // Redirect to the login page after logging out
  };

  return (
    <button onClick={handleLogout} className="btn-logout">
      Log out
    </button>
  );
}
