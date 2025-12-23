import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, User, Wallet, Brain, Target, Calendar, Plus, X, GraduationCap, Briefcase } from 'lucide-react';
import { OnboardingData, RoutineExpense, UserRole } from '@/types/user';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';

const TOTAL_STEPS = 5;

const initialData: OnboardingData = {
  name: '',
  age: 18,
  role: 'studying',
  hasIncome: false,
  monthlyAllowance: 0,
  salary: 0,
  sideIncome: 0,
  spendingFrequency: 'sometimes',
  plansBeforeSpending: false,
  topSpendingCategory: 'food',
  dailyLimit: 100,
  weeklyLimit: 500,
  monthlyLimit: 2000,
  routineExpenses: [],
};

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { completeOnboarding } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [newRoutineExpense, setNewRoutineExpense] = useState({ name: '', amount: '' });

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const updateData = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding and save to context
      completeOnboarding(data);
      toast({
        title: 'Welcome to PocketKash!',
        description: 'Your profile is set up. Start tracking your expenses!',
      });
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const addRoutineExpense = () => {
    if (newRoutineExpense.name && newRoutineExpense.amount) {
      const expense: RoutineExpense = {
        id: Date.now().toString(),
        name: newRoutineExpense.name,
        amount: parseFloat(newRoutineExpense.amount),
        category: 'routine',
      };
      updateData('routineExpenses', [...data.routineExpenses, expense]);
      setNewRoutineExpense({ name: '', amount: '' });
    }
  };

  const removeRoutineExpense = (id: string) => {
    updateData('routineExpenses', data.routineExpenses.filter(e => e.id !== id));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return data.name.trim().length > 0 && data.age >= 13 && data.age <= 100;
      case 2:
        return true; // Income is optional
      case 3:
        return true; // All have defaults
      case 4:
        return data.dailyLimit > 0;
      case 5:
        return true; // Routine expenses are optional
      default:
        return true;
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 1: return User;
      case 2: return Wallet;
      case 3: return Brain;
      case 4: return Target;
      case 5: return Calendar;
      default: return User;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Basic Details';
      case 2: return 'Income Details';
      case 3: return 'Spending Behaviour';
      case 4: return 'Set Your Limits';
      case 5: return 'Routine Expenses';
      default: return '';
    }
  };

  const StepIcon = getStepIcon();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/20 p-4">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />

      <Card className="w-full max-w-lg relative z-10 border-border shadow-xl">
        <CardHeader>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of {TOTAL_STEPS}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <StepIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{getStepTitle()}</CardTitle>
              <CardDescription>
                {currentStep === 1 && 'Tell us about yourself'}
                {currentStep === 2 && 'What are your income sources?'}
                {currentStep === 3 && 'Help us understand your habits'}
                {currentStep === 4 && 'Set spending boundaries'}
                {currentStep === 5 && 'Add your daily regular expenses'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={data.name}
                      onChange={(e) => updateData('name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min={13}
                      max={100}
                      value={data.age}
                      onChange={(e) => updateData('age', parseInt(e.target.value) || 18)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>What best describes you?</Label>
                    <RadioGroup
                      value={data.role}
                      onValueChange={(value) => updateData('role', value as UserRole)}
                      className="grid grid-cols-3 gap-3"
                    >
                      <Label
                        htmlFor="studying"
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${
                          data.role === 'studying' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="studying" id="studying" className="sr-only" />
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium">Studying</span>
                      </Label>
                      <Label
                        htmlFor="working"
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${
                          data.role === 'working' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="working" id="working" className="sr-only" />
                        <Briefcase className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium">Working</span>
                      </Label>
                      <Label
                        htmlFor="both"
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${
                          data.role === 'both' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="both" id="both" className="sr-only" />
                        <div className="flex">
                          <GraduationCap className="h-5 w-5 text-primary -mr-1" />
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Both</span>
                      </Label>
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Step 2: Income Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Do you have any income?</Label>
                    <RadioGroup
                      value={data.hasIncome ? 'yes' : 'no'}
                      onValueChange={(value) => updateData('hasIncome', value === 'yes')}
                      className="flex gap-4"
                    >
                      <Label
                        htmlFor="income-yes"
                        className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${
                          data.hasIncome ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="yes" id="income-yes" className="sr-only" />
                        <span className="font-medium">Yes</span>
                      </Label>
                      <Label
                        htmlFor="income-no"
                        className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${
                          !data.hasIncome ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="no" id="income-no" className="sr-only" />
                        <span className="font-medium">No</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  {data.hasIncome && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="allowance">Monthly Allowance (₹)</Label>
                        <Input
                          id="allowance"
                          type="number"
                          min={0}
                          placeholder="0"
                          value={data.monthlyAllowance || ''}
                          onChange={(e) => updateData('monthlyAllowance', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salary">Salary (₹)</Label>
                        <Input
                          id="salary"
                          type="number"
                          min={0}
                          placeholder="0"
                          value={data.salary || ''}
                          onChange={(e) => updateData('salary', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sideIncome">Side Income (₹)</Label>
                        <Input
                          id="sideIncome"
                          type="number"
                          min={0}
                          placeholder="0"
                          value={data.sideIncome || ''}
                          onChange={(e) => updateData('sideIncome', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Spending Behaviour */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>How often do you spend daily?</Label>
                    <RadioGroup
                      value={data.spendingFrequency}
                      onValueChange={(value) => updateData('spendingFrequency', value as OnboardingData['spendingFrequency'])}
                      className="grid grid-cols-2 gap-3"
                    >
                      {['rarely', 'sometimes', 'often', 'always'].map((freq) => (
                        <Label
                          key={freq}
                          htmlFor={`freq-${freq}`}
                          className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                            data.spendingFrequency === freq ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={freq} id={`freq-${freq}`} className="sr-only" />
                          <span className="font-medium capitalize">{freq}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Do you plan before spending?</Label>
                    <RadioGroup
                      value={data.plansBeforeSpending ? 'yes' : 'no'}
                      onValueChange={(value) => updateData('plansBeforeSpending', value === 'yes')}
                      className="flex gap-4"
                    >
                      <Label
                        htmlFor="plan-yes"
                        className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                          data.plansBeforeSpending ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="yes" id="plan-yes" className="sr-only" />
                        <span className="font-medium">Yes, usually</span>
                      </Label>
                      <Label
                        htmlFor="plan-no"
                        className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                          !data.plansBeforeSpending ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value="no" id="plan-no" className="sr-only" />
                        <span className="font-medium">Not really</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>What do you spend most on?</Label>
                    <RadioGroup
                      value={data.topSpendingCategory}
                      onValueChange={(value) => updateData('topSpendingCategory', value)}
                      className="grid grid-cols-2 gap-3"
                    >
                      {['food', 'travel', 'shopping', 'entertainment', 'others'].map((cat) => (
                        <Label
                          key={cat}
                          htmlFor={`cat-${cat}`}
                          className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${
                            data.topSpendingCategory === cat ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <RadioGroupItem value={cat} id={`cat-${cat}`} className="sr-only" />
                          <span className="font-medium capitalize">{cat}</span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              )}

              {/* Step 4: Limits Setup */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dailyLimit">Daily Spending Limit (₹) *</Label>
                    <Input
                      id="dailyLimit"
                      type="text"
                      inputMode="numeric"
                      placeholder="e.g. 200"
                      value={data.dailyLimit === 0 ? '' : String(data.dailyLimit)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*$/.test(val)) {
                          updateData('dailyLimit', val === '' ? 0 : parseInt(val, 10));
                        }
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (isNaN(val) || val < 0) {
                          updateData('dailyLimit', 0);
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">This is the maximum you want to spend each day</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weeklyLimit">Weekly Limit (₹) - Optional</Label>
                    <Input
                      id="weeklyLimit"
                      type="text"
                      inputMode="numeric"
                      placeholder="Leave empty for no limit"
                      value={data.weeklyLimit === 0 ? '' : String(data.weeklyLimit)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*$/.test(val)) {
                          updateData('weeklyLimit', val === '' ? 0 : parseInt(val, 10));
                        }
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (isNaN(val) || val < 0) {
                          updateData('weeklyLimit', 0);
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyLimit">Monthly Limit (₹) - Optional</Label>
                    <Input
                      id="monthlyLimit"
                      type="text"
                      inputMode="numeric"
                      placeholder="Leave empty for no limit"
                      value={data.monthlyLimit === 0 ? '' : String(data.monthlyLimit)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || /^\d*$/.test(val)) {
                          updateData('monthlyLimit', val === '' ? 0 : parseInt(val, 10));
                        }
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (isNaN(val) || val < 0) {
                          updateData('monthlyLimit', 0);
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Routine Expenses */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Add daily expenses you have regularly (bus fare, tea/coffee, etc.). 
                    This helps us alert you smartly.
                  </p>

                  {/* Add new routine expense */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Expense name"
                      value={newRoutineExpense.name}
                      onChange={(e) => setNewRoutineExpense(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="₹"
                      value={newRoutineExpense.amount}
                      onChange={(e) => setNewRoutineExpense(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-24"
                    />
                    <Button type="button" size="icon" onClick={addRoutineExpense} disabled={!newRoutineExpense.name || !newRoutineExpense.amount}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* List of routine expenses */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {data.routineExpenses.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4 text-sm">
                        No routine expenses added yet. You can skip this step.
                      </p>
                    ) : (
                      data.routineExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                          <span className="font-medium">{expense.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-primary font-semibold">₹{expense.amount}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeRoutineExpense(expense.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Common suggestions */}
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Bus ticket', amount: 10 },
                        { name: 'Tea/Coffee', amount: 10 },
                        { name: 'Lunch', amount: 50 },
                        { name: 'Snacks', amount: 20 },
                      ].map((item) => (
                        <Button
                          key={item.name}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => {
                            const expense: RoutineExpense = {
                              id: Date.now().toString(),
                              name: item.name,
                              amount: item.amount,
                              category: 'routine',
                            };
                            updateData('routineExpenses', [...data.routineExpenses, expense]);
                          }}
                        >
                          {item.name} - ₹{item.amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {currentStep === TOTAL_STEPS ? 'Complete Setup' : 'Continue'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
