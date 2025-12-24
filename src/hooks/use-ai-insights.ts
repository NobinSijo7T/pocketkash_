import { useState, useEffect, useRef, useCallback } from 'react';
import { Transaction, FinanceSummary } from '@/types/finance';
import { formatINR } from '@/lib/utils';
import Groq from 'groq-sdk';

interface AIInsightResult {
  loading: boolean;
  error: string | null;
  insight: string | null;
  refetch: () => void;
}

interface FinanceData {
  transactions: Transaction[];
  summary: FinanceSummary;
  userName?: string;
}

// Generate a simple hash for cache invalidation
function hashData(data: FinanceData): string {
  return `${data.transactions.length}-${data.summary.totalExpenses}-${data.summary.totalIncome}-${data.summary.behaviourType}`;
}

const REFRESH_INTERVAL = 20000; // 20 seconds

export function useAIInsights(data: FinanceData): AIInsightResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  
  const lastHashRef = useRef<string>('');
  const lastFetchTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInsight = useCallback(async (forceRefetch = false) => {
    const currentHash = hashData(data);
    
    // Skip if data hasn't changed (unless forced)
    if (!forceRefetch && currentHash === lastHashRef.current && insight) {
      return;
    }

    // Skip if no transactions
    if (data.transactions.length === 0) {
      setInsight('Add some transactions to get personalized AI insights about your spending patterns.');
      return;
    }

    // Don't show loading state if we already have an insight (prevents UI wobble)
    if (!insight) {
      setLoading(true);
    }
    setError(null);
    lastFetchTimeRef.current = Date.now();

    try {
      // Using Groq Cloud API for AI insights
      const groq = new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const context = `
User's Financial Summary:
- Total Expenses: ${formatINR(data.summary.totalExpenses)}
- Total Income: ${formatINR(data.summary.totalIncome)}
- Balance: ${formatINR(data.summary.balance)}
- Spending Behavior: ${data.summary.behaviourType}
- Recent transactions: ${data.transactions.slice(-5).map(t => `${t.category}: ${formatINR(t.amount)} (${t.emotionTag || 'normal'})`).join(', ')}
- Category breakdown: ${Object.entries(data.summary.categoryBreakdown).map(([cat, amt]) => `${cat}: ${formatINR(amt)}`).join(', ')}

Provide 2-3 bullet points of personalized financial insights and actionable tips for ${data.userName || 'the user'}. Be encouraging and specific.`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a helpful financial advisor for PocketKash, an expense tracking app. Provide brief, actionable insights based on user's spending data. Keep responses concise (2-3 bullet points) and encouraging."
          },
          {
            role: "user",
            content: context
          }
        ],
        temperature: 0.7,
        max_completion_tokens: 300,
        top_p: 1
      });

      const aiInsight = completion.choices[0]?.message?.content || generateFallbackInsight(data);
      setInsight(aiInsight);
      lastHashRef.current = currentHash;
    } catch (err: unknown) {
      const error = err as Error;
      console.error('AI Insights error:', error);
      setError(error?.message || 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
  }, [data, insight]);

  // Auto-fetch on mount only, then refresh every 20 seconds
  useEffect(() => {
    // Initial fetch on mount (only if no insight yet)
    if (!insight && !loading) {
      fetchInsight();
    }
    
    // Set up 20-second interval for auto-refresh
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      // Only fetch if 20 seconds have passed since last fetch
      if (now - lastFetchTimeRef.current >= REFRESH_INTERVAL) {
        fetchInsight(true);
      }
    }, REFRESH_INTERVAL);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount

  const refetch = useCallback(() => {
    fetchInsight(true);
  }, [fetchInsight]);

  return { loading, error, insight, refetch };
}

// Fallback insight generator if API fails
function generateFallbackInsight(data: FinanceData): string {
  const { summary, transactions } = data;
  const tips: string[] = [];

  const impulseSpending = transactions
    .filter(t => t.emotionTag === 'impulse')
    .reduce((s, t) => s + t.amount, 0);
  
  const stressSpending = transactions
    .filter(t => t.emotionTag === 'stress')
    .reduce((s, t) => s + t.amount, 0);

  if (impulseSpending > summary.totalExpenses * 0.2) {
    tips.push(`• Your impulse spending (${formatINR(impulseSpending)}) is high. Try the 24-hour rule before non-essential purchases.`);
  }

  if (stressSpending > 0) {
    tips.push(`• You've spent ${formatINR(stressSpending)} during stressful moments. Consider healthier alternatives like exercise or talking to friends.`);
  }

  if (summary.balance > summary.totalIncome * 0.2) {
    tips.push(`• Great job! You have a healthy balance. Consider putting some into savings.`);
  } else if (summary.balance < 0) {
    tips.push(`• You're spending more than you earn. Review your expenses and cut non-essentials.`);
  }

  const topCategory = Object.entries(summary.categoryBreakdown).sort(([,a], [,b]) => b - a)[0];
  if (topCategory && topCategory[1] > summary.totalExpenses * 0.4) {
    tips.push(`• ${topCategory[0].charAt(0).toUpperCase() + topCategory[0].slice(1)} is your biggest expense category. Look for ways to reduce it.`);
  }

  return tips.length > 0 
    ? tips.join('\n\n') 
    : '• Keep tracking your expenses to get better insights!\n• Set daily spending limits to stay on budget.';
}
