import React, {useEffect} from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import UserHome from '@floro/common-react/src/components/userhome/UserHome';
import {useSession} from '@floro/common-react/src/session/session-context';
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';
import {useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import {useNavigate} from 'react-router-dom';
import Cookies from 'js-cookie';

interface Props {
  notFound?: boolean;
}

const HomePage = (props: Props) => {
  const {currentUser} = useSession();
  const navigate = useNavigate();
  const title = useLinkTitle(
    {
      value: '/home',
      label: '@' + currentUser?.username,
    },
    [currentUser?.username],
  );

  useNavigationAnimator({
    dashboardView: true,
    outerNavTab: 'home',
    innerNavTab: 'home',
  });

  useEffect(() => {
    const userSessionToken = localStorage.getItem('session_key');
    if (!userSessionToken) {
      navigate('/loggedout');
    }
  }, []);

  useEffect(() => {
    if (currentUser == null) {
      navigate('/');
    }
  }, [currentUser]);

  return (
    <OuterNavigator outerNavTab={'home'} page={'home'} title={title}>
      <UserHome notFound={props.notFound} />
    </OuterNavigator>
  );
};

export default React.memo(HomePage);