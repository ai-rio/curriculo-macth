/**
 * Dashboard page - protected route
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getUser } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Bem-vindo ao Dashboard</h1>

          <div className="mb-6 space-y-2">
            <p className="text-gray-600">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-gray-600">
              <strong>ID:</strong> {user.id}
            </p>
            <p className="text-gray-600">
              <strong>Criado em:</strong> {new Date(user.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <Link
            href="/logout"
            className="inline-block rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Sair
          </Link>
        </div>
      </div>
    </div>
  );
}
