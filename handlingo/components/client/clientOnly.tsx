// components/ClientOnly.tsx

"use client"; // Make this a client-side component

import { ReactNode, useEffect, useState } from 'react';

type ClientOnlyProps = {
  children: ReactNode;
};

const ClientOnly = ({ children }: ClientOnlyProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Check if the component is mounted in the client
    setIsClient(true);
  }, []);

  // Render nothing or a loading spinner until the component is mounted on the client
  if (!isClient) {
    return null;
  }

  return <>{children}</>;
};

export default ClientOnly;
