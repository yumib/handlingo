// components/Navbar.tsx
import Link from 'next/link';
import LogoutButton from './logoutButton';
import ClientOnly from '../client/clientOnly'; // Import the ClientOnly wrapper
import Image from 'next/image'
import SignIn from '@/app/(authentication)/sign-in/page';

const Navbar = () => {
  return (
    <nav style={{ 
      width: '100vw',
      top: 0,
      left: 0,
      padding: '1rem 1rem',
      backgroundColor: 'white',
      zIndex: 1000,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      alignItems: 'center',
    }}>
      {/* Left box: image only of handlingo*/}
      <div style={{
        justifySelf: 'start'
        }}
      >
      <Image
        src = "/assets/navbar-logo.png"
        alt = "Logo"
        width = {150}
        height = {150}
        style = {{display: 'block'}}
      />
      </div>

      {/* Middle box: Empty space */}
      <div></div>

      {/* Right Box: Navigation links */}
        <div style = {{
          justifySelf: 'end',
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          }}
        >
        <ul style={{ 
          listStyleType: 'none',
          display: 'flex',
          alignItems: 'end',
          // justifyContent: 'flex-end',  // Align links to the right
          gap: '1rem',
          margin: 0, 
        }}>
        
          <li>
            <Link 
            href="/dashboard" 
            className="text-black text-lg font-fira font-medium"
            >
              DASHBOARD
              </Link>
          </li>
          <li>
            <Link 
            href="/profile" 
            className="text-black text-lg font-fira font-medium"
            >
              PROFILE
            </Link>
          </li>
          <li>
            <ClientOnly>
              <LogoutButton />
            </ClientOnly>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
