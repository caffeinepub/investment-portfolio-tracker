import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import { formatINR } from '../utils/currency';

interface PortfolioSummaryProps {
  summary?: {
    totalInvested: number;
    totalCurrentValue: number;
  };
}

export default function PortfolioSummary({ summary }: PortfolioSummaryProps) {
  if (!summary) return null;

  const { totalInvested, totalCurrentValue } = summary;
  const gainLoss = totalCurrentValue - totalInvested;
  const gainLossPercentage = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;
  const isPositive = gainLoss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-border/40 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatINR(totalInvested)}</div>
          <p className="text-xs text-muted-foreground mt-1">Principal amount</p>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-gradient-to-br from-card to-card/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Current Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatINR(totalCurrentValue)}</div>
          <p className="text-xs text-muted-foreground mt-1">Market value</p>
        </CardContent>
      </Card>

      <Card className={`border-border/40 ${isPositive ? 'bg-gradient-to-br from-emerald-50 to-card dark:from-emerald-950/20 dark:to-card' : 'bg-gradient-to-br from-red-50 to-card dark:from-red-950/20 dark:to-card'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Gain/Loss</CardTitle>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
            {formatINR(Math.abs(gainLoss))}
          </div>
          <p className={`text-xs mt-1 font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
            {isPositive ? '+' : '-'}{Math.abs(gainLossPercentage).toFixed(2)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
