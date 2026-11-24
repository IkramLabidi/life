import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  PiggyBank,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import useCollection from '../hooks/useCollection.js';
import useApiData from '../hooks/useApiData.js';
import api, { getErrorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Card, { CardHeader } from '../components/ui/Card.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import SegmentedControl from '../components/ui/SegmentedControl.jsx';
import { Field, Input, Select, Textarea } from '../components/ui/FormControls.jsx';
import ChartCard, { ChartTooltip } from '../components/charts/Charts.jsx';
import { CATEGORY_META, EXPENSE_CATEGORIES } from '../utils/constants.js';
import { currentMonthKey, formatCurrency, formatDate, formatMonthLabel, todayISO } from '../utils/format.js';

const TABS = [
  { value: 'transactions', label: 'Transactions' },
  { value: 'savings', label: 'Piggy bank' },
];

const emptyTx = () => ({
  type: 'expense',
  amount: '',
  date: todayISO(),
  category: 'food',
  source: '',
  description: '',
});

const emptySaving = () => ({ type: 'deposit', amount: '', date: todayISO(), description: '' });

const Finances = () => {
  const { user } = useAuth();
  const toast = useToast();
  const currency = user?.currency || 'USD';

  const [month, setMonth] = useState(currentMonthKey());
  const [tab, setTab] = useState('transactions');

  const summary = useApiData('/finance/summary', { month });
  const tx = useCollection('/transactions');
  const savings = useCollection('/savings');

  const [txModal, setTxModal] = useState(null); // { mode, form, id }
  const [savingModal, setSavingModal] = useState(null);
  const [confirm, setConfirm] = useState(null); // { kind, id, title }
  const [busy, setBusy] = useState(false);

  const summaryData = summary.data || {};
  const s = summaryData;

  const refreshSummary = () => summary.reload();

  const sortedTx = useMemo(
    () => [...tx.items].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [tx.items]
  );
  const sortedSavings = useMemo(
    () => [...savings.items].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [savings.items]
  );

  const pieData = (s.byCategory || []).map((c) => ({
    name: CATEGORY_META[c.category]?.label || c.category,
    value: c.total,
    color: CATEGORY_META[c.category]?.color || '#ADB8C4',
  }));

  const barData = (s.monthly || []).map((m) => ({
    month: formatMonthLabel(m.month).split(' ')[0],
    Income: m.income,
    Expenses: m.expenses,
    Savings: m.savings,
  }));

  // ---------- transaction handlers ----------
  const submitTx = async (e) => {
    e.preventDefault();
    const { mode, form, id } = txModal;
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Enter an amount greater than zero');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        type: form.type,
        amount: Number(form.amount),
        date: form.date,
        category: form.type === 'income' ? 'income' : form.category,
        source: form.source,
        description: form.description,
      };
      if (mode === 'create') await tx.create(payload, 'Transaction added');
      else await tx.update(id, payload, 'Transaction updated');
      setTxModal(null);
      refreshSummary();
    } catch {
      /* toast handled in hook */
    } finally {
      setBusy(false);
    }
  };

  const submitSaving = async (e) => {
    e.preventDefault();
    const { mode, form, id } = savingModal;
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error('Enter an amount greater than zero');
      return;
    }
    setBusy(true);
    try {
      const payload = { type: form.type, amount: Number(form.amount), date: form.date, description: form.description };
      if (mode === 'create') await savings.create(payload, 'Piggy bank entry added');
      else await savings.update(id, payload, 'Piggy bank entry updated');
      setSavingModal(null);
      refreshSummary();
    } catch {
      /* toast handled in hook */
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.kind === 'tx') await tx.remove(confirm.id, 'Transaction deleted');
      else await savings.remove(confirm.id, 'Piggy bank entry deleted');
      setConfirm(null);
      refreshSummary();
    } finally {
      setBusy(false);
    }
  };

  const setTxField = (key) => (e) =>
    setTxModal((m) => ({ ...m, form: { ...m.form, [key]: e.target.value } }));
  const setSavingField = (key) => (e) =>
    setSavingModal((m) => ({ ...m, form: { ...m.form, [key]: e.target.value } }));

  const loading = tx.loading || savings.loading;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Financial tracker"
        subtitle="Bank balance, everyday spending and your piggy bank — all derived from your own transactions."
        actions={
          <>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-auto"
              aria-label="Select month"
            />
            <Button
              icon={Plus}
              variant="accent"
              onClick={() => setTxModal({ mode: 'create', form: emptyTx() })}
            >
              Add transaction
            </Button>
          </>
        }
      />

      <section className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Bank balance"
          value={formatCurrency(s.bankBalance, currency)}
          sub="All income minus all expenses"
          accent="#6E8FAE"
        />
        <StatCard
          icon={PiggyBank}
          label="Piggy bank"
          value={formatCurrency(s.piggyBalance, currency)}
          sub="Deposits minus withdrawals"
          accent="#5F8A79"
        />
        <StatCard
          icon={TrendingUp}
          label={`Income · ${formatMonthLabel(month).split(' ')[0]}`}
          value={formatCurrency(s.month?.income, currency)}
          sub={`Net ${formatCurrency(s.month?.net, currency)} this month`}
          accent="#4E7364"
        />
        <StatCard
          icon={TrendingDown}
          label={`Expenses · ${formatMonthLabel(month).split(' ')[0]}`}
          value={formatCurrency(s.month?.expenses, currency)}
          sub={`Savings ${formatCurrency(s.month?.savings, currency)} this month`}
          accent="#587A9B"
        />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Spending by category" subtitle={formatMonthLabel(month)} icon={Receipt} height={280}>
          {pieData.length ? (
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="82%" paddingAngle={2}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v, currency)} />} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value) => <span className="text-xs text-taupe-600">{value}</span>}
              />
            </PieChart>
          ) : (
            <div className="grid h-full place-items-center text-sm text-taupe-500">
              No expenses recorded for this month yet.
            </div>
          )}
        </ChartCard>

        <ChartCard title="Income vs Expenses" subtitle="Last 6 months" icon={TrendingUp} height={280}>
          <BarChart data={barData} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DEE5EC" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5F7186' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#5F7186' }} axisLine={false} tickLine={false} width={48} />
            <Tooltip cursor={{ fill: 'rgba(110, 143, 174,0.18)' }} content={<ChartTooltip formatter={(v) => formatCurrency(v, currency)} />} />
            <Legend iconType="circle" formatter={(value) => <span className="text-xs text-taupe-600">{value}</span>} />
            <Bar dataKey="Income" fill="#5F8A79" radius={[6, 6, 0, 0]} maxBarSize={26} />
            <Bar dataKey="Expenses" fill="#6E8FAE" radius={[6, 6, 0, 0]} maxBarSize={26} />
          </BarChart>
        </ChartCard>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <SegmentedControl options={TABS} value={tab} onChange={setTab} />
          {tab === 'transactions' ? (
            <Button icon={Plus} variant="outline" size="sm" onClick={() => setTxModal({ mode: 'create', form: emptyTx() })}>
              New transaction
            </Button>
          ) : (
            <Button icon={Plus} variant="outline" size="sm" onClick={() => setSavingModal({ mode: 'create', form: emptySaving() })}>
              New piggy entry
            </Button>
          )}
        </div>

        {tab === 'transactions' && (
          <Card>
            <CardHeader title="All transactions" subtitle="Income and expenses" icon={Banknote} />
            {loading && !tx.items.length ? (
              <div className="p-4 text-sm text-taupe-500">Loading transactions…</div>
            ) : sortedTx.length ? (
              <div className="overflow-x-auto scroll-thin">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-taupe-500">
                      <th className="px-5 py-3 font-semibold">Date</th>
                      <th className="px-5 py-3 font-semibold">Type</th>
                      <th className="px-5 py-3 font-semibold">Category</th>
                      <th className="px-5 py-3 font-semibold">Details</th>
                      <th className="px-5 py-3 text-right font-semibold">Amount</th>
                      <th className="px-5 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTx.map((t) => {
                      const income = t.type === 'income';
                      return (
                        <tr key={t._id} className="border-t border-sand-200">
                          <td className="whitespace-nowrap px-5 py-3 text-taupe-600">{formatDate(t.date)}</td>
                          <td className="px-5 py-3">
                            <Badge color={income ? '#4E7364' : '#587A9B'}>
                              {income ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                              {income ? 'Income' : 'Expense'}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-espresso-700">
                            {CATEGORY_META[t.category]?.label || t.category}
                          </td>
                          <td className="px-5 py-3 text-taupe-600">
                            <span className="font-medium text-espresso-700">{t.source || '—'}</span>
                            {t.description ? ` · ${t.description}` : ''}
                          </td>
                          <td
                            className={`whitespace-nowrap px-5 py-3 text-right font-semibold ${
                              income ? 'text-olive-600' : 'text-terracotta-600'
                            }`}
                          >
                            {income ? '+' : '−'}
                            {formatCurrency(t.amount, currency)}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setTxModal({
                                    mode: 'edit',
                                    id: t._id,
                                    form: {
                                      type: t.type,
                                      amount: t.amount,
                                      date: todayISO(t.date),
                                      category: t.category === 'income' ? 'food' : t.category,
                                      source: t.source || '',
                                      description: t.description || '',
                                    },
                                  })
                                }
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-terracotta-600"
                                onClick={() => setConfirm({ kind: 'tx', id: t._id, title: t.source || t.description || 'this transaction' })}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-5">
                <EmptyState
                  icon={Receipt}
                  title="No transactions yet"
                  description="Record your first income or expense to start tracking your balance."
                  action={
                    <Button icon={Plus} variant="accent" onClick={() => setTxModal({ mode: 'create', form: emptyTx() })}>
                      Add transaction
                    </Button>
                  }
                />
              </div>
            )}
          </Card>
        )}

        {tab === 'savings' && (
          <Card>
            <CardHeader
              title="Piggy bank savings"
              subtitle="Deposits and withdrawals"
              icon={PiggyBank}
              action={<Badge color="#4E7364">Balance {formatCurrency(s.piggyBalance, currency)}</Badge>}
            />
            {loading && !savings.items.length ? (
              <div className="p-4 text-sm text-taupe-500">Loading piggy bank…</div>
            ) : sortedSavings.length ? (
              <div className="overflow-x-auto scroll-thin">
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-taupe-500">
                      <th className="px-5 py-3 font-semibold">Date</th>
                      <th className="px-5 py-3 font-semibold">Type</th>
                      <th className="px-5 py-3 font-semibold">Note</th>
                      <th className="px-5 py-3 text-right font-semibold">Amount</th>
                      <th className="px-5 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSavings.map((sv) => {
                      const dep = sv.type === 'deposit';
                      return (
                        <tr key={sv._id} className="border-t border-sand-200">
                          <td className="whitespace-nowrap px-5 py-3 text-taupe-600">{formatDate(sv.date)}</td>
                          <td className="px-5 py-3">
                            <Badge color={dep ? '#5F8A79' : '#B08A57'}>{dep ? 'Deposit' : 'Withdrawal'}</Badge>
                          </td>
                          <td className="px-5 py-3 text-taupe-600">{sv.description || '—'}</td>
                          <td className={`whitespace-nowrap px-5 py-3 text-right font-semibold ${dep ? 'text-olive-600' : 'text-gold-500'}`}>
                            {dep ? '+' : '−'}
                            {formatCurrency(sv.amount, currency)}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setSavingModal({
                                    mode: 'edit',
                                    id: sv._id,
                                    form: { type: sv.type, amount: sv.amount, date: todayISO(sv.date), description: sv.description || '' },
                                  })
                                }
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-terracotta-600"
                                onClick={() => setConfirm({ kind: 'saving', id: sv._id, title: sv.description || 'this entry' })}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-5">
                <EmptyState
                  icon={PiggyBank}
                  title="Your piggy bank is empty"
                  description="Add your first deposit to start building savings."
                  action={
                    <Button icon={Plus} variant="accent" onClick={() => setSavingModal({ mode: 'create', form: emptySaving() })}>
                      Add deposit
                    </Button>
                  }
                />
              </div>
            )}
          </Card>
        )}
      </section>

      {/* Transaction modal */}
      <Modal
        open={Boolean(txModal)}
        onClose={() => setTxModal(null)}
        title={txModal?.mode === 'edit' ? 'Edit transaction' : 'New transaction'}
        subtitle="Balances update automatically — no double counting."
        footer={
          <>
            <Button variant="outline" onClick={() => setTxModal(null)}>
              Cancel
            </Button>
            <Button onClick={submitTx} loading={busy}>
              {txModal?.mode === 'edit' ? 'Save changes' : 'Add transaction'}
            </Button>
          </>
        }
      >
        {txModal && (
          <form onSubmit={submitTx} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-sand-200 bg-cream-50 p-1">
              {[
                { value: 'expense', label: 'Expense', color: '#6E8FAE' },
                { value: 'income', label: 'Income', color: '#4E7364' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTxModal((m) => ({ ...m, form: { ...m.form, type: opt.value } }))}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    txModal.form.type === opt.value ? 'text-cream-50' : 'text-taupe-600 hover:bg-sand-100'
                  }`}
                  style={txModal.form.type === opt.value ? { backgroundColor: opt.color } : undefined}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Amount" required>
                <Input type="number" min="0" step="0.01" value={txModal.form.amount} onChange={setTxField('amount')} placeholder="0.00" />
              </Field>
              <Field label="Date" required>
                <Input type="date" value={txModal.form.date} onChange={setTxField('date')} />
              </Field>
            </div>

            {txModal.form.type === 'expense' && (
              <Field label="Category" required>
                <Select value={txModal.form.category} onChange={setTxField('category')}>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_META[c]?.label || c}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            <Field label="Source / merchant">
              <Input value={txModal.form.source} onChange={setTxField('source')} placeholder="e.g. Monthly salary, Grocery store" />
            </Field>
            <Field label="Description">
              <Textarea value={txModal.form.description} onChange={setTxField('description')} placeholder="Optional note" />
            </Field>
          </form>
        )}
      </Modal>

      {/* Saving modal */}
      <Modal
        open={Boolean(savingModal)}
        onClose={() => setSavingModal(null)}
        title={savingModal?.mode === 'edit' ? 'Edit piggy bank entry' : 'New piggy bank entry'}
        footer={
          <>
            <Button variant="outline" onClick={() => setSavingModal(null)}>
              Cancel
            </Button>
            <Button onClick={submitSaving} loading={busy}>
              {savingModal?.mode === 'edit' ? 'Save changes' : 'Add entry'}
            </Button>
          </>
        }
      >
        {savingModal && (
          <form onSubmit={submitSaving} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-sand-200 bg-cream-50 p-1">
              {[
                { value: 'deposit', label: 'Deposit', color: '#5F8A79' },
                { value: 'withdrawal', label: 'Withdrawal', color: '#B08A57' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSavingModal((m) => ({ ...m, form: { ...m.form, type: opt.value } }))}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    savingModal.form.type === opt.value ? 'text-cream-50' : 'text-taupe-600 hover:bg-sand-100'
                  }`}
                  style={savingModal.form.type === opt.value ? { backgroundColor: opt.color } : undefined}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Amount" required>
                <Input type="number" min="0" step="0.01" value={savingModal.form.amount} onChange={setSavingField('amount')} placeholder="0.00" />
              </Field>
              <Field label="Date" required>
                <Input type="date" value={savingModal.form.date} onChange={setSavingField('date')} />
              </Field>
            </div>
            <Field label="Note">
              <Input value={savingModal.form.description} onChange={setSavingField('description')} placeholder="e.g. Monthly savings transfer" />
            </Field>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={doDelete}
        loading={busy}
        title="Delete entry?"
        message={`This will permanently remove ${confirm?.title}. Balances will be recalculated.`}
      />
    </div>
  );
};

export default Finances;
