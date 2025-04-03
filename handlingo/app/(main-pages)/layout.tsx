import Navbar from '@/components/ui/navbar';

export default async function Layout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
     <>
      {/* Navbar */}
      <Navbar />
      {children}
     </>
    );
  }