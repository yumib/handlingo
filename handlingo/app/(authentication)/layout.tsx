import Image from 'next/image';

/**
 * This layout holds the styling for the auth pages:
 *    - /sign-in
 *    - /sign-up
 *    - /forgot-password
 *
 * Layout holds the following elements in following order:
 *    - Background Image
 *    - Parent Wrapper (with centerized and flex styling)
 *    - Handlingo Logo
 *    - {Children}
 *
*/

// LAYOUT PAGE USED FOR COMPONENTS SHARED BETWEEN PAGES 
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-12 items-start">
      {/* Background Image */}
      <Image
        src="/assets/login-background.png" // Use the imported image
        alt="Login Background"
        className="absolute top-0 left-0 w-full h-full object-full z-0"
        width= {800}
        height={800}
      />

      <div className="flex flex-col w-screen items-center justify-center min-h-screen relative">
      {/* Handlingo Title */}
      <div className="flex justify-center">
        <Image
          src="/assets/handlingo-title.png"
          alt="Handlingo Login Title"
          className="mb-10 mt-8 w-96 h-auto"
          width={600} // Adjust the width as needed
          height={150}  // Adjust the height as needed
        />
      </div>
      {children}
      </div>
    </div>
  );
}
  
