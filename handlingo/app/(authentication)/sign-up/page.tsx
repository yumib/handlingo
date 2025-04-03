import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { SmtpMessage } from "./smtp-message";

export default async function Signup(props: { searchParams: Promise<Message>; }) {
  
  // not sure what this does, maybe for sign up user errors
  const searchParams = await props.searchParams;

  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form className="relative flex-1 flex flex-col min-w-64 w-3/12">
      {/* Log In Box */}
      <div className="flex flex-col items-center space-y-4 p-6 bg-lightBlue rounded-lg w-full">

        {/* Log In / Sign Up button */}
        <div className="flex items-center justify-between w-40">
          <Link className="w-1/2 text-sm font-semibold font-fira text-gray mb-4 pb-2 border-b-2 border-lightBlue max-w-max" href="/sign-in">
            Log in
          </Link>

          <h1 className="w-1/2 text-sm font-semibold font-fira text-black pl-4 mb-4 pb-2 border-b-2 border-black" >
            Sign Up
          </h1>
        </div>
        
        {/* User Form Input Section */}
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8 w-[calc(95%-20px)]">
          {/* First Name */}
          <Label className="font-nunito font-medium" htmlFor="firstName">First Name</Label>
          <Input className="border-b-1 border-black" name="firstName" placeholder="Your first name" required />
          
          {/* Last Name */}
          <Label className="font-nunito font-medium" htmlFor="lastName">Last Name</Label>
          <Input className="border-b-1 border-black" name="lastName" placeholder="Your last name" required />
          
          {/* Email */}
          <Label className="font-nunito font-medium" htmlFor="email">Email</Label>
          <Input className="border-b-1 border-black" name="email" placeholder="you@example.com" required />
          
          {/* Username*/}
          <Label className="font-nunito font-medium" htmlFor="username">Username</Label>
          <Input className="border-b-1 border-black" name="username" placeholder="Your username" required />
          
          {/* Password */}
          <Label className="font-nunito font-medium" htmlFor="password">Password</Label>
          <Input className="border-b-1 border-black" 
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
        </div>
          
        {/* Submit Button */}
        {/* goes to file ./app/actions.ts to handle creating new user, function signUpAction */}
        <SubmitButton className="w-[calc(95%-20px)] h-10" pendingText="Signing up..." formAction={signUpAction}>
          Sign up
        </SubmitButton>

        <FormMessage message={searchParams} />
        {/* <SmtpMessage /> */}
      </div> {/* end blue box container */}
      </form>
    </>
  );
}
