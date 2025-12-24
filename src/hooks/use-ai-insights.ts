import { useState, useEffect, useRef, useCallback } from 'react';
import Bytez from 'bytez.js';
import { Transaction, FinanceSummary } from '@/types/finance';
import { formatINR } from '@/lib/utils';

const BYTEZ_API_KEY = '16cf973b5ca4c99c522d56d71331bc43';

// Global lock to ensure only 1 API call at a time (Bytez free tier limit)
let isApiCallInProgress = false;
const pendingCallbacks: (() => void)[] = [];

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

// Build a compact prompt for faster inference
function buildPrompt(data: FinanceData): string {
  const { transactions, summary, userName } = data;
  
  // Get emotion-tagged expenses (flagged transactions)
  const flaggedExpenses = transactions.filter(
    t => t.type === 'expense' && (t.emotionTag === 'impulse' || t.emotionTag === 'stress')
  );
  
  // Category breakdown as compact string
  const categoryBreakdown = Object.entries(summary.categoryBreakdown)
    .filter(([, amount]) => amount > 0)
    .map(([cat, amount]) => `${cat}: ${formatINR(amount)}`)
    .join(', ');

  // Emotion breakdown
  const emotionBreakdown: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense' && t.emotionTag).forEach(t => {
    emotionBreakdown[t.emotionTag!] = (emotionBreakdown[t.emotionTag!] || 0) + t.amount;
  });
  const emotionSummary = Object.entries(emotionBreakdown)
    .map(([tag, amount]) => `${tag}: ${formatINR(amount)}`)
    .join(', ');

  const prompt = `You are a personal finance coach. Analyze this spending data and give 2-3 brief, actionable tips (max 150 words total).

User: ${userName || 'User'}
Total Income: ${formatINR(summary.totalIncome)}
Total Expenses: ${formatINR(summary.totalExpenses)}
Balance: ${formatINR(summary.balance)}
Spending Style: ${summary.behaviourType}
Category Breakdown: ${categoryBreakdown || 'None'}
Emotion-Based Spending: ${emotionSummary || 'None'}
Flagged (Impulse/Stress) Transactions: ${flaggedExpenses.length} totaling ${formatINR(flaggedExpenses.reduce((s, t) => s + t.amount, 0))}

Give personalized advice focusing on their spending patterns and flagged emotional spending. Be encouraging but direct. Format as bullet points.`;

  return prompt;
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInsight = useCallback(async (forceRefetch = false) => {
    const currentHash = hashData(data);
    
    // Skip if data hasn't changed (unless forced)
    if (!forceRefetch && currentHash === lastHashRef.current && insight) {
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

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

    // Wait for global API lock (only 1 concurrent request allowed)
    if (isApiCallInProgress) {
      // Queue this request to run after current one completes
      await new Promise<void>((resolve) => {
        pendingCallbacks.push(resolve);
      });
    }
    
    isApiCallInProgress = true;

    try {
      const sdk = new Bytez(BYTEZ_API_KEY);
      // Using gemma-3-1b-it for faster inference (smaller model)
      const model = sdk.model('google/gemma-3-1b-it');
      
      const prompt = buildPrompt(data);
      
      const { error: apiError, output } = await model.run([
        {
          role: 'user',
          content: prompt,
        },
      ]);

      if (apiError) {
        throw new Error(typeof apiError === 'string' ? apiError : 'AI service error');
      }

      // Extract the text response
      let responseText = '';
      if (typeof output === 'string') {
        responseText = output;
      } else if (Array.isArray(output) && output.length > 0) {
        // Handle array response format
        const lastMessage = output[output.length - 1];
        if (typeof lastMessage === 'object' && lastMessage !== null && 'content' in lastMessage) {
          responseText = String(lastMessage.content);
        } else if (typeof lastMessage === 'string') {
          responseText = lastMessage;
        }
      } else if (output && typeof output === 'object') {
        // Handle object response
        const outputObj = output as Record<string, unknown>;
        responseText = String(outputObj.content || outputObj.text || JSON.stringify(output));
      }

      if (responseText) {
        setInsight(responseText.trim());
        lastHashRef.current = currentHash;
      } else {
        throw new Error('Empty response from AI');
      }
    } catch (err: unknown) {
      // Don't set error if request was aborted
      const error = err as Error;
      if (error?.name === 'AbortError') return;
      
      console.error('AI Insights error:', error);
      setError(error?.message || 'Failed to generate AI insights');
      
      // Provide fallback insight based on local data
      const fallback = generateFallbackInsight(data);
      setInsight(fallback);
    } finally {
      setLoading(false);
      // Release the global lock and trigger next queued request
      isApiCallInProgress = false;
      const nextCallback = pendingCallbacks.shift();
      if (nextCallback) {
        nextCallback();
      }
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
      abortControllerRef.current?.abort();
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
