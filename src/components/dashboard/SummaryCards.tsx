import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import { FinanceSummary, BehaviourType } from '@/types/finance';
import { formatINR } from '@/lib/utils';

interface SummaryCardsProps {
  summary: FinanceSummary;
}

const behaviourLabels: Record<BehaviourType, { label: string; color: string }> = {
  planned: { label: 'Planned Spender', color: 'text-green-600' },
  impulsive: { label: 'Impulsive Spender', color: 'text-orange-600' },
  'frequent-small': { label: 'Frequent Small Spender', color: 'text-blue-600' },
};

const SummaryCards = ({ summary }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-600">{formatINR(summary.totalIncome)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">{formatINR(summary.totalExpenses)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Balance</p>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatINR(summary.balance)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Style</p>
              <p className={`text-lg font-bold ${behaviourLabels[summary.behaviourType].color}`}>
                {behaviourLabels[summary.behaviourType].label}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Target className="h-6 w-6 text-accent-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
