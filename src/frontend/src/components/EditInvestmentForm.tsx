import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetInvestments, useUpdateInvestment } from '../hooks/useQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { InvestmentCategory } from '../backend';
import type { Investment } from '../backend';

const categories = [
  { value: InvestmentCategory.liquidityHoldings, label: 'Liquidity Holdings' },
  { value: InvestmentCategory.mutualFunds, label: 'Mutual Funds' },
  { value: InvestmentCategory.stocks, label: 'Shares/Stocks' },
  { value: InvestmentCategory.bonds, label: 'Bonds' },
  { value: InvestmentCategory.fixedDepositsNationalized, label: 'Nationalized Fixed Deposits' },
  { value: InvestmentCategory.fixedDepositsCorporate, label: 'Corporate Fixed Deposits' },
  { value: InvestmentCategory.cryptocurrency, label: 'Cryptocurrency' },
  { value: InvestmentCategory.pensionPrivate, label: 'Private Pension Schemes' },
  { value: InvestmentCategory.nationalPensionSystem, label: 'National Pension System (NPS)' },
  { value: InvestmentCategory.insuranceHealth, label: 'Health Insurance' },
  { value: InvestmentCategory.insuranceWealth, label: 'Wealth Insurance' },
  { value: InvestmentCategory.insuranceAsset, label: 'Asset Insurance' },
  { value: InvestmentCategory.unitLinkedInsurancePlans, label: 'Unit Linked Insurance Plans (ULIP)' },
  { value: InvestmentCategory.chits, label: 'Chits' },
  { value: InvestmentCategory.sebiRegisteredCompanies, label: 'SEBI Registered Companies' },
  { value: InvestmentCategory.nationalSavings, label: 'National Savings' },
  { value: InvestmentCategory.debtFunds, label: 'Debt Funds' },
  { value: InvestmentCategory.seniorCitizenSavingsScheme, label: 'Senior Citizen Savings Scheme (SCSS)' },
  { value: InvestmentCategory.realEstateInvestmentTrusts, label: 'Real Estate Investment Trusts (REITs)' },
  { value: InvestmentCategory.sovereignGoldBonds, label: 'Sovereign Gold Bonds (SGB)' },
  { value: InvestmentCategory.publicProvidentFund, label: 'Public Provident Fund (PPF)' },
  { value: InvestmentCategory.equity, label: 'Equity' },
  { value: InvestmentCategory.silverBonds, label: 'Silver Bonds' },
  { value: InvestmentCategory.postOfficeSchemes, label: 'Post Office Schemes' },
  { value: InvestmentCategory.other, label: 'Other' },
];

export default function EditInvestmentForm() {
  const navigate = useNavigate();
  const { index } = useParams({ from: '/authenticated/investments/edit/$index' });
  const { data: investments, isLoading } = useGetInvestments();
  const { mutate: updateInvestment, isPending } = useUpdateInvestment();

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amountInvested: '',
    currentValue: '',
    dateOfInvestment: '',
    notes: '',
    isSEBIRegistered: false,
    folioNumber: '',
  });

  useEffect(() => {
    if (investments && index) {
      const investmentIndex = parseInt(index);
      const investment = investments[investmentIndex];
      if (investment) {
        const date = new Date(Number(investment.dateOfInvestment) / 1000000);
        setFormData({
          name: investment.name,
          category: investment.category,
          amountInvested: investment.amountInvested.toString(),
          currentValue: investment.currentValue.toString(),
          dateOfInvestment: date.toISOString().split('T')[0],
          notes: investment.notes || '',
          isSEBIRegistered: investment.isSEBIRegistered,
          folioNumber: investment.folioNumber || '',
        });
      }
    }
  }, [investments, index]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const investment: Investment = {
      name: formData.name,
      category: formData.category as InvestmentCategory,
      amountInvested: parseFloat(formData.amountInvested),
      currentValue: parseFloat(formData.currentValue),
      dateOfInvestment: BigInt(new Date(formData.dateOfInvestment).getTime() * 1000000),
      notes: formData.notes || undefined,
      isSEBIRegistered: formData.isSEBIRegistered,
      folioNumber: formData.folioNumber.trim() || undefined,
    };

    updateInvestment(
      { index: parseInt(index), investment },
      {
        onSuccess: () => {
          navigate({ to: '/dashboard' });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button
        variant="ghost"
        className="mb-6 gap-2"
        onClick={() => navigate({ to: '/dashboard' })}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Investment</CardTitle>
          <CardDescription>Update the details of your investment.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Investment Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., HDFC Equity Fund"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folioNumber">Folio Number</Label>
              <Input
                id="folioNumber"
                value={formData.folioNumber}
                onChange={(e) => setFormData({ ...formData, folioNumber: e.target.value })}
                placeholder="Enter folio number (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select investment category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amountInvested">Amount Invested (₹) *</Label>
                <Input
                  id="amountInvested"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amountInvested}
                  onChange={(e) => setFormData({ ...formData, amountInvested: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentValue">Current Value (₹) *</Label>
                <Input
                  id="currentValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfInvestment">Date of Investment *</Label>
              <Input
                id="dateOfInvestment"
                type="date"
                value={formData.dateOfInvestment}
                onChange={(e) => setFormData({ ...formData, dateOfInvestment: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isSEBIRegistered"
                checked={formData.isSEBIRegistered}
                onCheckedChange={(checked) => setFormData({ ...formData, isSEBIRegistered: checked === true })}
              />
              <Label htmlFor="isSEBIRegistered" className="text-sm font-normal cursor-pointer">
                SEBI Registered
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes about this investment..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/dashboard' })}
                disabled={isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Investment'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
