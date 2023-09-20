import React, { useMemo } from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import { useSession } from '@floro/common-react/src/session/session-context';
import { useNavigationAnimator } from '@floro/common-react/src/navigation/navigation-animator';
import CreateUserRepo from '@floro/common-react/src/components/create_repo/CreateUserRepo';
import { useLinkTitle } from '@floro/common-react/src/components/header_links/HeaderLink';
import type { Repository } from '@floro/graphql-schemas/src/generated/main-client-graphql';

const CreateUserRepoPage = () => {
    const {currentUser} = useSession();
    const title = useLinkTitle({
      value: '/home',
      label: '@' + currentUser?.username,
      next: {
        prefix: '>',
        label: 'Create Repository',
      },
    }, [currentUser?.username]);

    useNavigationAnimator({
      dashboardView: true,
      outerNavTab: 'home',
      innerNavTab: 'create-org',
    });

    const existingRepos: Repository[] = useMemo(() => {
      return [...(currentUser?.publicRepositories as Repository[] ?? []), ...(currentUser?.privateRepositories as Repository[] ?? [])];
    }, [currentUser?.publicRepositories, currentUser?.privateRepositories]);

    return (
      <OuterNavigator outerNavTab={'home'} page={'create-org'} title={title}>
        <CreateUserRepo repositories={existingRepos}/>
      </OuterNavigator>
    );
};

export default React.memo(CreateUserRepoPage);