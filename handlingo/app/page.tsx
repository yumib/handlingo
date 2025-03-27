import { redirect } from "next/navigation";

export default function Home() {
  redirect("/auth-pages/sign-in"); // Automatically sends users to the sign-in page
}