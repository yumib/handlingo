import { redirect } from "next/navigation";
// **changed the route of to route to just "sign-in"
export default function Home() {
  redirect("sign-in"); // Automatically sends users to the sign-in page
}