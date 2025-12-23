import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, TrendingUp, ShoppingBag, Coffee, Bus } from 'lucide-react';
import { Transaction, ExpenseCategory } from '@/types/finance';

interface SmartInsightProps {
  transactions: Transaction[];
  dailyLimit: number;
  spentToday: number;
}

const categoryIcons: Record<ExpenseCategory, React.ReactNode> = {
  food: <Coffee className="h-4 w-4" />,
  travel: <Bus className="h-4 w-4" />,
  shopping: <ShoppingBag className="h-4 w-4" />,
  entertainment: <TrendingUp className="h-4 w-4" />,
  others: <Lightbulb className="h-4 w-4" />,
};

const SmartInsight = ({ transactions, dailyLimit, spentToday }: SmartInsightProps) => {
  // Generate insight based on today's spending pattern
  const generateInsight = (): { title: string; message: string; icon: React.ReactNode } => {
    if (transactions.length === 0) {
      return {
        title: 'Fresh Start!',
        message: 'No expenses yet today. A great opportunity to stay within your budget!',
        icon: <Lightbulb className="h-5 w-5 text-primary" />,
      };
    }

    // Check for impulse spending
    const impulseCount = transactions.filter(t => t.emotionTag === 'impulse').length;
    if (impulseCount >= 2) {
      return {
        title: 'Impulse Alert',
        message: `You've made ${impulseCount} impulse purchases today. Take a moment before the next one.`,
        icon: <ShoppingBag className="h-5 w-5 text-destructive" />,
      };
    }

    // Check for stress spending
    const stressSpending = transactions.filter(t => t.emotionTag === 'stress');
    if (stressSpending.length > 0) {
      return {
        title: 'Stress Spending Detected',
        message: 'Noticed some stress-related spending. Consider a walk or a deep breath instead!',
        icon: <Coffee className="h-5 w-5 text-accent-foreground" />,
      };
    }

    // Analyze top category
    const categoryTotals: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.category) {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    
    if (topCategory) {
      const percentage = Math.round((topCategory[1] / spentToday) * 100);
      return {
        title: 'Spending Pattern',
        message: `${percentage}% of today's spending is on ${topCategory[0]}. Is this aligned with your priorities?`,
        icon: categoryIcons[topCategory[0] as ExpenseCategory] || <Lightbulb className="h-5 w-5 text-primary" />,
      };
    }

    // Default insight about budget usage
    const percentUsed = Math.round((spentToday / dailyLimit) * 100);
    if (percentUsed < 50) {
      return {
        title: 'On Track!',
        message: `You've used ${percentUsed}% of your daily budget. Great discipline!`,
        icon: <TrendingUp className="h-5 w-5 text-primary" />,
      };
    }

    return {
      title: 'Stay Mindful',
      message: `You've used ${percentUsed}% of your daily budget. Plan your remaining spending wisely.`,
      icon: <Lightbulb className="h-5 w-5 text-accent-foreground" />,
    };
  };

  const insight = generateInsight();

  return (
    <Card className="border-border bg-gradient-to-r from-primary/5 to-accent/5">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            {insight.icon}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{insight.title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{insight.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartInsight;
