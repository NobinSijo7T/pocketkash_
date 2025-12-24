import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction, FinanceSummary, ExpenseCategory, BehaviourType, Insight } from '@/types/finance';
import { formatINR } from '@/lib/utils';

interface FinanceContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  getSummary: () => FinanceSummary;
  getInsights: () => Insight[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: generateId() }]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const getSummary = (): FinanceSummary => {
    // Calculate income from transactions only
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate expenses from transactions only
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    const categoryBreakdown: Record<ExpenseCategory, number> = {
      food: 0,
      travel: 0,
      shopping: 0,
      entertainment: 0,
      others: 0,
    };

    transactions
      .filter(t => t.type === 'expense' && t.category)
      .forEach(t => {
        categoryBreakdown[t.category!] += t.amount;
      });

    // Simple behaviour classification
    const impulseCount = transactions.filter(t => t.emotionTag === 'impulse').length;
    const smallTransactions = transactions.filter(t => t.type === 'expense' && t.amount < 100).length;
    const totalExpenseCount = transactions.filter(t => t.type === 'expense').length;

    let behaviourType: BehaviourType = 'planned';
    if (impulseCount / totalExpenseCount > 0.4) {
      behaviourType = 'impulsive';
    } else if (smallTransactions / totalExpenseCount > 0.5) {
      behaviourType = 'frequent-small';
    }

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      categoryBreakdown,
      behaviourType,
    };
  };

  const getInsights = (): Insight[] => {
    const summary = getSummary();
    const insights: Insight[] = [];

    // Behaviour insight
    const behaviourMessages: Record<BehaviourType, string> = {
      planned: "You're a Planned Spender! You think before spending and manage money wisely.",
      impulsive: "You tend to be an Impulsive Spender. Consider pausing before making purchases.",
      'frequent-small': "You're a Frequent Small Spender. Those small purchases add up!",
    };

    insights.push({
      id: '1',
      type: 'behaviour',
      title: 'Your Spending Style',
      description: behaviourMessages[summary.behaviourType],
      icon: '🎯',
    });

    // Food spending insight
    if (summary.categoryBreakdown.food > summary.totalExpenses * 0.4) {
      insights.push({
        id: '2',
        type: 'leak',
        title: 'Food Money Leak Detected',
        description: `You spent ${formatINR(summary.categoryBreakdown.food)} on food (${Math.round((summary.categoryBreakdown.food / summary.totalExpenses) * 100)}% of expenses). Consider cooking more at home.`,
        icon: '🍔',
      });
    }

    // Saving advice
    if (summary.balance > 1000) {
      insights.push({
        id: '3',
        type: 'saving',
        title: 'Great Savings Potential!',
        description: `You have ${formatINR(summary.balance)} surplus. Consider starting a small recurring deposit or emergency fund.`,
        icon: '💰',
      });
    }

    // Stress spending alert
    const stressSpending = transactions.filter(t => t.emotionTag === 'stress');
    if (stressSpending.length > 2) {
      insights.push({
        id: '4',
        type: 'alert',
        title: 'Stress Spending Pattern',
        description: 'You seem to spend when stressed. Try healthier stress relief activities like exercise or talking to friends.',
        icon: '⚠️',
      });
    }

    return insights;
  };

  return (
    <FinanceContext.Provider value={{ transactions, addTransaction, deleteTransaction, getSummary, getInsights }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
