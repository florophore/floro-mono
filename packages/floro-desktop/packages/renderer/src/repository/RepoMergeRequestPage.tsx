import React, {useEffect, useMemo, useState} from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';
import {useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import {useParams, useSearchParams} from 'react-router-dom';
import {FetchRepositoryByNameDocument, Repository, useFetchRepositoryMergeRequestQuery, useFetchRepositoryProposedMergeRequestQuery, useMergeRequestUpdatesSubscription, useProposedMergeRequestRepositoryUpdatesSubscription, useRepositoryUpdatesSubscription} from '@floro/graphql-schemas/src/generated/main-client-graphql';
import {useSession} from '@floro/common-react/src/session/session-context';
import {useUserOrganizations} from '@floro/common-react/src/hooks/offline';
import RepoController from '@floro/common-react/src/components/repository/RepoController';
import { useApolloClient } from '@apollo/client';
import { useQueryClient } from "react-query";


const RepoCreateMergeRequestPage = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const {currentUser} = useSession();
  const ownerHandle = params?.['ownerHandle'] ?? '';
  const repoName = params?.['repoName'] ?? '';
  const mergeRequestId = params?.['mergeRequestId'] ?? '';
  const branchId = params?.['branchId'] ?? '';
  const plugin = searchParams.get('plugin');
  const idxString = searchParams.get('idx');
  const idx = useMemo(() => {
    try {
      if (!idxString) {
        return null;
      }
      const idxInt = parseInt(idxString);
      if (Number.isNaN(idxInt)) {
        return null
      }
      return idxInt;
    } catch(e) {
      return null;
    }
  }, [idxString]);
  const userOrganizations = useUserOrganizations();
  const {data, refetch, loading} = useFetchRepositoryMergeRequestQuery({
    variables: {
      ownerHandle,
      repoName,
      mergeRequestId,
      idx
    },
    fetchPolicy: 'cache-and-network'
  });

  useMergeRequestUpdatesSubscription({
    variables: {
      mergeRequestId,
      idx
    }
  });

  const [offlineRepo, setOfflineRepo] = useState<Repository|null>(null);
  const repository = useMemo(() => {
    if (data?.fetchRepositoryByName?.__typename == 'FetchRepositorySuccess') {
      return data?.fetchRepositoryByName.repository;
    }
    if (ownerHandle.toLowerCase() == currentUser?.username?.toLocaleLowerCase()) {
      const userRepo = [
        ...(currentUser?.privateRepositories ?? []),
        ...(currentUser?.publicRepositories ?? []),
      ].find(repo => repo?.name?.toLowerCase() == repoName?.toLowerCase());
      if (userRepo) {
        return userRepo;
      }
    }
    const userOrgHandles = new Set(userOrganizations?.map(org => org.handle?.toLowerCase()));
    if (userOrgHandles.has(ownerHandle.toLowerCase())) {
      const org = userOrganizations.find(
        org => org?.handle?.toLowerCase() == ownerHandle.toLowerCase(),
      );
      if (org) {
        const orgRepo = [
          ...(org?.privateRepositories ?? []),
          ...(org?.publicRepositories ?? []),
        ].find(repo => repo?.name?.toLowerCase() == repoName?.toLowerCase());
        if (orgRepo) {
          return orgRepo;
        }
      }
    }
    return offlineRepo ?? null;
  }, [data, currentUser, ownerHandle, repoName, userOrganizations, offlineRepo?.id]);

  const {data: subscriptionData } = useRepositoryUpdatesSubscription({
    variables: {
      repositoryId: repository?.id,
      branchId
    },
  });

  const queryClient = useQueryClient();
  useEffect(() => {
    if (subscriptionData?.repositoryUpdated?.id) {
      refetch();
      queryClient.invalidateQueries([
        "repo-fetch-info:" + repository.id,
        "repo-remote-settings:" + repository.id,
      ])
    }
  }, [subscriptionData])


  useEffect(() => {
    if (repository) {
      setOfflineRepo(repository);
    }
  }, [
    repository
  ]);

  const handleValue = useMemo(() => {
    if (!repository) {
      // will work on this
      return '';
    }
    if (repository.repoType == 'user_repo') {
      if (currentUser?.id == repository?.user?.id) {
        return '/home';
      }
      return `/user/@/${repository?.user?.username}`;
    }
    return `/org/@/${repository?.organization?.handle}`;
  }, [repository, currentUser]);

  const handleLabel = useMemo(() => {
    if (!repository) {
      // will work on this
      return '@' + ownerHandle;
    }
    if (repository.repoType == 'user_repo') {
      return `@${repository?.user?.username}`;
    }
    return `@${repository?.organization?.handle}`;
  }, [repository, ownerHandle]);

  const repoValue = useMemo(() => {
    if (!repository?.name) {
      return `/repo/@/${ownerHandle}/${repoName}`;
    }
    if (repository.repoType == 'user_repo') {
      return `/repo/@/${repository?.user?.username}/${repository?.name}`;
    }
    return `/repo/@/${repository?.organization?.handle}/${repository?.name}`;
  }, [repository, ownerHandle, repoName]);

  const repoLabel = useMemo(() => {
    if (!repository?.name) {
      // will work on this
      return repoName;
    }
    return repository?.name;
  }, [repository, ownerHandle, repoName]);

  const outerNavTab = useMemo(() => {
    if (repository?.repoType == 'user_repo') {
      return repository?.user?.id == currentUser?.id ? 'home' : 'org';
    }
    if (repository?.repoType == 'org_repo') {
      return 'org';
    }
    return '';
  }, [repository, currentUser]);

  const title = useLinkTitle(
    {
      value: handleValue,
      label: handleLabel,
      next: {
        prefix: '/',
        value: repoValue,
        label: repoLabel,
        next: {
          prefix: '/',
          value: repoValue + '/mergerequests',
          label: 'merge requests',
        },
      },
    },
    [handleLabel, handleValue, repoValue, repoLabel],
  );

  useNavigationAnimator({
    dashboardView: true,
    outerNavTab: outerNavTab,
    innerNavTab: 'org',
  });

  const from: 'remote' | 'local' = (searchParams.get?.('from') as 'remote' | 'local') ?? 'remote';

  return (
    <OuterNavigator
      outerNavTab={outerNavTab}
      page={'repo'}
      title={title}
      organizationId={repository?.organization?.id ?? null}
    >
      <>
        {repository && (
          <RepoController
            from={from}
            repository={repository}
            plugin={plugin ?? 'home'}
            page={"merge-request"}
            isLoading={loading}
          />
        )}
        {!repository && <div />}
      </>
    </OuterNavigator>
  );
};

export default React.memo(RepoCreateMergeRequestPage);