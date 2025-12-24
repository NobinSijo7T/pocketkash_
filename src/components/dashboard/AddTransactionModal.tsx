import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ExpenseCategory, EmotionTag, IncomeSource, Transaction } from '@/types/finance';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

const AddTransactionModal = ({ open, onClose, onAdd }: AddTransactionModalProps) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [source, setSource] = useState<IncomeSource | ''>('');
  const [emotionTag, setEmotionTag] = useState<EmotionTag | ''>('');
  const [date, setDate] = useState<Date>(new Date());

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const transaction: Omit<Transaction, 'id'> = {
      type,
      amount: parseFloat(amount),
      date,
      description: description || undefined,
      category: type === 'expense' ? (category as ExpenseCategory) || undefined : undefined,
      source: type === 'income' ? (source as IncomeSource) || undefined : undefined,
      emotionTag: type === 'expense' ? (emotionTag as EmotionTag) || undefined : undefined,
    };

    onAdd(transaction);
    handleClose();
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setSource('');
    setEmotionTag('');
    setDate(new Date());
    setType('expense');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Track your income or expenses with details like category, date, and emotional context.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as 'income' | 'expense')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" /> Expense
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Income
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <TabsContent value="expense" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">🍔 Food</SelectItem>
                    <SelectItem value="travel">🚌 Travel</SelectItem>
                    <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                    <SelectItem value="entertainment">🎬 Entertainment</SelectItem>
                    <SelectItem value="others">📦 Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>How did you feel? (Optional)</Label>
                <Select value={emotionTag} onValueChange={(v) => setEmotionTag(v as EmotionTag)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tag your emotion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="need">✅ Need - It was necessary</SelectItem>
                    <SelectItem value="impulse">💥 Impulse - Unplanned purchase</SelectItem>
                    <SelectItem value="stress">😓 Stress - Spent to feel better</SelectItem>
                    <SelectItem value="celebration">🎉 Celebration - Treating myself</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="income" className="mt-0">
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={source} onValueChange={(v) => setSource(v as IncomeSource)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allowance">💵 Monthly Allowance</SelectItem>
                    <SelectItem value="salary">💼 Salary</SelectItem>
                    <SelectItem value="side-income">💰 Side Income</SelectItem>
                    <SelectItem value="others">📦 Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              Add {type === 'income' ? 'Income' : 'Expense'}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;
