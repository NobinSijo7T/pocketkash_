import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Coffee, Bus, ShoppingBag, Film, MoreHorizontal } from 'lucide-react';
import { Transaction, ExpenseCategory } from '@/types/finance';
import { formatINR } from '@/lib/utils';
import { format } from 'date-fns';

interface TodaysExpensesListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const categoryConfig: Record<ExpenseCategory, { label: string; icon: React.ReactNode; color: string }> = {
  food: { label: 'Food', icon: <Coffee className="h-4 w-4" />, color: 'bg-orange-100 text-orange-700' },
  travel: { label: 'Travel', icon: <Bus className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700' },
  shopping: { label: 'Shopping', icon: <ShoppingBag className="h-4 w-4" />, color: 'bg-pink-100 text-pink-700' },
  entertainment: { label: 'Entertainment', icon: <Film className="h-4 w-4" />, color: 'bg-purple-100 text-purple-700' },
  others: { label: 'Others', icon: <MoreHorizontal className="h-4 w-4" />, color: 'bg-gray-100 text-gray-700' },
};

const TodaysExpensesList = ({ transactions, onDelete }: TodaysExpensesListProps) => {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Today's Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No expenses recorded today.</p>
            <p className="text-sm mt-1">Tap the + button to add your first expense.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {sortedTransactions.map((transaction) => {
              const config = transaction.category ? categoryConfig[transaction.category] : categoryConfig.others;
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.color}`}>
                      {config.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description || 'No description'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs py-0">
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-destructive">
                      -{formatINR(transaction.amount)}
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
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysExpensesList;
