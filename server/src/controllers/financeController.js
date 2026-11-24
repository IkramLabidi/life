import { Transaction, Saving } from '../models/Finance.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { crudController } from '../utils/crud.js';
import { monthKey, monthRange, lastMonths, round2, sumBy } from '../utils/dates.js';

export const transactionController = crudController(Transaction, {
  sort: { date: -1, createdAt: -1 },
});

export const savingController = crudController(Saving, {
  sort: { date: -1, createdAt: -1 },
});

const inRange = (value, start, end) => {
  const t = new Date(value).getTime();
  return t >= start.getTime() && t <= end.getTime();
};

/**
 * Balances are always derived from stored transactions, so editing or deleting
 * an entry can never double-count — it simply recomputes the totals.
 */
export const getFinanceSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const selectedMonth = req.query.month || monthKey();
  const { start, end } = monthRange(selectedMonth);

  const [transactions, savings] = await Promise.all([
    Transaction.find({ user: userId }),
    Saving.find({ user: userId }),
  ]);

  const incomes = transactions.filter((t) => t.type === 'income');
  const expenses = transactions.filter((t) => t.type === 'expense');

  const totalIncome = sumBy(incomes, (t) => t.amount);
  const totalExpense = sumBy(expenses, (t) => t.amount);
  const deposits = sumBy(savings.filter((s) => s.type === 'deposit'), (s) => s.amount);
  const withdrawals = sumBy(savings.filter((s) => s.type === 'withdrawal'), (s) => s.amount);

  const monthTx = transactions.filter((t) => inRange(t.date, start, end));
  const monthIncome = sumBy(monthTx.filter((t) => t.type === 'income'), (t) => t.amount);
  const monthExpense = sumBy(monthTx.filter((t) => t.type === 'expense'), (t) => t.amount);
  const monthSavings = sumBy(
    savings.filter((s) => inRange(s.date, start, end)),
    (s) => (s.type === 'deposit' ? s.amount : -s.amount)
  );

  const categoryMap = {};
  monthTx
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
  const byCategory = Object.entries(categoryMap)
    .map(([category, total]) => ({ category, total: round2(total) }))
    .sort((a, b) => b.total - a.total);

  const monthly = lastMonths(6).map((key) => {
    const range = monthRange(key);
    return {
      month: key,
      income: round2(sumBy(transactions.filter((t) => t.type === 'income' && inRange(t.date, range.start, range.end)), (t) => t.amount)),
      expenses: round2(sumBy(transactions.filter((t) => t.type === 'expense' && inRange(t.date, range.start, range.end)), (t) => t.amount)),
      savings: round2(sumBy(savings.filter((s) => inRange(s.date, range.start, range.end)), (s) => (s.type === 'deposit' ? s.amount : -s.amount))),
    };
  });

  res.json({
    bankBalance: round2(totalIncome - totalExpense),
    piggyBalance: round2(deposits - withdrawals),
    totals: {
      income: round2(totalIncome),
      expenses: round2(totalExpense),
      deposits: round2(deposits),
      withdrawals: round2(withdrawals),
    },
    month: {
      key: selectedMonth,
      income: round2(monthIncome),
      expenses: round2(monthExpense),
      savings: round2(monthSavings),
      net: round2(monthIncome - monthExpense),
    },
    byCategory,
    monthly,
  });
});
