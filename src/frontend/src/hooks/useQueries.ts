import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Investment, Nominee, UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// DigiLocker Integration
export function useFetchAadhaarDetails() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.fetchAadhaarDetails();
    },
  });
}

export function useFetchPanDetails() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.fetchPanDetails();
    },
  });
}

export function useFetchSoaHoldings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.fetchSoaHoldings();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments', identity?.getPrincipal().toString()] });
      queryClient.invalidateQueries({ queryKey: ['investmentSummary', identity?.getPrincipal().toString()] });
    },
  });
}

// Investment Queries
export function useGetInvestments() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Investment[]>({
    queryKey: ['investments', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getInvestments(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetTotalInvestmentSummary() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<{ totalInvested: number; totalCurrentValue: number }>({
    queryKey: ['investmentSummary', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return { totalInvested: 0, totalCurrentValue: 0 };
      return actor.getTotalInvestmentSummary(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useAddInvestment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (investment: Investment) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addInvestment(investment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments', identity?.getPrincipal().toString()] });
      queryClient.invalidateQueries({ queryKey: ['investmentSummary', identity?.getPrincipal().toString()] });
    },
  });
}

export function useUpdateInvestment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async ({ index, investment }: { index: number; investment: Investment }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateInvestment(BigInt(index), investment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments', identity?.getPrincipal().toString()] });
      queryClient.invalidateQueries({ queryKey: ['investmentSummary', identity?.getPrincipal().toString()] });
    },
  });
}

export function useDeleteInvestment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (index: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteInvestment(BigInt(index));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments', identity?.getPrincipal().toString()] });
      queryClient.invalidateQueries({ queryKey: ['investmentSummary', identity?.getPrincipal().toString()] });
    },
  });
}

// Nominee Queries
export function useGetCallerNominee() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Nominee | null>({
    queryKey: ['currentNominee'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerNominee();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddNominee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nominee: Nominee) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addNominee(nominee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentNominee'] });
    },
  });
}

export function useUpdateNominee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nominee: Nominee) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNominee(nominee);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentNominee'] });
    },
  });
}

export function useRemoveNominee() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeNominee();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentNominee'] });
    },
  });
}
