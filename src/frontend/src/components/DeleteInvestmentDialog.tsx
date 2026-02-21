import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { useDeleteInvestment } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';

interface DeleteInvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investmentName: string;
  index: number;
}

export default function DeleteInvestmentDialog({
  open,
  onOpenChange,
  investmentName,
  index,
}: DeleteInvestmentDialogProps) {
  const { mutate: deleteInvestment, isPending } = useDeleteInvestment();

  const handleDelete = () => {
    deleteInvestment(index, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Investment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{investmentName}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
