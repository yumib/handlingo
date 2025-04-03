import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";



export default async function SignIn(props: { searchParams: Promise<Message> }) {

  // not sure what this does tbh
  const searchParams = await props.searchParams;

  return (
      
      <form className="relative flex-1 flex flex-col min-w-48 max-w-96 w-3/12 z-10">
      {/* Log In Box */}
      <div className="flex flex-col items-center space-y-4 p-6 bg-lightBlue rounded-lg">
        
        {/* Log In / Sign Up button */}
        <div className="flex items-center justify-between w-40">
          <h1 className="w-1/2 text-sm font-semibold font-fira text-black pl-5 mb-4 pb-2 border-b-2 border-black">
            Log in
          </h1>

          <Link className="w-1/2 text-sm font-semibold font-fira text-gray mb-4 pb-2 border-b-2 border-lightBlue max-w-max" href="/sign-up">
            Sign Up
          </Link>
        </div>

        {/* User Form Input Section */}
        <div className="flex flex-col w-full pl-5 pr-5 gap-2 [&>input]:mb-5 mt-8">
          {/* Email */}
          <Label className="font-nunito font-medium" htmlFor="email">Email</Label>
          <Input className="border-b-1 border-black" 
            name="email" 
            placeholder="Your email" 
            required 
            /> {/* changed from 'username' to 'email' !!!!! */}

          {/* Password */}
          <Label className="font-nunito font-medium" htmlFor="password">Password</Label>
          <Input className="border-b-1 border-black"
            type="password"
            name="password"
            placeholder="Your password"
            required
          /> 
        </div>

        {/* Submit Button */}
        {/* goes to file ./app/actions.ts to handle signing in user, function signInAction */}
        <SubmitButton className="w-[calc(95%-20px)] h-10" pendingText="Logging In..." formAction={signInAction}>
          Log in
        </SubmitButton>

        {/* Forgot Password*/}
        <Link className="text-xs text-foreground underline" href="/forgot-password">
              Forgot your password?
        </Link>

      <FormMessage message={searchParams} />
      </div> {/* end blue box container */}
    </form> 
  );
}


