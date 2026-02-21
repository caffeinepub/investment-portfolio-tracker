import { useGetInvestments, useGetTotalInvestmentSummary, useGetCallerUserProfile, useFetchSoaHoldings } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Plus, Users, Loader2, Download, Database } from 'lucide-react';
import InvestmentCard from '../components/InvestmentCard';
import PortfolioSummary from '../components/PortfolioSummary';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: investments, isLoading: investmentsLoading } = useGetInvestments();
  const { data: summary, isLoading: summaryLoading } = useGetTotalInvestmentSummary();
  const { data: userProfile } = useGetCallerUserProfile();
  const { mutate: fetchSoaHoldings, isPending: isFetchingSoa } = useFetchSoaHoldings();

  const isLoading = investmentsLoading || summaryLoading;
  const hasAadhaarAndPan = userProfile?.aadhaarNumber && userProfile?.panNumber;

  const handleFetchSoaHoldings = () => {
    fetchSoaHoldings(undefined, {
      onSuccess: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.holdings && parsed.holdings.length > 0) {
            toast.success(`Fetched ${parsed.holdings.length} SoA holdings successfully`);
          } else {
            toast.info('No SoA holdings found');
          }
        } catch {
          toast.success('SoA holdings fetch initiated');
        }
      },
      onError: () => {
        toast.error('Failed to fetch SoA holdings');
      },
    });
  };

  const handleFetchDematHoldings = () => {
    toast.info('Demat holdings fetch feature coming soon');
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-5"
        style={{ backgroundImage: 'url(/assets/generated/hero-bg.dim_1920x1080.png)' }}
      />
      <div className="relative container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Investment Portfolio</h1>
            <p className="text-muted-foreground mt-1">Track and manage your financial assets</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate({ to: '/nominee' })}
              variant="outline"
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Nominee
            </Button>
            <Button
              onClick={() => navigate({ to: '/investments/add' })}
              className="gap-2 bg-emerald-700 hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Add Investment
            </Button>
          </div>
        </div>

        {hasAadhaarAndPan && (
          <div className="flex flex-wrap gap-3 p-4 bg-card/50 rounded-lg border border-border/40">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>Fetch Holdings:</span>
            </div>
            <Button
              onClick={handleFetchSoaHoldings}
              disabled={isFetchingSoa}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {isFetchingSoa ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              SoA Holdings
            </Button>
            <Button
              onClick={handleFetchDematHoldings}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Demat Holdings
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          </div>
        ) : (
          <>
            <PortfolioSummary summary={summary} />

            {investments && investments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investments.map((investment, index) => (
                  <InvestmentCard key={index} investment={investment} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card/50 rounded-lg border border-border/40">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                    <Plus className="h-8 w-8 text-emerald-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">No investments yet</h3>
                  <p className="text-muted-foreground">
                    {hasAadhaarAndPan 
                      ? 'Start by fetching your holdings from DigiLocker or add investments manually.'
                      : 'Start building your portfolio by adding your first investment.'}
                  </p>
                  <Button
                    onClick={() => navigate({ to: '/investments/add' })}
                    className="mt-4 bg-emerald-700 hover:bg-emerald-800"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Investment
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
