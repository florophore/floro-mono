import React, { useMemo } from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import UserHome from '@floro/common-react/src/components/userhome/UserHome';
import { useSession } from '@floro/common-react/src/session/session-context';

export interface Props {
    isOpen: boolean;
}

const Home = (props: Props) => {
    const {currentUser} = useSession();
    const title = useMemo(() => '@' + currentUser?.username, [currentUser?.username]);
    return (
      <OuterNavigator isOpen={props?.isOpen} title={title}>
        <UserHome/>
      </OuterNavigator>
    );
};

export default React.memo(Home);