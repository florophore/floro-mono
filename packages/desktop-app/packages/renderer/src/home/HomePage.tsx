import React, { useMemo } from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import UserHome from '@floro/common-react/src/components/userhome/UserHome';
import { useSession } from '@floro/common-react/src/session/session-context';
import { useNavigationAnimator } from '@floro/common-react/src/navigation/navigation-animator';

const HomePage = () => {
    const {currentUser} = useSession();
    const title = useMemo(() => '@' + currentUser?.username, [currentUser?.username]);

    useNavigationAnimator({
      dashboardView: true,
      outerNavTab: 'home',
      innerNavTab: 'home',
    });

    return (
      <OuterNavigator page={'home'} title={title}>
        <UserHome/>
      </OuterNavigator>
    );
};

export default React.memo(HomePage);