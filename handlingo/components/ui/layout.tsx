// components/Layout.tsx

// DELETE THIS AS SOON AS NOTHING IS USING IT
// Nothing should be using it. Correct layout.tsx file with navbar is within (main-pages)

import { ReactNode } from 'react';
import Navbar from './navbar';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
       {/* <Navbar /> This will be fixed on top */}
      <main style={{ padding: '1rem', marginTop: '4rem' }}> {/* Add top margin to prevent content from being covered */}
        {children}
      </main>
    </div>
  );
};

export default Layout;
