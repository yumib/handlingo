// components/Navbar.tsx

import Link from 'next/link';
import LogoutButton from './logoutButton';

const Navbar = () => {
  return (
    <nav style={{ 
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      padding: '1rem',
      backgroundColor: '#333',
      color: '#fff',
      zIndex: 1000,
    }}>
      <ul style={{ 
        listStyleType: 'none',
        display: 'flex',
        justifyContent: 'flex-end',  // Align links to the right
        gap: '1rem',
        margin: 0, 
       }}>
        <li>
          <Link href="/dashboard" style={{ color: '#fff' }}>Dashboard</Link>
        </li>
        <li>
          <Link href="/profile" style={{ color: '#fff' }}>Profile</Link>
        </li>
        <li>
          <LogoutButton />
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
