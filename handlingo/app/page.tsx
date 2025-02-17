import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export default async function Home() {
  return (
    <div>
      <h1>Welcome to My Next.js App</h1>
      <p>Home page is working without deleted components.</p>
    </div>
  );
}
