'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';

type PageKey = 'dashboard' | 'auth' | 'login' | 'register' | 'expenses' | 'budgets' | 'goals' | 'bills' | 'insights' | 'services';

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
  merchant: string;
};

type SavingsGoal = {
  id: number;
  name: string;
  target: number;
  saved: number;
  deadline: string;
};

type RecurringBill = {
  id: number;
  name: string;
  amount: number;
  category: string;
  dueDay: number;
  autopay: boolean;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

const navItems: { key: PageKey; href: string; label: string; icon: string }[] = [
  { key: 'dashboard', href: '/', label: 'Dashboard', icon: 'D' },
  { key: 'services', href: '/services', label: 'Services', icon: 'S' },
  { key: 'expenses', href: '/expenses', label: 'Expenses', icon: 'E' },
  { key: 'budgets', href: '/budgets', label: 'Budgets', icon: 'B' },
  { key: 'goals', href: '/goals', label: 'Goals', icon: 'G' },
  { key: 'bills', href: '/bills', label: 'Bills', icon: 'P' },
  { key: 'insights', href: '/insights', label: 'Insights', icon: 'I' },
  { key: 'login', href: '/login', label: 'Login', icon: 'L' },
  { key: 'register', href: '/register', label: 'Register', icon: 'R' },
];

const initialCategories: Category[] = [
  { name: 'Food', limit: 0, predefined: true },
  { name: 'Rent', limit: 0, predefined: true },
  { name: 'Transport', limit: 0, predefined: true },
  { name: 'Utilities', limit: 0, predefined: true },
  { name: 'Health', limit: 0, predefined: true },
  { name: 'Education', limit: 0, predefined: true },
  { name: 'Entertainment', limit: 0, predefined: true },
  { name: 'Savings', limit: 0, predefined: true },
];

const initialExpenses: Expense[] = [];
const initialGoals: SavingsGoal[] = [];
const initialBills: RecurringBill[] = [];

const websiteServices = [
  {
    name: 'Daily expense tracking',
    description: 'Record spending with category, merchant, amount, and notes so every rupee has context.',
    action: 'Track expenses',
  },
  {
    name: 'Budget planning',
    description: 'Create monthly category limits, compare spending against salary, and adjust plans instantly.',
    action: 'Plan budgets',
  },
  {
    name: 'Savings goals',
    description: 'Set savings targets and see how current expenses affect the amount left at month end.',
    action: 'Set goals',
  },
  {
    name: 'Smart alerts',
    description: 'Highlight categories that cross their limit before overspending becomes hard to fix.',
    action: 'Review alerts',
  },
  {
    name: 'Spending insights',
    description: 'Understand top categories, cashflow pressure, and forecasted balance from one visual page.',
    action: 'View insights',
  },
  {
    name: 'Secure account access',
    description: 'Use login and registration flows designed for a personal finance account experience.',
    action: 'Manage account',
  },
];

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function ExpenseWorkspace({ page }: { page: PageKey }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState(0);
  const [period, setPeriod] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState('Ready to request an OTP from the auth service.');
  const [authBusy, setAuthBusy] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRemember, setLoginRemember] = useState(true);
  const [loginMessage, setLoginMessage] = useState('Use your registered email and password to access the dashboard.');
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerIncome, setRegisterIncome] = useState(0);
  const [registerSavings, setRegisterSavings] = useState(0);
  const [registerCity, setRegisterCity] = useState('');
  const [registerGoal, setRegisterGoal] = useState('Build emergency fund');
  const [registerMessage, setRegisterMessage] = useState('Create a profile before managing salary, budgets, and alerts.');
  const [salary, setSalary] = useState(0);
  const [savingsTarget, setSavingsTarget] = useState(0);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals);
  const [bills, setBills] = useState<RecurringBill[]>(initialBills);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryLimit, setNewCategoryLimit] = useState(2500);
  const [expenseCategory, setExpenseCategory] = useState(initialCategories[0].name);
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseMerchant, setExpenseMerchant] = useState('');
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState(0);
  const [goalSaved, setGoalSaved] = useState(0);
  const [goalDeadline, setGoalDeadline] = useState('');
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState(0);
  const [billCategory, setBillCategory] = useState(initialCategories[0].name);
  const [billDueDay, setBillDueDay] = useState(1);
  const [billAutopay, setBillAutopay] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('expensesManagerState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEmail(parsed.email ?? '');
        setLoginEmail(parsed.email ?? '');
        setRegisterName(parsed.registerName ?? '');
        setRegisterPhone(parsed.registerPhone ?? '');
        setRegisterEmail(parsed.email ?? '');
        setRegisterIncome(Number(parsed.salary ?? 0));
        setRegisterSavings(Number(parsed.savingsTarget ?? 0));
        setRegisterCity(parsed.registerCity ?? '');
        setRegisterGoal(parsed.registerGoal ?? 'Build emergency fund');
        setSalary(Number(parsed.salary ?? 0));
        setSavingsTarget(Number(parsed.savingsTarget ?? 0));
        setCategories(Array.isArray(parsed.categories) ? parsed.categories : initialCategories);
        setExpenses(Array.isArray(parsed.expenses) ? parsed.expenses : initialExpenses);
        setGoals(Array.isArray(parsed.goals) ? parsed.goals : initialGoals);
        setBills(Array.isArray(parsed.bills) ? parsed.bills : initialBills);
        setRegistered(Boolean(parsed.registered));
        const savedSessionExpiresAt = Number(parsed.sessionExpiresAt ?? 0);
        setSessionExpiresAt(savedSessionExpiresAt);
        setAuthenticated(Boolean(parsed.authenticated) && savedSessionExpiresAt > Date.now());
      } catch {
        localStorage.removeItem('expensesManagerState');
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    localStorage.setItem(
      'expensesManagerState',
      JSON.stringify({
        authenticated,
        registered,
        sessionExpiresAt: authenticated ? sessionExpiresAt : 0,
        email,
        registerName,
        registerPhone,
        registerCity,
        registerGoal,
        salary,
        savingsTarget,
        categories,
        expenses,
        goals,
        bills,
      }),
    );
  }, [authenticated, bills, categories, email, expenses, goals, ready, registered, registerCity, registerGoal, registerName, registerPhone, salary, savingsTarget, sessionExpiresAt]);

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
    const planned = categories.reduce((total, category) => total + category.limit, 0);
    const monthlyBills = bills.reduce((total, bill) => total + bill.amount, 0);
    const totalGoalTarget = goals.reduce((total, goal) => total + goal.target, 0);
    const totalGoalSaved = goals.reduce((total, goal) => total + goal.saved, 0);
    const projectedSavings = salary - totalSpent;

    return {
      categoryTotals,
      totalSpent,
      planned,
      monthlyBills,
      totalGoalTarget,
      totalGoalSaved,
      remainingSalary: salary - totalSpent,
      projectedSavings,
      savingsPercent: savingsTarget > 0 ? Math.max(0, Math.min((projectedSavings / savingsTarget) * 100, 100)) : 0,
      goalPercent: totalGoalTarget > 0 ? Math.min((totalGoalSaved / totalGoalTarget) * 100, 100) : 0,
      exceededCount: categoryTotals.filter((category) => category.exceeded).length,
    };
  }, [bills, categories, expenses, goals, salary, savingsTarget]);

  const topAlerts = totals.categoryTotals.filter((category) => category.exceeded);
  const topCategories = [...totals.categoryTotals].sort((a, b) => b.spent - a.spent).slice(0, 5);

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
      setAuthMessage('OTP sent. Check your inbox and enter the code.');
    } catch {
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
      setAuthMessage('Verified. JWT and refresh token are saved in browser storage.');
    } catch {
      setAuthMessage('OTP verification failed. Check the code and backend service.');
    } finally {
      setAuthBusy(false);
    }
  }

  function loginUser(event: FormEvent) {
    event.preventDefault();
    if (!registered) {
      setLoginMessage('Register an account before logging in.');
      return;
    }
    if (!loginEmail || !loginPassword) {
      setLoginMessage('Enter both email and password.');
      return;
    }
    setAuthenticated(true);
    setSessionExpiresAt(loginRemember ? Date.now() + sevenDaysMs : 0);
    if (loginRemember) {
      localStorage.setItem('jwtToken', `demo-jwt-${Date.now()}`);
      localStorage.setItem('jwtTokenExpiresAt', String(Date.now() + sevenDaysMs));
    } else {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('jwtTokenExpiresAt');
    }
    setEmail(loginEmail);
    setLoginMessage(loginRemember ? 'Logged in. JWT session is remembered for 7 days.' : 'Logged in for this visit.');
  }

  function registerUser(event: FormEvent) {
    event.preventDefault();
    if (!registerName || !registerPhone || !registerEmail || !registerPassword || registerIncome <= 0 || registerSavings < 0) {
      setRegisterMessage('Name, phone number, email, password, monthly income, and savings target are required.');
      return;
    }
    setEmail(registerEmail);
    setLoginEmail(registerEmail);
    setSalary(registerIncome);
    setSavingsTarget(registerSavings);
    setCategories((current) =>
      current.map((category) => (category.name === 'Savings' ? { ...category, limit: registerSavings } : category)),
    );
    setRegistered(true);
    setAuthenticated(false);
    setSessionExpiresAt(0);
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('jwtTokenExpiresAt');
    setLoginPassword('');
    setRegisterMessage('Registration complete. Please login to start your 7-day JWT session.');
  }

  function logoutUser() {
    setAuthenticated(false);
    setSessionExpiresAt(0);
    setLoginPassword('');
    setLoginMessage('Logged out. Login again to start a new session.');
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

  function updateLimit(categoryName: string, limit: number) {
    setCategories((current) =>
      current.map((category) => (category.name === categoryName ? { ...category, limit } : category)),
    );
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
        merchant: expenseMerchant || 'Manual entry',
        date: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ]);
    setExpenseAmount(0);
    setExpenseDescription('');
    setExpenseMerchant('');
  }

  function addGoal(event: FormEvent) {
    event.preventDefault();
    if (!goalName.trim() || goalTarget <= 0) {
      return;
    }
    setGoals((current) => [
      ...current,
      {
        id: Date.now(),
        name: goalName.trim(),
        target: goalTarget,
        saved: Math.max(goalSaved, 0),
        deadline: goalDeadline || 'No deadline',
      },
    ]);
    setGoalName('');
    setGoalTarget(0);
    setGoalSaved(0);
    setGoalDeadline('');
  }

  function addGoalMoney(goalId: number, amount: number) {
    if (amount <= 0) {
      return;
    }
    setGoals((current) =>
      current.map((goal) => (goal.id === goalId ? { ...goal, saved: Math.min(goal.saved + amount, goal.target) } : goal)),
    );
  }

  function addBill(event: FormEvent) {
    event.preventDefault();
    if (!billName.trim() || billAmount <= 0) {
      return;
    }
    setBills((current) => [
      ...current,
      {
        id: Date.now(),
        name: billName.trim(),
        amount: billAmount,
        category: billCategory,
        dueDay: Math.max(1, Math.min(billDueDay, 31)),
        autopay: billAutopay,
      },
    ]);
    setBillName('');
    setBillAmount(0);
    setBillDueDay(1);
    setBillAutopay(false);
  }

  function payBill(bill: RecurringBill) {
    setExpenses((current) => [
      {
        id: Date.now(),
        category: bill.category,
        amount: bill.amount,
        description: `${bill.name} payment`,
        merchant: 'Recurring bill',
        date: new Date().toISOString().slice(0, 10),
      },
      ...current,
    ]);
  }

  return (
    <main className={darkMode ? 'theme-dark min-h-screen' : 'theme-light min-h-screen'}>
      <div className="min-h-screen bg-[var(--page)] text-[var(--text)] transition-colors duration-300">
        <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-cyan-600 text-sm font-bold text-white">EM</span>
                <span>
                  <span className="block text-lg font-semibold">ExpensesManager</span>
                  <span className="block text-xs text-[var(--muted)]">Microservices finance workspace</span>
                </span>
              </Link>
              <button
                onClick={() => setDarkMode((value) => !value)}
                className="h-10 rounded-md border border-[var(--line)] bg-[var(--panel)] px-4 text-sm font-medium lg:hidden"
              >
                {darkMode ? 'Light' : 'Night'}
              </button>
            </div>

            <nav className="flex gap-2 overflow-x-auto">
              {navItems.filter((item) => {
                if (!registered) {
                  return item.key !== 'login';
                }
                return item.key !== 'register' && item.key !== 'login';
              }).map((item) => {
                const active = pathname === item.href || page === item.key;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${
                      active ? 'bg-[var(--text)] text-[var(--page)]' : 'border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    <span className="grid h-5 w-5 place-items-center rounded bg-cyan-500/15 text-xs text-cyan-400">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
              {registered && !authenticated && (
                <Link
                  href="/login"
                  className={`flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${
                    page === 'login' ? 'bg-[var(--text)] text-[var(--page)]' : 'border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  <span className="grid h-5 w-5 place-items-center rounded bg-cyan-500/15 text-xs text-cyan-400">L</span>
                  Login
                </Link>
              )}
              {registered && authenticated && (
                <button
                  onClick={logoutUser}
                  className="flex h-10 items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--text)]"
                >
                  <span className="grid h-5 w-5 place-items-center rounded bg-rose-500/15 text-xs text-rose-400">O</span>
                  Logout
                </button>
              )}
            </nav>

            <button
              onClick={() => setDarkMode((value) => !value)}
              className="hidden h-10 rounded-md border border-[var(--line)] bg-[var(--panel)] px-4 text-sm font-medium lg:block"
            >
              {darkMode ? 'Light mode' : 'Night mode'}
            </button>
          </div>
        </header>

        <section className="border-b border-[var(--line)] bg-[var(--surface)]">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-medium text-cyan-400">{pageTitle(page).eyebrow}</p>
                <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">{pageTitle(page).title}</h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{pageTitle(page).description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setPeriod(item)}
                    className={`h-10 rounded-md px-4 text-sm font-medium transition ${
                      period === item ? 'bg-cyan-600 text-white' : 'border border-[var(--line)] bg-[var(--panel)] text-[var(--muted)]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
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

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {page === 'dashboard' && (
            <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <div className="space-y-5">
                <AlertStrip alerts={topAlerts.map((item) => item.name)} />
                <FinancialPulse salary={salary} totals={totals} bills={bills} goals={goals} />
                <Panel title="Spending by category">
                  <CategoryGrid categories={totals.categoryTotals} />
                </Panel>
              </div>
              <div className="space-y-5">
                <SalaryPanel salary={salary} savingsTarget={savingsTarget} totals={totals} onSalary={setSalary} onSavings={setSavingsTarget} />
                <MiniGoals goals={goals} />
                <MiniBills bills={bills} onPay={payBill} />
                <RecentExpenses expenses={expenses} />
              </div>
            </div>
          )}

          {page === 'auth' && (
            <div className="grid gap-5 lg:grid-cols-[430px_1fr]">
              <Panel title="Email OTP login">
                <AuthForm
                  email={email}
                  otp={otp}
                  otpSent={otpSent}
                  busy={authBusy}
                  authenticated={authenticated}
                  message={authMessage}
                  onEmail={setEmail}
                  onOtp={setOtp}
                  onSubmit={otpSent ? verifyOtp : sendOtp}
                />
              </Panel>
              <Panel title="Token workflow">
                <WorkflowSteps />
              </Panel>
            </div>
          )}

          {page === 'login' && (
            <div className="grid gap-5 lg:grid-cols-[430px_1fr]">
              <Panel title="Login">
                <LoginForm
                  email={loginEmail}
                  password={loginPassword}
                  remember={loginRemember}
                  message={loginMessage}
                  authenticated={authenticated}
                  onEmail={setLoginEmail}
                  onPassword={setLoginPassword}
                  onRemember={setLoginRemember}
                  onSubmit={loginUser}
                />
              </Panel>
              <Panel title="Account access">
                <AccountBenefits />
              </Panel>
            </div>
          )}

          {page === 'register' && (
            <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
              <Panel title="Create account">
                <RegisterForm
                  name={registerName}
                  phone={registerPhone}
                  email={registerEmail}
                  password={registerPassword}
                  income={registerIncome}
                  savings={registerSavings}
                  city={registerCity}
                  goal={registerGoal}
                  message={registerMessage}
                  onName={setRegisterName}
                  onPhone={setRegisterPhone}
                  onEmail={setRegisterEmail}
                  onPassword={setRegisterPassword}
                  onIncome={setRegisterIncome}
                  onSavings={setRegisterSavings}
                  onCity={setRegisterCity}
                  onGoal={setRegisterGoal}
                  onSubmit={registerUser}
                />
              </Panel>
              <Panel title="Profile setup">
                <ProfilePreview name={registerName} phone={registerPhone} email={registerEmail} income={registerIncome} savings={registerSavings} city={registerCity} goal={registerGoal} />
              </Panel>
            </div>
          )}

          {page === 'expenses' && (
            <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
              <Panel title="Add expense">
                <ExpenseForm
                  categories={categories}
                  category={expenseCategory}
                  amount={expenseAmount}
                  description={expenseDescription}
                  merchant={expenseMerchant}
                  onCategory={setExpenseCategory}
                  onAmount={setExpenseAmount}
                  onDescription={setExpenseDescription}
                  onMerchant={setExpenseMerchant}
                  onSubmit={addExpense}
                />
              </Panel>
              <RecentExpenses expenses={expenses} large />
            </div>
          )}

          {page === 'budgets' && (
            <div className="grid gap-5 lg:grid-cols-[370px_1fr]">
              <div className="space-y-5">
                <SalaryPanel salary={salary} savingsTarget={savingsTarget} totals={totals} onSalary={setSalary} onSavings={setSavingsTarget} />
                <Panel title="Add category">
                  <CategoryForm
                    name={newCategory}
                    limit={newCategoryLimit}
                    onName={setNewCategory}
                    onLimit={setNewCategoryLimit}
                    onSubmit={addCategory}
                  />
                </Panel>
              </div>
              <Panel title="Budget controls">
                <BudgetControls categories={totals.categoryTotals} onLimit={updateLimit} />
              </Panel>
            </div>
          )}

          {page === 'goals' && (
            <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
              <Panel title="Create savings goal">
                <GoalForm
                  name={goalName}
                  target={goalTarget}
                  saved={goalSaved}
                  deadline={goalDeadline}
                  onName={setGoalName}
                  onTarget={setGoalTarget}
                  onSaved={setGoalSaved}
                  onDeadline={setGoalDeadline}
                  onSubmit={addGoal}
                />
              </Panel>
              <Panel title="Goal progress">
                <GoalBoard goals={goals} onAddMoney={addGoalMoney} />
              </Panel>
            </div>
          )}

          {page === 'bills' && (
            <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
              <Panel title="Add recurring bill">
                <BillForm
                  categories={categories}
                  name={billName}
                  amount={billAmount}
                  category={billCategory}
                  dueDay={billDueDay}
                  autopay={billAutopay}
                  onName={setBillName}
                  onAmount={setBillAmount}
                  onCategory={setBillCategory}
                  onDueDay={setBillDueDay}
                  onAutopay={setBillAutopay}
                  onSubmit={addBill}
                />
              </Panel>
              <Panel title="Upcoming bills">
                <BillBoard bills={bills} onPay={payBill} />
              </Panel>
            </div>
          )}

          {page === 'insights' && (
            <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
              <Panel title="Monthly distribution">
                <InsightBars categories={topCategories} total={totals.totalSpent} />
              </Panel>
              <Panel title="Cashflow forecast">
                <Forecast salary={salary} totalSpent={totals.totalSpent} planned={totals.planned} monthlyBills={totals.monthlyBills} goalTarget={totals.totalGoalTarget} goalSaved={totals.totalGoalSaved} />
              </Panel>
            </div>
          )}

          {page === 'services' && (
            <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
              <Panel title="What ExpensesManager offers">
                <ServiceGrid />
              </Panel>
              <Panel title="Best for">
                <div className="space-y-4 text-sm">
                  <Metric label="Individuals" value="Daily expense control" />
                  <Metric label="Families" value="Shared budget planning" />
                  <Metric label="Students" value="Simple saving habits" />
                  <Metric label="Professionals" value="Salary allocation" />
                  <p className="rounded-md bg-[var(--soft)] p-3 text-[var(--muted)]">
                    These are the website services users see and use. Backend technology details stay behind the product experience.
                  </p>
                </div>
              </Panel>
            </div>
          )}
        </section>
        <SiteFooter />
      </div>
    </main>
  );
}

function pageTitle(page: PageKey) {
  const titles = {
    dashboard: {
      eyebrow: 'Operations overview',
      title: 'Interactive spending dashboard',
      description: 'Track salary, expenses, budget pressure, and savings targets from one workspace.',
    },
    auth: {
      eyebrow: 'Auth service',
      title: 'OTP login and token session',
      description: 'Send an email OTP, verify it, and store JWT credentials for downstream service calls.',
    },
    login: {
      eyebrow: 'Member access',
      title: 'Login to your finance workspace',
      description: 'Access saved budgets, expenses, insights, and personal account preferences.',
    },
    register: {
      eyebrow: 'New account',
      title: 'Register your ExpensesManager profile',
      description: 'Add personal, contact, income, and goal details to start managing expenses.',
    },
    expenses: {
      eyebrow: 'Expense service',
      title: 'Expense capture workspace',
      description: 'Add daily expenses, attach merchants, and keep recent activity visible for quick review.',
    },
    budgets: {
      eyebrow: 'Budget service',
      title: 'Salary and category planning',
      description: 'Tune budget limits, add custom categories, and watch savings projections change instantly.',
    },
    goals: {
      eyebrow: 'Savings planner',
      title: 'Goals and progress tracking',
      description: 'Create financial goals, add saved money, and monitor progress from the dashboard.',
    },
    bills: {
      eyebrow: 'Recurring payments',
      title: 'Bill calendar and autopay planning',
      description: 'Track rent, subscriptions, EMI, utilities, and convert bill payments into expenses.',
    },
    insights: {
      eyebrow: 'Analytics layer',
      title: 'Spending insights and forecast',
      description: 'Compare top categories and preview how planned spending affects monthly cashflow.',
    },
    services: {
      eyebrow: 'Website services',
      title: 'Expense management services',
      description: 'Explore the finance services available to users, from daily tracking to savings planning.',
    },
  };
  return titles[page];
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'red' | 'green' | 'amber' }) {
  const toneClass = {
    blue: 'bg-cyan-500',
    red: 'bg-rose-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
  }[tone];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className={`mb-4 h-1.5 w-12 rounded-full ${toneClass}`} />
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </motion.div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </motion.section>
  );
}

function AlertStrip({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm text-emerald-400">
        All categories are currently inside their planned limits.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-rose-400">
      <p className="font-semibold">Budget alert</p>
      <p className="mt-1 text-sm">{alerts.join(', ')} exceeded the planned limit.</p>
    </div>
  );
}

function CategoryGrid({ categories }: { categories: Array<Category & { spent: number; percent: number; exceeded: boolean }> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {categories.map((category, index) => (
        <motion.div key={category.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }} className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold">{category.name}</h3>
              <p className="mt-1 text-xs text-[var(--muted)]">{category.predefined ? 'Predefined' : 'Custom'} category</p>
            </div>
            <span className={`rounded-md px-2 py-1 text-xs ${category.exceeded ? 'bg-rose-500/15 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
              {category.exceeded ? 'Exceeded' : 'On track'}
            </span>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span>{formatMoney(category.spent)}</span>
            <span className="text-[var(--muted)]">{formatMoney(category.limit)}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[var(--track)]">
            <div className={`h-2 rounded-full ${category.exceeded ? 'bg-rose-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min(category.percent, 100)}%` }} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AuthForm(props: {
  email: string;
  otp: string;
  otpSent: boolean;
  busy: boolean;
  authenticated: boolean;
  message: string;
  onEmail: (value: string) => void;
  onOtp: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form onSubmit={props.onSubmit} className="space-y-4">
      <StatusPill active={props.authenticated} activeText="Session active" idleText="Locked" />
      <TextField label="Email" value={props.email} onChange={props.onEmail} />
      {props.otpSent && <TextField label="OTP" value={props.otp} onChange={props.onOtp} placeholder="Enter email OTP" />}
      <p className="rounded-md bg-[var(--soft)] p-3 text-sm text-[var(--muted)]">{props.message}</p>
      <button disabled={props.busy} className="h-11 w-full rounded-md bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60">
        {props.busy ? 'Please wait' : props.otpSent ? 'Verify and create tokens' : 'Send OTP'}
      </button>
    </form>
  );
}

function LoginForm(props: {
  email: string;
  password: string;
  remember: boolean;
  message: string;
  authenticated: boolean;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  onRemember: (value: boolean) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form onSubmit={props.onSubmit} className="space-y-4">
      <StatusPill active={props.authenticated} activeText="Logged in" idleText="Signed out" />
      <TextField label="Email" value={props.email} onChange={props.onEmail} placeholder="you@example.com" />
      <TextField label="Password" type="password" value={props.password} onChange={props.onPassword} placeholder="Enter password" />
      <label className="flex items-center gap-3 rounded-md bg-[var(--soft)] p-3 text-sm">
        <input type="checkbox" checked={props.remember} onChange={(event) => props.onRemember(event.target.checked)} className="h-4 w-4 accent-cyan-500" />
        Remember this browser for 7 days
      </label>
      <p className="rounded-md bg-[var(--soft)] p-3 text-sm text-[var(--muted)]">{props.message}</p>
      <button className="h-11 w-full rounded-md bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-500">
        Login
      </button>
      <Link href="/register" className="block text-center text-sm font-medium text-cyan-400">
        Create a new account
      </Link>
    </form>
  );
}

function RegisterForm(props: {
  name: string;
  phone: string;
  email: string;
  password: string;
  income: number;
  savings: number;
  city: string;
  goal: string;
  message: string;
  onName: (value: string) => void;
  onPhone: (value: string) => void;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  onIncome: (value: number) => void;
  onSavings: (value: number) => void;
  onCity: (value: string) => void;
  onGoal: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form onSubmit={props.onSubmit} className="grid gap-4 md:grid-cols-2">
      <TextField label="Full name" value={props.name} onChange={props.onName} placeholder="Your name" />
      <TextField label="Phone number" value={props.phone} onChange={props.onPhone} placeholder="+91 98765 43210" />
      <TextField label="Email" value={props.email} onChange={props.onEmail} placeholder="you@example.com" />
      <TextField label="Password" type="password" value={props.password} onChange={props.onPassword} placeholder="Create password" />
      <NumberField label="Monthly income" value={props.income} onChange={props.onIncome} />
      <NumberField label="Monthly savings target" value={props.savings} onChange={props.onSavings} />
      <TextField label="City" value={props.city} onChange={props.onCity} placeholder="Bengaluru, Delhi, Mumbai" />
      <label className="block text-sm font-medium md:col-span-2">
        Primary financial goal
        <select value={props.goal} onChange={(event) => props.onGoal(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--input)] px-3 outline-none">
          <option>Build emergency fund</option>
          <option>Reduce monthly overspending</option>
          <option>Plan family budget</option>
          <option>Track student expenses</option>
          <option>Save for a large purchase</option>
        </select>
      </label>
      <p className="rounded-md bg-[var(--soft)] p-3 text-sm text-[var(--muted)] md:col-span-2">{props.message}</p>
      <button className="h-11 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 md:col-span-2">
        Register account
      </button>
    </form>
  );
}

function AccountBenefits() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {['Saved expense history', 'Personal budget limits', 'Salary and savings goals', 'Budget alert preferences'].map((item) => (
        <div key={item} className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-4">
          <p className="font-semibold">{item}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Available after signing in to your ExpensesManager profile.</p>
        </div>
      ))}
    </div>
  );
}

function ProfilePreview({ name, phone, email, income, savings, city, goal }: { name: string; phone: string; email: string; income: number; savings: number; city: string; goal: string }) {
  return (
    <div className="space-y-4 text-sm">
      <Metric label="Name" value={name || 'Not added'} />
      <Metric label="Phone" value={phone || 'Not added'} />
      <Metric label="Email" value={email || 'Not added'} />
      <Metric label="City" value={city || 'Not added'} />
      <Metric label="Income" value={formatMoney(income)} />
      <Metric label="Savings target" value={formatMoney(savings)} />
      <Metric label="Goal" value={goal} />
    </div>
  );
}

function ExpenseForm(props: {
  categories: Category[];
  category: string;
  amount: number;
  description: string;
  merchant: string;
  onCategory: (value: string) => void;
  onAmount: (value: number) => void;
  onDescription: (value: string) => void;
  onMerchant: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form onSubmit={props.onSubmit} className="space-y-3">
      <label className="block text-sm font-medium">
        Category
        <select value={props.category} onChange={(event) => props.onCategory(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--input)] px-3 outline-none">
          {props.categories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <NumberField label="Amount" value={props.amount} onChange={props.onAmount} />
      <TextField label="Merchant" value={props.merchant} onChange={props.onMerchant} placeholder="Store, vendor, landlord" />
      <TextField label="Note" value={props.description} onChange={props.onDescription} placeholder="Lunch, rent, shopping" />
      <button className="h-11 w-full rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500">
        Save expense
      </button>
    </form>
  );
}

function CategoryForm(props: { name: string; limit: number; onName: (value: string) => void; onLimit: (value: number) => void; onSubmit: (event: FormEvent) => void }) {
  return (
    <form onSubmit={props.onSubmit} className="space-y-3">
      <TextField label="Category name" value={props.name} onChange={props.onName} placeholder="Insurance, travel, gifts" />
      <NumberField label="Monthly limit" value={props.limit} onChange={props.onLimit} />
      <button className="h-11 w-full rounded-md border border-[var(--line)] bg-[var(--text)] px-4 text-sm font-semibold text-[var(--page)]">
        Add category
      </button>
    </form>
  );
}

function GoalForm(props: {
  name: string;
  target: number;
  saved: number;
  deadline: string;
  onName: (value: string) => void;
  onTarget: (value: number) => void;
  onSaved: (value: number) => void;
  onDeadline: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form onSubmit={props.onSubmit} className="space-y-3">
      <TextField label="Goal name" value={props.name} onChange={props.onName} placeholder="Emergency fund, laptop, trip" />
      <NumberField label="Target amount" value={props.target} onChange={props.onTarget} />
      <NumberField label="Already saved" value={props.saved} onChange={props.onSaved} />
      <TextField label="Deadline" type="date" value={props.deadline} onChange={props.onDeadline} />
      <button className="h-11 w-full rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500">
        Add goal
      </button>
    </form>
  );
}

function BillForm(props: {
  categories: Category[];
  name: string;
  amount: number;
  category: string;
  dueDay: number;
  autopay: boolean;
  onName: (value: string) => void;
  onAmount: (value: number) => void;
  onCategory: (value: string) => void;
  onDueDay: (value: number) => void;
  onAutopay: (value: boolean) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form onSubmit={props.onSubmit} className="space-y-3">
      <TextField label="Bill name" value={props.name} onChange={props.onName} placeholder="Rent, Netflix, EMI" />
      <NumberField label="Amount" value={props.amount} onChange={props.onAmount} />
      <label className="block text-sm font-medium">
        Category
        <select value={props.category} onChange={(event) => props.onCategory(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--input)] px-3 outline-none">
          {props.categories.map((category) => (
            <option key={category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <NumberField label="Due day of month" value={props.dueDay} onChange={props.onDueDay} />
      <label className="flex items-center gap-3 rounded-md bg-[var(--soft)] p-3 text-sm">
        <input type="checkbox" checked={props.autopay} onChange={(event) => props.onAutopay(event.target.checked)} className="h-4 w-4 accent-cyan-500" />
        Mark as autopay
      </label>
      <button className="h-11 w-full rounded-md bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-500">
        Add bill
      </button>
    </form>
  );
}

function SalaryPanel(props: {
  salary: number;
  savingsTarget: number;
  totals: { projectedSavings: number; savingsPercent: number; remainingSalary: number };
  onSalary: (value: number) => void;
  onSavings: (value: number) => void;
}) {
  return (
    <Panel title="Salary allocation">
      <div className="space-y-4">
        <NumberField label="Salary" value={props.salary} onChange={props.onSalary} />
        <NumberField label="Savings target" value={props.savingsTarget} onChange={props.onSavings} />
        <div className="rounded-md bg-[var(--soft)] p-4">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted)]">Target progress</span>
            <span>{Math.round(props.totals.savingsPercent)}%</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-[var(--track)]">
            <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${props.totals.savingsPercent}%` }} />
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">Remaining salary: {formatMoney(props.totals.remainingSalary)}</p>
        </div>
      </div>
    </Panel>
  );
}

function FinancialPulse({
  salary,
  totals,
  bills,
  goals,
}: {
  salary: number;
  totals: { monthlyBills: number; totalGoalSaved: number; totalGoalTarget: number; goalPercent: number; projectedSavings: number };
  bills: RecurringBill[];
  goals: SavingsGoal[];
}) {
  const runway = totals.monthlyBills > 0 ? Math.floor(Math.max(salary - totals.projectedSavings, 0) / totals.monthlyBills) : 0;
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4">
        <p className="text-sm text-[var(--muted)]">Recurring bills</p>
        <p className="mt-2 text-2xl font-semibold">{formatMoney(totals.monthlyBills)}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{bills.length} active bill plans</p>
      </div>
      <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4">
        <p className="text-sm text-[var(--muted)]">Goal progress</p>
        <p className="mt-2 text-2xl font-semibold">{Math.round(totals.goalPercent)}%</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{goals.length} savings goals</p>
      </div>
      <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4">
        <p className="text-sm text-[var(--muted)]">Bill runway</p>
        <p className="mt-2 text-2xl font-semibold">{runway}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">months covered by current spend pattern</p>
      </div>
    </div>
  );
}

function GoalBoard({ goals, onAddMoney }: { goals: SavingsGoal[]; onAddMoney: (goalId: number, amount: number) => void }) {
  if (goals.length === 0) {
    return <EmptyState title="No goals yet" text="Create a goal for emergency funds, travel, gadgets, education, or any planned purchase." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {goals.map((goal) => {
        const percent = goal.target > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0;
        const remaining = Math.max(goal.target - goal.saved, 0);
        return (
          <div key={goal.id} className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{goal.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">Deadline: {goal.deadline}</p>
              </div>
              <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-xs text-emerald-400">{Math.round(percent)}%</span>
            </div>
            <div className="mt-4 h-3 rounded-full bg-[var(--track)]">
              <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
              <Metric label="Saved" value={formatMoney(goal.saved)} />
              <Metric label="Target" value={formatMoney(goal.target)} />
              <Metric label="Left" value={formatMoney(remaining)} />
            </div>
            <div className="mt-4 flex gap-2">
              {[500, 1000, 5000].map((amount) => (
                <button key={amount} onClick={() => onAddMoney(goal.id, amount)} className="h-9 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 text-xs font-medium">
                  +{formatMoney(amount)}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BillBoard({ bills, onPay }: { bills: RecurringBill[]; onPay: (bill: RecurringBill) => void }) {
  if (bills.length === 0) {
    return <EmptyState title="No bills yet" text="Add recurring bills to track rent, EMI, subscriptions, fees, and utilities." />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[...bills].sort((a, b) => a.dueDay - b.dueDay).map((bill) => (
        <div key={bill.id} className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{bill.name}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{bill.category} - due day {bill.dueDay}</p>
            </div>
            <span className={`rounded-md px-2 py-1 text-xs ${bill.autopay ? 'bg-cyan-500/15 text-cyan-400' : 'bg-amber-500/15 text-amber-400'}`}>
              {bill.autopay ? 'Autopay' : 'Manual'}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xl font-semibold">{formatMoney(bill.amount)}</p>
            <button onClick={() => onPay(bill)} className="h-10 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white">
              Mark paid
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniGoals({ goals }: { goals: SavingsGoal[] }) {
  const firstGoal = goals[0];
  if (!firstGoal) {
    return null;
  }
  const percent = firstGoal.target > 0 ? Math.min((firstGoal.saved / firstGoal.target) * 100, 100) : 0;
  return (
    <Panel title="Top goal">
      <p className="font-semibold">{firstGoal.name}</p>
      <div className="mt-3 h-2 rounded-full bg-[var(--track)]">
        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 text-sm text-[var(--muted)]">{formatMoney(firstGoal.saved)} saved of {formatMoney(firstGoal.target)}</p>
    </Panel>
  );
}

function MiniBills({ bills, onPay }: { bills: RecurringBill[]; onPay: (bill: RecurringBill) => void }) {
  const nextBill = [...bills].sort((a, b) => a.dueDay - b.dueDay)[0];
  if (!nextBill) {
    return null;
  }
  return (
    <Panel title="Next bill">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{nextBill.name}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Due day {nextBill.dueDay} - {formatMoney(nextBill.amount)}</p>
        </div>
        <button onClick={() => onPay(nextBill)} className="h-10 rounded-md bg-cyan-600 px-3 text-sm font-semibold text-white">
          Pay
        </button>
      </div>
    </Panel>
  );
}

function RecentExpenses({ expenses, large = false }: { expenses: Expense[]; large?: boolean }) {
  return (
    <Panel title="Recent expenses">
      <div className="overflow-hidden rounded-lg border border-[var(--line)]">
        <div className="grid grid-cols-[1fr_110px_110px] bg-[var(--soft)] px-4 py-3 text-sm font-medium text-[var(--muted)] sm:grid-cols-[1fr_140px_140px]">
          <span>Expense</span>
          <span>Category</span>
          <span className="text-right">Amount</span>
        </div>
        {expenses.slice(0, large ? 12 : 6).map((expense) => (
          <div key={expense.id} className="grid grid-cols-[1fr_110px_110px] border-t border-[var(--line)] px-4 py-3 text-sm sm:grid-cols-[1fr_140px_140px]">
            <div>
              <p className="font-medium">{expense.description}</p>
              <p className="text-xs text-[var(--muted)]">{expense.merchant} - {expense.date}</p>
            </div>
            <span className="text-[var(--muted)]">{expense.category}</span>
            <span className="text-right font-semibold">{formatMoney(expense.amount)}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function BudgetControls({ categories, onLimit }: { categories: Array<Category & { spent: number; percent: number; exceeded: boolean }>; onLimit: (category: string, limit: number) => void }) {
  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category.name} className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{category.name}</p>
              <p className="text-sm text-[var(--muted)]">{formatMoney(category.spent)} spent from {formatMoney(category.limit)}</p>
            </div>
            <input
              type="number"
              value={category.limit}
              onChange={(event) => onLimit(category.name, Number(event.target.value))}
              className="h-10 w-full rounded-md border border-[var(--line)] bg-[var(--input)] px-3 outline-none sm:w-36"
            />
          </div>
          <input
            type="range"
            min="500"
            max="50000"
            step="500"
            value={category.limit}
            onChange={(event) => onLimit(category.name, Number(event.target.value))}
            className="mt-4 w-full accent-cyan-500"
          />
        </div>
      ))}
    </div>
  );
}

function InsightBars({ categories, total }: { categories: Array<Category & { spent: number }>; total: number }) {
  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const width = total > 0 ? Math.max((category.spent / total) * 100, 3) : 3;
        return (
          <div key={category.name}>
            <div className="flex justify-between text-sm">
              <span>{category.name}</span>
              <span className="text-[var(--muted)]">{formatMoney(category.spent)}</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-[var(--track)]">
              <div className="h-3 rounded-full bg-cyan-500" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Forecast({ salary, totalSpent, planned, monthlyBills, goalTarget, goalSaved }: { salary: number; totalSpent: number; planned: number; monthlyBills: number; goalTarget: number; goalSaved: number }) {
  const remainingPlan = Math.max(planned - totalSpent, 0);
  const goalGap = Math.max(goalTarget - goalSaved, 0);
  const finalBalance = salary - totalSpent - remainingPlan - monthlyBills;
  return (
    <div className="space-y-4">
      <Metric label="Salary" value={formatMoney(salary)} />
      <Metric label="Spent already" value={formatMoney(totalSpent)} />
      <Metric label="Remaining planned budget" value={formatMoney(remainingPlan)} />
      <Metric label="Recurring bills" value={formatMoney(monthlyBills)} />
      <Metric label="Goal gap" value={formatMoney(goalGap)} />
      <Metric label="Forecast balance" value={formatMoney(finalBalance)} />
      <div className={`rounded-md p-3 text-sm ${finalBalance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
        {finalBalance >= 0 ? 'Current plan is cash-positive.' : 'Current plan is over salary. Reduce category limits or increase income.'}
      </div>
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--card)] p-6 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{text}</p>
    </div>
  );
}

function ServiceGrid() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {websiteServices.map((service) => (
        <div key={service.name} className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-4">
          <p className="font-semibold">{service.name}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{service.description}</p>
          <span className="mt-4 inline-flex rounded-md bg-cyan-500/15 px-3 py-1 text-xs font-medium text-cyan-400">{service.action}</span>
        </div>
      ))}
    </div>
  );
}

function WorkflowSteps() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {['Request OTP', 'Verify code', 'Use JWT'].map((step, index) => (
        <div key={step} className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-4">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-cyan-500/15 text-sm font-semibold text-cyan-400">{index + 1}</span>
          <p className="mt-4 font-semibold">{step}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {index === 0 && 'Frontend posts the email address to the auth service through the gateway.'}
            {index === 1 && 'The received code is validated and a refresh token is issued.'}
            {index === 2 && 'Protected budget and expense calls can include the stored access token.'}
          </p>
        </div>
      ))}
    </div>
  );
}

function StatusPill({ active, activeText, idleText }: { active: boolean; activeText: string; idleText: string }) {
  return <span className={`inline-flex rounded-md px-2 py-1 text-xs ${active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>{active ? activeText : idleText}</span>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--input)] px-3 outline-none" />
    </label>
  );
}

function TextField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-11 w-full rounded-md border border-[var(--line)] bg-[var(--input)] px-3 outline-none" />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md bg-[var(--soft)] p-3">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="break-all text-right font-semibold">{value}</span>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-lg font-semibold">ExpensesManager</p>
          <p className="mt-2 max-w-md text-[var(--muted)]">
            A personal finance service for tracking expenses, planning budgets, monitoring savings, and staying ahead of overspending.
          </p>
        </div>
        <div>
          <p className="font-semibold">Pages</p>
          <div className="mt-3 grid gap-2 text-[var(--muted)]">
            <Link href="/services">Services</Link>
            <Link href="/expenses">Expenses</Link>
            <Link href="/budgets">Budgets</Link>
            <Link href="/goals">Goals</Link>
            <Link href="/bills">Bills</Link>
            <Link href="/insights">Insights</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold">Account</p>
          <div className="mt-3 grid gap-2 text-[var(--muted)]">
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
            <Link href="/auth">OTP Auth</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
