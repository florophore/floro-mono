import React, { useMemo } from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import { useSession } from '@floro/common-react/src/session/session-context';
import { useNavigationAnimator } from '@floro/common-react/src/navigation/navigation-animator';
import CreateOrg from '@floro/common-react/src/components/create_org/CreateOrg';

const CreateOrgPage = () => {
    const {currentUser} = useSession();
    const title = useMemo(() => '@' + currentUser?.username + ' > ' + 'Create Organization', [currentUser?.username]);

    useNavigationAnimator({
      dashboardView: true,
      outerNavTab: 'home',
      innerNavTab: 'create-org',
    });

    return (
      <OuterNavigator page={'create-org'} title={title}>
        <CreateOrg/>
      </OuterNavigator>
    );
};

export default React.memo(CreateOrgPage);