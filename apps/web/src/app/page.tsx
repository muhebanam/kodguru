import Link from 'next/link';
import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  return (
    <main className="min-h-dvh px-4 py-8">
      <AuthForm mode="login" />
      <p className="mt-4 text-center text-sm text-board/70">
        অ্যাকাউন্ট নেই? <Link className="font-bold text-board underline" href="/register">নতুন অ্যাকাউন্ট করুন</Link>
      </p>
    </main>
  );
}
