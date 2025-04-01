import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";



export default async function SignIn(props: { searchParams: Promise<Message> }) {

  // not sure what this does tbh
  const searchParams = await props.searchParams;

  return (
    // standard html 
    <form className="flex-1 flex flex-col min-w-64">
      <h1 className="text-2xl font-medium">Log in</h1>
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="text-foreground font-medium underline" href="/auth-pages/sign-up">
          Sign Up
        </Link>
      </p>
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="username">Username</Label>
        <Input name="username" placeholder="Your username" required />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
        />
        {/* goes to file ./app/actions.ts to handle signing in user, function signInAction */}
        <SubmitButton pendingText="Logging In..." formAction={signInAction}>
          Log in
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>            
  );
}


