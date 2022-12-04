import React from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import { useSession } from '@floro/common-react/src/session/session-context';
import { useNavigationAnimator } from '@floro/common-react/src/navigation/navigation-animator';
import CreateOrg from '@floro/common-react/src/components/create_org/CreateOrg';
import  { useLinkTitle } from '@floro/common-react/src/components/header_links/HeaderLink';

const CreateOrgPage = () => {
    const {currentUser} = useSession();
    const title = useLinkTitle({
      value: '/home',
      label: '@' + currentUser?.username,
      next: {
        prefix: '>',
        label: 'Create Organization',
      }
    }, [currentUser?.username]);

    useNavigationAnimator({
      dashboardView: true,
      outerNavTab: 'home',
      innerNavTab: 'create-org',
    });

    return (
      <OuterNavigator outerNavTab={'home'} page={'create-org'} title={title}>
        <CreateOrg/>
      </OuterNavigator>
    );
};

export default React.memo(CreateOrgPage);