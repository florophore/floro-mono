import React from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import { useSession } from '@floro/common-react/src/session/session-context';
import { useNavigationAnimator } from '@floro/common-react/src/navigation/navigation-animator';
import CreateRepo from '@floro/common-react/src/components/create_repo/CreateRepo';
import { useLinkTitle } from '@floro/common-react/src/components/header_links/HeaderLink';

const CreateUserRepoPage = () => {
    const {currentUser} = useSession();
    const title = useLinkTitle({
      value: '/home',
      label: '@' + currentUser?.username,
      next: {
        prefix: '>',
        label: 'Create Repository',
      }
    }, [currentUser?.username]);

    useNavigationAnimator({
      dashboardView: true,
      outerNavTab: 'home',
      innerNavTab: 'create-org',
    });

    return (
      <OuterNavigator page={'create-org'} title={title}>
        <CreateRepo/>
      </OuterNavigator>
    );
};

export default React.memo(CreateUserRepoPage);