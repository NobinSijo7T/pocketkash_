import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Clock, Wallet } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { RoutineExpense } from '@/types/user';

interface SpendingSuggestionProps {
  dailyLimit: number;
  spentToday: number;
  routineExpenses: RoutineExpense[];
}

const SpendingSuggestion = ({ dailyLimit, spentToday, routineExpenses }: SpendingSuggestionProps) => {
  const remaining = dailyLimit - spentToday;
  const percentUsed = (spentToday / dailyLimit) * 100;
  
  // Calculate remaining routine expenses (simplified: assume they happen later)
  const currentHour = new Date().getHours();
  let routineRemaining = 0;
  
  // Assume morning expenses are done by noon, afternoon by 6pm
  if (currentHour < 12) {
    routineRemaining = routineExpenses.reduce((sum, e) => sum + e.amount, 0);
  } else if (currentHour < 18) {
    // Assume half of routine expenses are for later
    routineRemaining = Math.round(routineExpenses.reduce((sum, e) => sum + e.amount, 0) * 0.5);
  }

  // Don't show if budget is fine
  if (percentUsed < 70 && remaining > routineRemaining) {
    return null;
  }

  // Determine the suggestion
  let icon = <Wallet className="h-5 w-5 text-accent-foreground" />;
  let title = '';
  let message = '';
  let bgClass = 'bg-accent/30 border-accent-foreground/20';

  if (remaining < 0) {
    // Over budget
    icon = <AlertTriangle className="h-5 w-5 text-destructive" />;
    title = 'Daily Limit Exceeded';
    message = `You're ${formatINR(Math.abs(remaining))} over budget. Try to balance it tomorrow by spending less.`;
    bgClass = 'bg-destructive/10 border-destructive/20';
  } else if (remaining < routineRemaining && routineRemaining > 0) {
    // Routine expenses warning
    icon = <Clock className="h-5 w-5 text-accent-foreground" />;
    title = 'Routine Expenses Ahead';
    message = `You usually spend about ${formatINR(routineRemaining)} more today. Only ${formatINR(remaining)} remaining.`;
    bgClass = 'bg-accent/30 border-accent-foreground/20';
  } else if (percentUsed >= 80) {
    // Near limit warning
    icon = <AlertTriangle className="h-5 w-5 text-accent-foreground" />;
    title = 'Almost at Your Limit';
    message = `You've used ${Math.round(percentUsed)}% of today's budget. Only ${formatINR(remaining)} left.`;
    bgClass = 'bg-accent/30 border-accent-foreground/20';
  } else if (percentUsed >= 70) {
    // Gentle reminder
    icon = <Wallet className="h-5 w-5 text-primary" />;
    title = 'Spending Reminder';
    message = `You're at ${Math.round(percentUsed)}% of your daily budget. Spend mindfully!`;
    bgClass = 'bg-primary/10 border-primary/20';
  }

  if (!title) return null;

  return (
    <Card className={`border ${bgClass}`}>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingSuggestion;
