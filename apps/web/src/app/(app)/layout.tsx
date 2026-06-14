import { AppShell } from '@/components/layout/app-shell';

/** (app) route group — লগইন-পরবর্তী সব পেজ এই shell-এর ভেতরে */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
