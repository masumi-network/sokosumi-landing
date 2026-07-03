import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Masumi Documentation',
  description: 'Documentation for Masumi Network',
};

export default function AgentsPage() {
  redirect('/documentation');
}
