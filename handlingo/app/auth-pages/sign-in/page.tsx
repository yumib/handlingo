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
    <div className="flex w-screen items-center justify-center min-h-screen relative">
      {/* Background Image */}
      <Image
        src="/assets/login-background.png" // Use the imported image
        alt="Login Background"
        className="absolute top-0 left-0 w-full h-full object-full z-0"
        width= {800}
        height={800}
      />

      <form className="relative flex-1 flex flex-col min-w-48 max-w-96 z-10">
      {/* Handlingo Title */}
        <div className="flex justify-center">
          <Image
            src="/assets/handlingo-title.png"
            alt="Handlingo Login Title"
            className="mb-10 w-96 h-auto"
            width={600} // Adjust the width as needed
            height={150}  // Adjust the height as needed
          />
        </div>

      {/* Log In Box */}
      <div className="flex flex-col items-center space-y-4 p-6 bg-lightBlue rounded-lg">
        
        {/* Log In / Sign Up button */}
        <div className="flex items-center justify-between w-40">
          <h1 className="w-1/2 text-sm font-semibold font-fira text-black pl-5 mb-4 pb-2 border-b-2 border-black">
            Log in
          </h1>

          <Link className="w-1/2 text-sm font-semibold font-fira text-gray mb-4 pb-2 border-b-2 border-lightBlue max-w-max" href="/auth-pages/sign-up">
            Sign Up
          </Link>
        </div>

        {/* User Form Input Section */}
        <div className="flex flex-col w-full pl-5 pr-5 gap-2 [&>input]:mb-5 mt-8">
          {/* Username */}
          <Label className="font-nunito font-medium" htmlFor="email">Username</Label>
          <Input className="border-b-1 border-black" 
            name="username" 
            placeholder="Your username" 
            required 
            /> 

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
  </div>           
  );
}


