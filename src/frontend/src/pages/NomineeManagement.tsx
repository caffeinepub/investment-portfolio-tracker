import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerNominee, useAddNominee, useUpdateNominee, useRemoveNominee } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { ArrowLeft, Loader2, Users, Info, Trash2 } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import type { Nominee } from '../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export default function NomineeManagement() {
  const navigate = useNavigate();
  const { data: nominee, isLoading } = useGetCallerNominee();
  const { mutate: addNominee, isPending: isAdding } = useAddNominee();
  const { mutate: updateNominee, isPending: isUpdating } = useUpdateNominee();
  const { mutate: removeNominee, isPending: isRemoving } = useRemoveNominee();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactNumber1: '',
    contactNumber2: '',
    contactNumber3: '',
    nomineePrincipal: '',
  });
  const [principalError, setPrincipalError] = useState('');

  useEffect(() => {
    if (nominee) {
      const contactNumbers = nominee.contactInfo.split(',').map(c => c.trim());
      setFormData({
        name: nominee.name,
        contactNumber1: contactNumbers[0] || '',
        contactNumber2: contactNumbers[1] || '',
        contactNumber3: contactNumbers[2] || '',
        nomineePrincipal: nominee.nomineePrincipal.toString(),
      });
    }
  }, [nominee]);

  const validatePrincipal = (value: string): boolean => {
    if (!value.trim()) {
      setPrincipalError('');
      return true;
    }
    try {
      Principal.fromText(value);
      setPrincipalError('');
      return true;
    } catch {
      setPrincipalError('Invalid principal ID format');
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePrincipal(formData.nomineePrincipal)) {
      return;
    }

    const contactNumbers = [
      formData.contactNumber1,
      formData.contactNumber2,
      formData.contactNumber3,
    ].filter(num => num.trim() !== '');

    const nomineeData: Nominee = {
      name: formData.name,
      contactInfo: contactNumbers.join(', '),
      nomineePrincipal: Principal.fromText(formData.nomineePrincipal),
    };

    if (nominee) {
      updateNominee(nomineeData);
    } else {
      addNominee(nomineeData);
    }
  };

  const handleRemove = () => {
    removeNominee(undefined, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        setFormData({ name: '', contactNumber1: '', contactNumber2: '', contactNumber3: '', nomineePrincipal: '' });
      },
    });
  };

  const isPending = isAdding || isUpdating;

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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-emerald-700" />
            </div>
            <div>
              <CardTitle className="text-2xl">Nominee Management</CardTitle>
              <CardDescription>Designate someone to access your investment records</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20">
            <Info className="h-4 w-4 text-emerald-700" />
            <AlertDescription className="text-sm text-emerald-800 dark:text-emerald-300">
              Your nominee will have <strong>read-only access</strong> to view all your investment records. They cannot modify or delete any information.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nominee Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter nominee's full name"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img src="/assets/generated/contact-add-icon.dim_64x64.png" alt="Contact" className="w-5 h-5" />
                <Label>Contact Numbers</Label>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber1" className="text-xs text-muted-foreground">
                    Contact Number 1 *
                  </Label>
                  <Input
                    id="contactNumber1"
                    type="tel"
                    value={formData.contactNumber1}
                    onChange={(e) => setFormData({ ...formData, contactNumber1: e.target.value })}
                    placeholder="+91 (Primary contact)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber2" className="text-xs text-muted-foreground">
                    Contact Number 2
                  </Label>
                  <Input
                    id="contactNumber2"
                    type="tel"
                    value={formData.contactNumber2}
                    onChange={(e) => setFormData({ ...formData, contactNumber2: e.target.value })}
                    placeholder="+91 (Optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber3" className="text-xs text-muted-foreground">
                    Contact Number 3
                  </Label>
                  <Input
                    id="contactNumber3"
                    type="tel"
                    value={formData.contactNumber3}
                    onChange={(e) => setFormData({ ...formData, contactNumber3: e.target.value })}
                    placeholder="+91 (Optional)"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomineePrincipal">Nominee Principal ID *</Label>
              <Input
                id="nomineePrincipal"
                value={formData.nomineePrincipal}
                onChange={(e) => {
                  setFormData({ ...formData, nomineePrincipal: e.target.value });
                  validatePrincipal(e.target.value);
                }}
                placeholder="Enter Internet Identity principal"
                required
                className={principalError ? 'border-destructive' : ''}
              />
              {principalError && (
                <p className="text-sm text-destructive">{principalError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                The nominee's Internet Identity principal ID. They can find this after logging in.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              {nominee && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isPending || isRemoving}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Nominee
                </Button>
              )}
              <Button
                type="submit"
                disabled={isPending || !!principalError}
                className="ml-auto bg-emerald-700 hover:bg-emerald-800"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {nominee ? 'Updating...' : 'Adding...'}
                  </>
                ) : nominee ? (
                  'Update Nominee'
                ) : (
                  'Add Nominee'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Nominee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {nominee?.name} as your nominee? They will no longer have access to view your investment records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
