import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { SmtpMessage } from "@/app/auth-pages/sign-up/smtp-message";

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
      <div className="flex flex-col items-center space-y-4 p-6 bg-lightBlue rounded-lg w-full">

        {/* Log In / Sign Up button */}
        <div className="flex items-center justify-between w-40">
          <Link className="w-1/2 text-sm font-semibold font-fira text-gray mb-4 pb-2 border-b-2 border-lightBlue max-w-max" href="/">
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
    </div>
    </>
  );
}
