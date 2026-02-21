import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useFetchSoaHoldings } from './hooks/useQueries';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Textarea } from './components/ui/textarea';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import AddInvestmentForm from './components/AddInvestmentForm';
import EditInvestmentForm from './components/EditInvestmentForm';
import NomineeManagement from './pages/NomineeManagement';
import { Loader2, CreditCard } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

function Header() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
            <span className="text-white font-bold text-xl">₹</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Investment Portfolio Tracker</h1>
            <p className="text-xs text-muted-foreground">Secure wealth management</p>
          </div>
        </div>
        <Button
          onClick={handleAuth}
          disabled={disabled}
          variant={isAuthenticated ? 'outline' : 'default'}
          className={isAuthenticated ? '' : 'bg-emerald-700 hover:bg-emerald-800'}
        >
          {disabled ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : isAuthenticated ? (
            'Logout'
          ) : (
            'Login'
          )}
        </Button>
      </div>
    </header>
  );
}

function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = encodeURIComponent(window.location.hostname || 'investment-tracker');

  return (
    <footer className="border-t border-border/40 bg-card/30 mt-auto">
      <div className="container mx-auto px-4 py-6 text-center space-y-2">
        <p className="text-xs text-muted-foreground/80">
          Designed for Indian citizens • All amounts in Indian Rupees (₹)
        </p>
        <p className="text-sm text-muted-foreground">
          © {currentYear} Investment Portfolio Tracker. Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}

function Sidebar() {
  const [showAadhaarInput, setShowAadhaarInput] = useState(false);
  const [showPanInput, setShowPanInput] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarError, setAadhaarError] = useState('');
  const [panError, setPanError] = useState('');
  const { data: userProfile } = useGetCallerUserProfile();
  const { mutate: saveProfile } = useSaveCallerUserProfile();
  const { mutate: fetchSoaHoldings, isPending: isFetchingHoldings } = useFetchSoaHoldings();

  // Load existing values from profile
  useEffect(() => {
    if (userProfile) {
      if (userProfile.aadhaarNumber) {
        setAadhaarNumber(userProfile.aadhaarNumber);
      }
      if (userProfile.panNumber) {
        setPanNumber(userProfile.panNumber);
      }
    }
  }, [userProfile]);

  const validateAadhaar = (value: string): boolean => {
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length === 0) {
      setAadhaarError('');
      return false;
    }
    if (!/^\d{12}$/.test(cleaned)) {
      setAadhaarError('Aadhaar must be exactly 12 digits');
      return false;
    }
    setAadhaarError('');
    return true;
  };

  const validatePan = (value: string): boolean => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    if (cleaned.length === 0) {
      setPanError('');
      return false;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleaned)) {
      setPanError('PAN must be in format: AAAAA9999A');
      return false;
    }
    setPanError('');
    return true;
  };

  const handleAadhaarChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 12);
    setAadhaarNumber(cleaned);
    validateAadhaar(cleaned);
  };

  const handlePanChange = (value: string) => {
    const cleaned = value.replace(/\s/g, '').toUpperCase().slice(0, 10);
    setPanNumber(cleaned);
    validatePan(cleaned);
  };

  const isAadhaarValid = validateAadhaar(aadhaarNumber);
  const isPanValid = validatePan(panNumber);
  const canFetch = isAadhaarValid && isPanValid;

  // Auto-fetch when both are valid
  useEffect(() => {
    if (canFetch && userProfile) {
      const profileAadhaar = userProfile.aadhaarNumber || '';
      const profilePan = userProfile.panNumber || '';
      
      // Only auto-fetch if values have changed
      if (aadhaarNumber !== profileAadhaar || panNumber !== profilePan) {
        // Save profile first
        saveProfile(
          {
            ...userProfile,
            aadhaarNumber: aadhaarNumber,
            panNumber: panNumber,
          },
          {
            onSuccess: () => {
              toast.info('Fetching your investment holdings...');
              fetchSoaHoldings(undefined, {
                onSuccess: (data) => {
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.holdings && parsed.holdings.length > 0) {
                      toast.success(`Successfully fetched ${parsed.holdings.length} investment holdings`);
                    } else {
                      toast.info('Holdings fetch completed. No new holdings found.');
                    }
                  } catch {
                    toast.success('Holdings fetch completed');
                  }
                },
                onError: () => {
                  toast.error('Failed to fetch holdings. Please try again.');
                },
              });
            },
          }
        );
      }
    }
  }, [canFetch, aadhaarNumber, panNumber]);

  const handleManualFetch = () => {
    if (!canFetch) return;

    if (userProfile) {
      saveProfile(
        {
          ...userProfile,
          aadhaarNumber: aadhaarNumber,
          panNumber: panNumber,
        },
        {
          onSuccess: () => {
            toast.info('Fetching your investment holdings...');
            fetchSoaHoldings(undefined, {
              onSuccess: (data) => {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.holdings && parsed.holdings.length > 0) {
                    toast.success(`Successfully fetched ${parsed.holdings.length} investment holdings`);
                  } else {
                    toast.info('Holdings fetch completed. No new holdings found.');
                  }
                } catch {
                  toast.success('Holdings fetch completed');
                }
              },
              onError: () => {
                toast.error('Failed to fetch holdings. Please try again.');
              },
            });
          },
        }
      );
    }
  };

  return (
    <aside className="w-64 border-r border-border/40 bg-card/30 p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Fetch Holdings
        </h3>

        {/* Aadhaar Section */}
        <div className="space-y-2">
          <button
            onClick={() => setShowAadhaarInput(!showAadhaarInput)}
            className="flex items-center gap-3 w-full p-3 rounded-lg bg-background hover:bg-accent transition-colors border border-border/40"
          >
            <img
              src="/assets/generated/aadhaar-icon.dim_32x32.png"
              alt="Aadhaar"
              className="w-8 h-8"
            />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">Aadhaar Card</p>
              <p className="text-xs text-muted-foreground">
                {aadhaarNumber ? `${aadhaarNumber.slice(0, 4)} ${aadhaarNumber.slice(4, 8)} ${aadhaarNumber.slice(8)}` : 'Click to enter'}
              </p>
            </div>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </button>

          {showAadhaarInput && (
            <div className="space-y-2 pl-2">
              <Label htmlFor="aadhaar-input" className="text-xs">
                Aadhaar Number (12 digits)
              </Label>
              <Input
                id="aadhaar-input"
                type="text"
                value={aadhaarNumber}
                onChange={(e) => handleAadhaarChange(e.target.value)}
                placeholder="Enter 12-digit Aadhaar"
                maxLength={12}
                className={aadhaarError ? 'border-destructive' : ''}
              />
              {aadhaarError && (
                <p className="text-xs text-destructive">{aadhaarError}</p>
              )}
              {isAadhaarValid && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ Valid Aadhaar</p>
              )}
            </div>
          )}
        </div>

        {/* PAN Section */}
        <div className="space-y-2">
          <button
            onClick={() => setShowPanInput(!showPanInput)}
            className="flex items-center gap-3 w-full p-3 rounded-lg bg-background hover:bg-accent transition-colors border border-border/40"
          >
            <img
              src="/assets/generated/pan-icon.dim_32x32.png"
              alt="PAN"
              className="w-8 h-8"
            />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">PAN Card</p>
              <p className="text-xs text-muted-foreground">
                {panNumber || 'Click to enter'}
              </p>
            </div>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </button>

          {showPanInput && (
            <div className="space-y-2 pl-2">
              <Label htmlFor="pan-input" className="text-xs">
                PAN Number (10 characters)
              </Label>
              <Input
                id="pan-input"
                type="text"
                value={panNumber}
                onChange={(e) => handlePanChange(e.target.value)}
                placeholder="AAAAA9999A"
                maxLength={10}
                className={panError ? 'border-destructive' : ''}
              />
              {panError && (
                <p className="text-xs text-destructive">{panError}</p>
              )}
              {isPanValid && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ Valid PAN</p>
              )}
            </div>
          )}
        </div>

        {/* Fetch Button */}
        {(showAadhaarInput || showPanInput) && (
          <Button
            onClick={handleManualFetch}
            disabled={!canFetch || isFetchingHoldings}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50"
          >
            {isFetchingHoldings ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              'Fetch Holdings'
            )}
          </Button>
        )}

        {canFetch && !isFetchingHoldings && (
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-800 dark:text-emerald-200">
            ✓ Ready to fetch holdings
          </div>
        )}
      </div>
    </aside>
  );
}

function LayoutWithSidebar() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  // Only show sidebar if user is authenticated and has a profile
  const showSidebar = !!identity && !!userProfile;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex">
        {showSidebar && <Sidebar />}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}

function ProfileSetupDialog({ open, onComplete }: { open: boolean; onComplete: () => void }) {
  const [permanentAddress, setPermanentAddress] = useState('');
  const [temporaryAddress, setTemporaryAddress] = useState('');
  const [contactNumbers, setContactNumbers] = useState(['', '', '', '']);
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();
  const navigate = useNavigate();

  const handleContactNumberChange = (index: number, value: string) => {
    const newContactNumbers = [...contactNumbers];
    newContactNumbers[index] = value;
    setContactNumbers(newContactNumbers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredContactNumbers = contactNumbers.filter(num => num.trim() !== '');

    saveProfile(
      { 
        permanentAddress: permanentAddress.trim(),
        temporaryAddress: temporaryAddress.trim(),
        contactNumbers: filteredContactNumbers,
        aadhaarNumber: undefined,
        panNumber: undefined,
      },
      {
        onSuccess: () => {
          onComplete();
          navigate({ to: '/dashboard' });
        },
      }
    );
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Set up your profile</DialogTitle>
          <DialogDescription>Please enter your details to get started with your investment portfolio.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <img src="/assets/generated/address-permanent-icon.dim_64x64.png" alt="Permanent Address" className="w-5 h-5" />
              <Label htmlFor="permanentAddress">Permanent Address</Label>
            </div>
            <Textarea
              id="permanentAddress"
              value={permanentAddress}
              onChange={(e) => setPermanentAddress(e.target.value)}
              placeholder="Enter your permanent address"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <img src="/assets/generated/address-temporary-icon.dim_64x64.png" alt="Temporary Address" className="w-5 h-5" />
              <Label htmlFor="temporaryAddress">Temporary Address</Label>
            </div>
            <Textarea
              id="temporaryAddress"
              value={temporaryAddress}
              onChange={(e) => setTemporaryAddress(e.target.value)}
              placeholder="Enter your temporary address (if different)"
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <Label>Contact Numbers</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contactNumbers.map((number, index) => (
                <div key={index} className="space-y-1">
                  <Label htmlFor={`contact-${index}`} className="text-xs text-muted-foreground">
                    Contact {index + 1}
                  </Label>
                  <Input
                    id={`contact-${index}`}
                    type="tel"
                    value={number}
                    onChange={(e) => handleContactNumberChange(index, e.target.value)}
                    placeholder={`+91 ${index === 0 ? '(Primary)' : ''}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 You can add your Aadhaar and PAN numbers from the sidebar after setup to fetch your investment holdings automatically.
            </p>
          </div>

          <Button type="submit" disabled={isPending} className="w-full bg-emerald-700 hover:bg-emerald-800">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AuthenticatedApp() {
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [profileSetupComplete, setProfileSetupComplete] = useState(false);

  const showProfileSetup = !profileLoading && isFetched && userProfile === null && !profileSetupComplete;

  if (profileLoading || !isFetched) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
      </div>
    );
  }

  return (
    <>
      <ProfileSetupDialog open={showProfileSetup} onComplete={() => setProfileSetupComplete(true)} />
      <Outlet />
    </>
  );
}

function LandingPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/dashboard' });
    }
  }, [identity, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)]">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: 'url(/assets/generated/hero-bg.dim_1920x1080.png)' }}
      />
      <div className="relative container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="max-w-3xl text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Secure Your Financial Legacy
          </h2>
          <p className="text-xl text-muted-foreground">
            Track your investments across multiple categories including crypto, pensions, shares, insurance, chits, and SEBI-registered companies. Ensure your loved ones have access to complete financial records when it matters most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              onClick={handleLogin}
              disabled={loginStatus === 'logging-in'}
              className="bg-emerald-700 hover:bg-emerald-800 text-lg px-8"
            >
              {loginStatus === 'logging-in' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
            {[
              { icon: '💧', label: 'Liquidity' },
              { icon: '📊', label: 'Mutual Funds' },
              { icon: '📈', label: 'Shares/Stocks' },
              { icon: '₿', label: 'Crypto' },
              { icon: '🏦', label: 'Fixed Deposits' },
              { icon: '🛡️', label: 'Insurance' },
              { icon: '💰', label: 'Chits' },
              { icon: '📜', label: 'SEBI Companies' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card/50 border border-border/40">
                <span className="text-3xl">{item.icon}</span>
                <span className="text-xs font-medium text-muted-foreground text-center">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: LayoutWithSidebar,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AuthenticatedApp,
});

const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  component: Dashboard,
});

const addInvestmentRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/investments/add',
  component: AddInvestmentForm,
});

const editInvestmentRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/investments/edit/$index',
  component: EditInvestmentForm,
});

const nomineeRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/nominee',
  component: NomineeManagement,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    addInvestmentRoute,
    editInvestmentRoute,
    nomineeRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
