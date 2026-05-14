'use client';

import { motion } from 'framer-motion';
import { FormEvent, useMemo, useState } from 'react';

type Category = {
  name: string;
  limit: number;
  predefined: boolean;
};

type Expense = {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
};

const initialCategories: Category[] = [
  { name: 'Food', limit: 12000, predefined: true },
  { name: 'Rent', limit: 25000, predefined: true },
  { name: 'Transport', limit: 5000, predefined: true },
  { name: 'Utilities', limit: 6000, predefined: true },
  { name: 'Health', limit: 4000, predefined: true },
  { name: 'Education', limit: 5000, predefined: true },
  { name: 'Entertainment', limit: 3000, predefined: true },
  { name: 'Savings', limit: 10000, predefined: true },
];

const initialExpenses: Expense[] = [
  { id: 1, category: 'Food', amount: 3200, description: 'Groceries', date: '2026-05-03' },
  { id: 2, category: 'Rent', amount: 25000, description: 'May rent', date: '2026-05-01' },
  { id: 3, category: 'Transport', amount: 1200, description: 'Fuel', date: '2026-05-08' },
  { id: 4, category: 'Entertainment', amount: 1800, description: 'Movie and dinner', date: '2026-05-11' },
];

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [email, setEmail] = useState('dakshika@example.com');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState('OTP will be sent through the auth service.');
  const [authBusy, setAuthBusy] = useState(false);
  const [salary, setSalary] = useState(75000);
  const [savingsTarget, setSavingsTarget] = useState(15000);
  const [period, setPeriod] = useState<'Monthly' | 'Weekly' | 'Yearly'>('Monthly');
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryLimit, setNewCategoryLimit] = useState(2500);
  const [expenseCategory, setExpenseCategory] = useState(initialCategories[0].name);
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseDescription, setExpenseDescription] = useState('');

  const totals = useMemo(() => {
    const categoryTotals = categories.map((category) => {
      const spent = expenses
        .filter((expense) => expense.category === category.name)
        .reduce((total, expense) => total + expense.amount, 0);

      return {
        ...category,
        spent,
        remaining: category.limit - spent,
        percent: category.limit > 0 ? Math.min((spent / category.limit) * 100, 140) : 0,
        exceeded: category.limit > 0 && spent > category.limit,
      };
    });

    const totalSpent = expenses.reduce((total, expense) => total + expense.amount, 0);
    return {
      categoryTotals,
      totalSpent,
      remainingSalary: salary - totalSpent,
      projectedSavings: salary - totalSpent,
      exceededCount: categoryTotals.filter((category) => category.exceeded).length,
    };
  }, [categories, expenses, salary]);

  const topAlerts = totals.categoryTotals.filter((category) => category.exceeded);

  async function sendOtp(event: FormEvent) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage('Sending OTP...');
    try {
      const response = await fetch(`${apiBaseUrl}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`Auth service returned ${response.status}`);
      }

      setOtpSent(true);
      setAuthMessage('OTP sent. Check your inbox, then enter the code.');
    } catch (error) {
      setAuthMessage('Could not reach auth service. Start backend services and configure SMTP email.');
    } finally {
      setAuthBusy(false);
    }
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage('Verifying OTP...');
    try {
      const response = await fetch(`${apiBaseUrl}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        throw new Error(`Auth service returned ${response.status}`);
      }

      const tokens = await response.json();
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      setAuthenticated(true);
      setAuthMessage('Verified. JWT and refresh token saved in browser storage.');
    } catch (error) {
      setAuthMessage('OTP verification failed. Check the code and backend service.');
    } finally {
      setAuthBusy(false);
    }
  }

  function addCategory(event: FormEvent) {
    event.preventDefault();
    const name = newCategory.trim();
    if (!name || categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
      return;
    }
    setCategories((current) => [...current, { name, limit: newCategoryLimit, predefined: false }]);
    setExpenseCategory(name);
    setNewCategory('');
    setNewCategoryLimit(2500);
  }

  function addExpense(event: FormEvent) {
    event.preventDefault();
    if (expenseAmount <= 0) {
      return;
    }
    setExpenses((current) => [
      {
        id: Date.now(),
        category: expenseCategory,
        amount: expenseAmount,
        description: expenseDescription || 'Daily expense',
        date: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ]);
    setExpenseAmount(0);
    setExpenseDescription('');
  }

  return (
    <main className={darkMode ? 'theme-dark min-h-screen' : 'theme-light min-h-screen'}>
      <div className="min-h-screen bg-[var(--page)] text-[var(--text)] transition-colors duration-300">
        <section className="border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-[var(--muted)]">Microservices expense planner</p>
                <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">ExpensesManager</h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {(['Monthly', 'Weekly', 'Yearly'] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setPeriod(item)}
                    className={`h-10 rounded-md px-4 text-sm font-medium transition ${
                      period === item
                        ? 'bg-[var(--text)] text-[var(--page)]'
                        : 'border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
                <button
                  onClick={() => setDarkMode((value) => !value)}
                  className="h-10 rounded-md border border-[var(--line)] bg-[var(--panel)] px-4 text-sm font-medium"
                >
                  {darkMode ? 'Light' : 'Night'}
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <SummaryCard label={`${period} salary`} value={formatMoney(salary)} tone="blue" />
              <SummaryCard label="Spent so far" value={formatMoney(totals.totalSpent)} tone="red" />
              <SummaryCard label="Projected savings" value={formatMoney(totals.projectedSavings)} tone="green" />
              <SummaryCard label="Exceeded categories" value={String(totals.exceededCount)} tone="amber" />
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[340px_1fr] lg:px-8">
          <aside className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Email OTP login</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Backend flow: send OTP, verify OTP, issue JWT and refresh token.
                  </p>
                </div>
                <span className={`rounded-md px-2 py-1 text-xs ${authenticated ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}`}>
                  {authenticated ? 'Active' : 'Locked'}
                </span>
              </div>

              <form onSubmit={otpSent ? verifyOtp : sendOtp} className="mt-5 space-y-3">
                <label className="block text-sm font-medium">
                  Email
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--input)] px-3 outline-none"
                  />
                </label>
                {otpSent && (
                  <label className="block text-sm font-medium">
                    OTP
                    <input
                      value={otp}
                      onChange={(event) => setOtp(event.target.value)}
                      className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--input)] px-3 outline-none"
                      placeholder="Enter email OTP"
                    />
                  </label>
                )}
                <p className="rounded-md bg-[var(--soft)] p-3 text-sm text-[var(--muted)]">{authMessage}</p>
                <button
                  disabled={authBusy}
                  className="h-11 w-full rounded-md bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {authBusy ? 'Please wait' : otpSent ? 'Verify and create tokens' : 'Send OTP'}
                </button>
              </form>
            </motion.div>

            <Panel title="Salary allocation">
              <div className="space-y-4">
                <NumberField label="Salary" value={salary} onChange={setSalary} />
                <NumberField label="Savings target" value={savingsTarget} onChange={setSavingsTarget} />
                <div className="rounded-md bg-[var(--soft)] p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted)]">Target progress</span>
                    <span>{Math.max(0, Math.round((totals.projectedSavings / savingsTarget) * 100))}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[var(--track)]">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${Math.min(Math.max((totals.projectedSavings / savingsTarget) * 100, 0), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="Add category">
              <form onSubmit={addCategory} className="space-y-3">
                <input
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  className="h-11 w-full rounded-md border border-[var(--line)] bg-[var(--input)] px-3 outline-none"
                  placeholder="Category name"
                />
                <NumberField label="Monthly limit" value={newCategoryLimit} onChange={setNewCategoryLimit} />
                <button className="h-11 w-full rounded-md border border-[var(--line)] bg-[var(--text)] px-4 text-sm font-semibold text-[var(--page)]">
                  Add custom category
                </button>
              </form>
            </Panel>
          </aside>

          <div className="space-y-5">
            {topAlerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-rose-500"
              >
                <p className="font-semibold">Budget alert</p>
                <p className="mt-1 text-sm">
                  {topAlerts.map((category) => category.name).join(', ')} exceeded the planned limit. The expense service returns this alert after every new expense.
                </p>
              </motion.div>
            )}

            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <Panel title="Category budgets">
                <div className="grid gap-3 md:grid-cols-2">
                  {totals.categoryTotals.map((category, index) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            {category.predefined ? 'Predefined' : 'Custom'} category
                          </p>
                        </div>
                        <span className={`rounded-md px-2 py-1 text-xs ${category.exceeded ? 'bg-rose-500/15 text-rose-500' : 'bg-emerald-500/15 text-emerald-500'}`}>
                          {category.exceeded ? 'Exceeded' : 'On track'}
                        </span>
                      </div>
                      <div className="mt-4 flex justify-between text-sm">
                        <span>{formatMoney(category.spent)}</span>
                        <span className="text-[var(--muted)]">{formatMoney(category.limit)}</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-[var(--track)]">
                        <div
                          className={`h-2 rounded-full ${category.exceeded ? 'bg-rose-500' : 'bg-cyan-500'}`}
                          style={{ width: `${Math.min(category.percent, 100)}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Panel>

              <Panel title="Add expense">
                <form onSubmit={addExpense} className="space-y-3">
                  <label className="block text-sm font-medium">
                    Category
                    <select
                      value={expenseCategory}
                      onChange={(event) => setExpenseCategory(event.target.value)}
                      className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--input)] px-3 outline-none"
                    >
                      {categories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <NumberField label="Amount" value={expenseAmount} onChange={setExpenseAmount} />
                  <label className="block text-sm font-medium">
                    Note
                    <input
                      value={expenseDescription}
                      onChange={(event) => setExpenseDescription(event.target.value)}
                      className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--input)] px-3 outline-none"
                      placeholder="Lunch, rent, shopping"
                    />
                  </label>
                  <button className="h-11 w-full rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500">
                    Save expense and update budget
                  </button>
                </form>
              </Panel>
            </div>

            <Panel title="Recent expenses">
              <div className="overflow-hidden rounded-lg border border-[var(--line)]">
                <div className="grid grid-cols-[1fr_120px_120px] bg-[var(--soft)] px-4 py-3 text-sm font-medium text-[var(--muted)]">
                  <span>Expense</span>
                  <span>Category</span>
                  <span className="text-right">Amount</span>
                </div>
                {expenses.slice(0, 7).map((expense) => (
                  <div key={expense.id} className="grid grid-cols-[1fr_120px_120px] border-t border-[var(--line)] px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-xs text-[var(--muted)]">{expense.date}</p>
                    </div>
                    <span className="text-[var(--muted)]">{expense.category}</span>
                    <span className="text-right font-semibold">{formatMoney(expense.amount)}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'red' | 'green' | 'amber' }) {
  const toneClass = {
    blue: 'bg-cyan-500',
    red: 'bg-rose-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4"
    >
      <div className={`mb-4 h-1.5 w-12 rounded-full ${toneClass}`} />
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </motion.div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5"
    >
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </motion.section>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--input)] px-3 outline-none"
      />
    </label>
  );
}
