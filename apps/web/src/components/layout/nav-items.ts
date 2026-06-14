import type { Role } from '@kodguru/shared';

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

/**
 * role অনুযায়ী navigation।
 * student: শেখা-কেন্দ্রিক। teacher: + যাচাই। admin: + Admin।
 * (server সবসময় enforce করে; এই তালিকা শুধু UI সুবিধা।)
 */
const STUDENT: NavItem[] = [
  { href: '/dashboard', label: 'বাড়ি', icon: '🏠' },
  { href: '/learn', label: 'শিখি', icon: '📖' },
  { href: '/profile', label: 'আমি', icon: '👤' },
];

export function navItemsForRole(role?: Role): NavItem[] {
  const items = [...STUDENT];
  if (role === 'teacher') {
    items.splice(2, 0, { href: '/teacher', label: 'যাচাই', icon: '✅' });
  }
  if (role === 'admin') {
    items.splice(2, 0, { href: '/admin/skill-cards', label: 'Admin', icon: '🧑‍💼' });
    items.splice(3, 0, { href: '/teacher', label: 'যাচাই', icon: '✅' });
  }
  return items;
}
