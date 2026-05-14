import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ExpensesManager',
  description: 'Expense tracking and budget planning dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
