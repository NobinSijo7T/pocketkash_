import { useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { formatINR } from '@/lib/utils';
import { useAIInsights } from '@/hooks/use-ai-insights';
import { Lightbulb, Target, TrendingUp, Brain, Zap, Heart, AlertTriangle, Sparkles, Bot, RefreshCw, Loader2, PieChartIcon, BarChart3 } from 'lucide-react';

// Color mappings for charts (defined outside component for stable references)
const CATEGORY_COLORS: Record<string, string> = {
  food: 'hsl(25, 95%, 53%)',       // orange
  travel: 'hsl(200, 80%, 50%)',    // blue
  shopping: 'hsl(280, 70%, 60%)',  // purple
  entertainment: 'hsl(340, 80%, 55%)', // pink
  others: 'hsl(210, 10%, 50%)',    // gray
};

const EMOTION_COLORS: Record<string, string> = {
  need: 'hsl(142, 76%, 36%)',      // green
  impulse: 'hsl(25, 95%, 53%)',    // orange
  stress: 'hsl(0, 84%, 60%)',      // red
  celebration: 'hsl(280, 70%, 60%)', // purple
};

const EMOTION_LABELS: Record<string, { label: string; color: string }> = {
  need: { label: 'Essential Needs', color: 'text-green-600' },
  impulse: { label: 'Impulse Buys', color: 'text-orange-500' },
  stress: { label: 'Stress Spending', color: 'text-red-500' },
  celebration: { label: 'Celebrations', color: 'text-purple-500' },
};

const Insights = () => {
  const { transactions, getSummary, getInsights } = useFinance();
  const { user } = useUser();

  const summary = getSummary();
  const insights = getInsights();

  // Memoize data for AI insights to prevent unnecessary re-renders
  const aiData = useMemo(() => ({
    transactions,
    summary,
    userName: user?.name,
  }), [transactions, summary, user?.name]);

  // AI-powered insights using Gemma model via Bytez
  const { loading: aiLoading, error: aiError, insight: aiInsight, refetch: refetchAI } = useAIInsights(aiData);

  // Behaviour analysis
  const behaviourDescriptions = {
    planned: {
      title: 'Planned Spender',
      description: 'You think before you spend. Most of your purchases are intentional and well-considered.',
      icon: Target,
      color: 'text-green-600',
      tip: 'Keep up the great work! Consider setting even higher savings goals.',
    },
    impulsive: {
      title: 'Impulsive Spender',
      description: 'You tend to make quick purchasing decisions without much planning.',
      icon: Zap,
      color: 'text-orange-500',
      tip: 'Try the 24-hour rule: wait a day before making non-essential purchases.',
    },
    'frequent-small': {
      title: 'Frequent Small Spender',
      description: 'You make many small purchases that add up over time.',
      icon: TrendingUp,
      color: 'text-blue-500',
      tip: 'Track those small daily expenses - they might be your biggest money leak!',
    },
  };

  const behaviour = behaviourDescriptions[summary.behaviourType];
  const BehaviourIcon = behaviour.icon;

  // Emotion-based patterns
  const emotionStats: Record<string, { count: number; total: number }> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    if (t.emotionTag) {
      if (!emotionStats[t.emotionTag]) {
        emotionStats[t.emotionTag] = { count: 0, total: 0 };
      }
      emotionStats[t.emotionTag].count++;
      emotionStats[t.emotionTag].total += t.amount;
    }
  });

  const emotionLabels: Record<string, { label: string; icon: typeof Heart; color: string }> = {
    need: { label: 'Essential Needs', icon: Target, color: 'text-green-600' },
    impulse: { label: 'Impulse Buys', icon: Zap, color: 'text-orange-500' },
    stress: { label: 'Stress Spending', icon: AlertTriangle, color: 'text-red-500' },
    celebration: { label: 'Celebrations', icon: Sparkles, color: 'text-purple-500' },
  };

  // Chart configs
  const categoryChartConfig = {
    food: { label: 'Food', color: CATEGORY_COLORS.food },
    travel: { label: 'Travel', color: CATEGORY_COLORS.travel },
    shopping: { label: 'Shopping', color: CATEGORY_COLORS.shopping },
    entertainment: { label: 'Entertainment', color: CATEGORY_COLORS.entertainment },
    others: { label: 'Others', color: CATEGORY_COLORS.others },
  };

  const incomeExpenseConfig = {
    income: { label: 'Income', color: 'hsl(var(--chart-1))' },
    expenses: { label: 'Expenses', color: 'hsl(var(--chart-2))' },
    balance: { label: 'Balance', color: 'hsl(var(--chart-3))' },
  };

  // Top spending category
  const topCategory = Object.entries(summary.categoryBreakdown)
    .sort(([, a], [, b]) => b - a)[0];

  // Spending frequency
  const spendingFrequencyLabels = {
    rarely: 'You spend sparingly - great discipline!',
    sometimes: 'You have moderate spending habits.',
    often: 'You spend frequently. Consider consolidating purchases.',
    always: 'You spend very frequently. This might lead to overspending.',
  };

  // Chart data for category breakdown (Pie Chart)
  const categoryChartData = useMemo(() => {
    return Object.entries(summary.categoryBreakdown)
      .filter(([, amount]) => amount > 0)
      .map(([category, amount]) => ({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: amount,
        fill: CATEGORY_COLORS[category] || '#8884d8',
      }));
  }, [summary.categoryBreakdown]);

  // Chart data for income vs expense (Bar Chart)
  const incomeExpenseData = useMemo(() => [
    { name: 'Income', amount: summary.totalIncome, fill: 'hsl(var(--chart-1))' },
    { name: 'Expenses', amount: summary.totalExpenses, fill: 'hsl(var(--chart-2))' },
    { name: 'Balance', amount: Math.max(0, summary.balance), fill: 'hsl(var(--chart-3))' },
  ], [summary]);

  // Chart data for emotion-based spending
  const emotionChartData = useMemo(() => {
    return Object.entries(emotionStats)
      .filter(([, stats]) => stats.total > 0)
      .map(([emotion, stats]) => ({
        name: EMOTION_LABELS[emotion]?.label || emotion,
        amount: stats.total,
        count: stats.count,
        fill: EMOTION_COLORS[emotion] || '#8884d8',
      }));
  }, [emotionStats]);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-7 w-7 text-primary" />
            Insights
          </h1>
          <p className="text-muted-foreground text-sm">
            Understand your spending patterns and behaviours
          </p>
        </div>

        {/* Behaviour Type Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl bg-background flex items-center justify-center ${behaviour.color}`}>
                <BehaviourIcon className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl">{behaviour.title}</CardTitle>
                <CardDescription className="mt-1">{behaviour.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-background/80 rounded-lg p-4">
              <p className="text-sm flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>Tip:</strong> {behaviour.tip}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary">{formatINR(summary.totalExpenses)}</div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">{formatINR(summary.balance)}</div>
              <p className="text-sm text-muted-foreground">Balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Income vs Expenses Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Income vs Expenses
            </CardTitle>
            <CardDescription>Overview of your financial flow</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={incomeExpenseConfig} className="h-[200px] w-full">
              <BarChart data={incomeExpenseData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatINR(value as number)}
                    />
                  }
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {incomeExpenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown Pie Chart */}
        {categoryChartData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Spending by Category
              </CardTitle>
              <CardDescription>Where your money goes</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={categoryChartConfig} className="h-[250px] w-full">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatINR(value as number)}
                      />
                    }
                  />
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Emotion-Based Spending Chart */}
        {emotionChartData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Emotion-Driven Spending
              </CardTitle>
              <CardDescription>How emotions affect your wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={categoryChartConfig} className="h-[200px] w-full">
                <BarChart data={emotionChartData} margin={{ left: 10, right: 30 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(value) => `₹${value}`} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, item) => (
                          <span>
                            {formatINR(value as number)}
                            <span className="text-muted-foreground ml-2">({item.payload.count} txns)</span>
                          </span>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {emotionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Spending Category */}
        {topCategory && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Top Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold capitalize">{topCategory[0]}</p>
                  <p className="text-muted-foreground text-sm">
                    {Math.round((topCategory[1] / summary.totalExpenses) * 100)}% of your total spending
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-destructive">{formatINR(topCategory[1])}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emotion-Based Spending */}
        {Object.keys(emotionStats).length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Emotion-Based Patterns
              </CardTitle>
              <CardDescription>How your emotions influence spending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(emotionStats)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([emotion, stats]) => {
                  const emotionInfo = emotionLabels[emotion];
                  if (!emotionInfo) return null;
                  const EmotionIcon = emotionInfo.icon;
                  
                  return (
                    <div key={emotion} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <EmotionIcon className={`h-5 w-5 ${emotionInfo.color}`} />
                        <div>
                          <p className="font-medium">{emotionInfo.label}</p>
                          <p className="text-xs text-muted-foreground">{stats.count} transactions</p>
                        </div>
                      </div>
                      <span className="font-bold">{formatINR(stats.total)}</span>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}

        {/* Spending Habits */}
        {user && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Spending Habits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1">Spending Frequency</p>
                <p className="text-sm text-muted-foreground">
                  {spendingFrequencyLabels[user.spendingFrequency]}
                </p>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-medium mb-1">Planning Habit</p>
                <p className="text-sm text-muted-foreground">
                  {user.plansBeforeSpending 
                    ? '✅ You usually plan before spending - this helps avoid impulse purchases!'
                    : '⚠️ You tend to spend without planning. Try creating a shopping list before going out.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Generated Insights */}
        {insights.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Personalized Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{insight.icon}</span>
                    <p className="font-medium">{insight.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* AI-Powered Insights Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI Financial Coach
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={refetchAI}
                disabled={aiLoading}
                className="h-8 px-2"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription>
              Personalized advice powered by AI based on your spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aiLoading && !aiInsight ? (
              <div className="flex items-center justify-center py-8 gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Analyzing your finances...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {aiError && (
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 mb-2">
                    Using offline insights (API unavailable)
                  </div>
                )}
                <div className="bg-background/80 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {aiInsight || 'Add some transactions to get AI-powered insights!'}
                  </p>
                </div>
                {aiLoading && aiInsight && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Refreshing insights...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flagged Transactions Summary */}
        {transactions.filter(t => t.emotionTag === 'impulse' || t.emotionTag === 'stress').length > 0 && (
          <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                Flagged Spending
              </CardTitle>
              <CardDescription>
                Transactions tagged as impulse or stress-driven
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {transactions
                .filter(t => t.emotionTag === 'impulse' || t.emotionTag === 'stress')
                .slice(0, 5)
                .map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      {t.emotionTag === 'impulse' ? (
                        <Zap className="h-4 w-4 text-orange-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span>{t.description || t.category || 'Expense'}</span>
                      <span className="text-xs text-muted-foreground capitalize">({t.emotionTag})</span>
                    </div>
                    <span className="font-medium text-destructive">{formatINR(t.amount)}</span>
                  </div>
                ))}
              {transactions.filter(t => t.emotionTag === 'impulse' || t.emotionTag === 'stress').length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{transactions.filter(t => t.emotionTag === 'impulse' || t.emotionTag === 'stress').length - 5} more flagged transactions
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Savings Tips */}
        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-700">💡 Saving Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Set a weekly "no-spend" day to reduce unnecessary expenses.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Track every expense, no matter how small.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Use the 50/30/20 rule: Needs / Wants / Savings.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Before buying, ask: "Do I need this or just want it?"</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Insights;
