import React, {useMemo} from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';
import {useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import {useParams} from 'react-router-dom';
import {useFetchRepositoryByNameQuery} from '@floro/graphql-schemas/src/generated/main-client-graphql';
import {useSession} from '@floro/common-react/src/session/session-context';

const RepoHomePage = () => {
  const params = useParams();
  const {currentUser} = useSession();
  const ownerHandle = params?.['ownerHandle'] ?? '';
  const repoName = params?.['repoName'] ?? '';
  const {data} = useFetchRepositoryByNameQuery({
    variables: {
      ownerHandle,
      repoName,
    },
  });
  const repository = useMemo(() => {
    if (data?.fetchRepositoryByName?.__typename == 'FetchRepositorySuccess') {
      return data?.fetchRepositoryByName.repository;
    }
    return null;
  }, [data]);

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
      return ownerHandle;
    }
    if (repository.repoType == 'user_repo') {
      return `@${repository?.user?.username}`;
    }
    return `@/${repository?.organization?.handle}`;
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
        prefix: "/",
        value: repoValue,
        label: repoLabel,
      },
    },
    [handleLabel, handleValue, repoValue, repoLabel],
  );

  useNavigationAnimator({
    dashboardView: true,
    outerNavTab: outerNavTab,
    innerNavTab: 'org',
  });

  return (
    <OuterNavigator
      outerNavTab={outerNavTab}
      page={'repo'}
      title={title}
      organizationId={repository?.organization?.id ?? null}
    >
      <div>{'REPO HERE'}</div>
    </OuterNavigator>
  );
};

export default React.memo(RepoHomePage);
