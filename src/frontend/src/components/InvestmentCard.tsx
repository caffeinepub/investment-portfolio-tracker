import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { InvestmentCategory } from '../backend';
import type { Investment } from '../backend';
import { useState } from 'react';
import DeleteInvestmentDialog from './DeleteInvestmentDialog';
import { formatINR } from '../utils/currency';

interface InvestmentCardProps {
  investment: Investment;
  index: number;
}

const categoryIcons: Record<InvestmentCategory, string> = {
  [InvestmentCategory.liquidityHoldings]: '/assets/generated/icon-liquidity.dim_128x128.png',
  [InvestmentCategory.mutualFunds]: '/assets/generated/icon-mutual-funds.dim_128x128.png',
  [InvestmentCategory.stocks]: '/assets/generated/shares-icon.dim_128x128.png',
  [InvestmentCategory.bonds]: '/assets/generated/icon-bonds.dim_128x128.png',
  [InvestmentCategory.fixedDepositsNationalized]: '/assets/generated/icon-fixed-deposits.dim_128x128.png',
  [InvestmentCategory.fixedDepositsCorporate]: '/assets/generated/icon-fixed-deposits.dim_128x128.png',
  [InvestmentCategory.cryptocurrency]: '/assets/generated/crypto-icon.dim_128x128.png',
  [InvestmentCategory.pensionPrivate]: '/assets/generated/pension-icon.dim_128x128.png',
  [InvestmentCategory.nationalPensionSystem]: '/assets/generated/pension-icon.dim_128x128.png',
  [InvestmentCategory.insuranceHealth]: '/assets/generated/health-insurance-icon.dim_128x128.png',
  [InvestmentCategory.insuranceWealth]: '/assets/generated/wealth-insurance-icon.dim_128x128.png',
  [InvestmentCategory.insuranceAsset]: '/assets/generated/asset-insurance-icon.dim_128x128.png',
  [InvestmentCategory.unitLinkedInsurancePlans]: '/assets/generated/asset-insurance-icon.dim_128x128.png',
  [InvestmentCategory.chits]: '/assets/generated/chits-icon.dim_128x128.png',
  [InvestmentCategory.sebiRegisteredCompanies]: '/assets/generated/sebi-icon.dim_128x128.png',
  [InvestmentCategory.nationalSavings]: '/assets/generated/icon-liquidity.dim_128x128.png',
  [InvestmentCategory.debtFunds]: '/assets/generated/icon-bonds.dim_128x128.png',
  [InvestmentCategory.seniorCitizenSavingsScheme]: '/assets/generated/icon-liquidity.dim_128x128.png',
  [InvestmentCategory.realEstateInvestmentTrusts]: '/assets/generated/asset-insurance-icon.dim_128x128.png',
  [InvestmentCategory.sovereignGoldBonds]: '/assets/generated/icon-bonds.dim_128x128.png',
  [InvestmentCategory.publicProvidentFund]: '/assets/generated/icon-liquidity.dim_128x128.png',
  [InvestmentCategory.equity]: '/assets/generated/shares-icon.dim_128x128.png',
  [InvestmentCategory.silverBonds]: '/assets/generated/icon-bonds.dim_128x128.png',
  [InvestmentCategory.postOfficeSchemes]: '/assets/generated/icon-liquidity.dim_128x128.png',
  [InvestmentCategory.other]: '/assets/generated/icon-other.dim_128x128.png',
};

const categoryLabels: Record<InvestmentCategory, string> = {
  [InvestmentCategory.liquidityHoldings]: 'Liquidity Holdings',
  [InvestmentCategory.mutualFunds]: 'Mutual Funds',
  [InvestmentCategory.stocks]: 'Shares/Stocks',
  [InvestmentCategory.bonds]: 'Bonds',
  [InvestmentCategory.fixedDepositsNationalized]: 'Nationalized FD',
  [InvestmentCategory.fixedDepositsCorporate]: 'Corporate FD',
  [InvestmentCategory.cryptocurrency]: 'Cryptocurrency',
  [InvestmentCategory.pensionPrivate]: 'Private Pension',
  [InvestmentCategory.nationalPensionSystem]: 'NPS',
  [InvestmentCategory.insuranceHealth]: 'Health Insurance',
  [InvestmentCategory.insuranceWealth]: 'Wealth Insurance',
  [InvestmentCategory.insuranceAsset]: 'Asset Insurance',
  [InvestmentCategory.unitLinkedInsurancePlans]: 'ULIP',
  [InvestmentCategory.chits]: 'Chits',
  [InvestmentCategory.sebiRegisteredCompanies]: 'SEBI Companies',
  [InvestmentCategory.nationalSavings]: 'National Savings',
  [InvestmentCategory.debtFunds]: 'Debt Funds',
  [InvestmentCategory.seniorCitizenSavingsScheme]: 'SCSS',
  [InvestmentCategory.realEstateInvestmentTrusts]: 'REITs',
  [InvestmentCategory.sovereignGoldBonds]: 'SGB',
  [InvestmentCategory.publicProvidentFund]: 'PPF',
  [InvestmentCategory.equity]: 'Equity',
  [InvestmentCategory.silverBonds]: 'Silver Bonds',
  [InvestmentCategory.postOfficeSchemes]: 'Post Office',
  [InvestmentCategory.other]: 'Other',
};

export default function InvestmentCard({ investment, index }: InvestmentCardProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const gainLoss = investment.currentValue - investment.amountInvested;
  const gainLossPercentage = investment.amountInvested > 0 ? (gainLoss / investment.amountInvested) * 100 : 0;
  const isPositive = gainLoss >= 0;

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const categoryIcon = categoryIcons[investment.category] || categoryIcons[InvestmentCategory.other];
  const categoryLabel = categoryLabels[investment.category] || 'Other';

  return (
    <>
      <Card className="border-border/40 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img src={categoryIcon} alt={categoryLabel} className="w-10 h-10 object-contain" />
              <div>
                <CardTitle className="text-lg">{investment.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">{categoryLabel}</p>
                  {investment.isSEBIRegistered && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                      SEBI
                    </Badge>
                  )}
                </div>
                {investment.folioNumber && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5">Folio: {investment.folioNumber}</p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Invested</p>
              <p className="text-sm font-semibold text-foreground">{formatINR(investment.amountInvested)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Value</p>
              <p className="text-sm font-semibold text-foreground">{formatINR(investment.currentValue)}</p>
            </div>
          </div>

          <div className={`flex items-center gap-2 p-3 rounded-lg ${isPositive ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-semibold ${isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                {isPositive ? '+' : ''}{formatINR(gainLoss)}
              </p>
              <p className={`text-xs ${isPositive ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                {isPositive ? '+' : ''}{gainLossPercentage.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border/40">
            <p className="text-xs text-muted-foreground">Date: {formatDate(investment.dateOfInvestment)}</p>
            {investment.notes && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{investment.notes}</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => navigate({ to: '/investments/edit/$index', params: { index: index.toString() } })}
            >
              <Edit className="h-3 w-3" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteInvestmentDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        index={index}
        investmentName={investment.name}
      />
    </>
  );
}
