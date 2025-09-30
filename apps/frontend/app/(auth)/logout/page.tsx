'use client';

/**
 * Logout page - handles sign out and redirects to login
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { signOut } from '@/lib/auth';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      await signOut();
      router.push('/login');
      router.refresh();
    };

    handleLogout();
  }, [router]);

  return (
    <div className="rounded-lg bg-white p-8 shadow-md">
      <p className="text-center text-gray-600">Saindo...</p>
    </div>
  );
}
