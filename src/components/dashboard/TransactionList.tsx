import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction, ExpenseCategory, EmotionTag, IncomeSource } from '@/types/finance';
import { format } from 'date-fns';
import { formatINR } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const categoryLabels: Record<ExpenseCategory, string> = {
  food: 'Food',
  travel: 'Travel',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  others: 'Others',
};

const emotionLabels: Record<EmotionTag, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  need: { label: 'Need', variant: 'secondary' },
  impulse: { label: 'Impulse', variant: 'destructive' },
  stress: { label: 'Stress', variant: 'outline' },
  celebration: { label: 'Celebration', variant: 'default' },
};

const sourceLabels: Record<IncomeSource, string> = {
  allowance: 'Allowance',
  salary: 'Salary',
  'side-income': 'Side Income',
  others: 'Others',
};

const TransactionList = ({ transactions, onDelete }: TransactionListProps) => {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No transactions yet. Add your first one!
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {sortedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description || 'No description'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </span>
                      {transaction.category && (
                        <Badge variant="secondary" className="text-xs">
                          {categoryLabels[transaction.category]}
                        </Badge>
                      )}
                      {transaction.source && (
                        <Badge variant="secondary" className="text-xs">
                          {sourceLabels[transaction.source]}
                        </Badge>
                      )}
                      {transaction.emotionTag && (
                        <Badge variant={emotionLabels[transaction.emotionTag].variant} className="text-xs">
                          {emotionLabels[transaction.emotionTag].label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{formatINR(transaction.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
