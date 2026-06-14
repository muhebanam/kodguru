import Link from 'next/link';
import { AuthForm } from '@/components/auth/auth-form';

export default function RegisterPage() {
  return (
    <main className="min-h-dvh px-4 py-8">
      <AuthForm mode="register" />
      <p className="mt-4 text-center text-sm text-board/70">
        আগে থেকেই অ্যাকাউন্ট আছে? <Link className="font-bold text-board underline" href="/login">লগইন করুন</Link>
      </p>
    </main>
  );
}
