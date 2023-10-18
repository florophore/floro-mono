import React, {useEffect} from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import UserHome from '@floro/common-react/src/components/userhome/UserHome';
import {useSession} from '@floro/common-react/src/session/session-context';
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';
import {useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import Cookies from 'js-cookie';

const UserProfilePage = () => {
  const {currentUser} = useSession();
  const navigate = useNavigate();
  const params = useParams();
  const handle = params?.['handle'] ?? '';
  const title = useLinkTitle(
    {
      value: '/home',
      label: '@' + handle,
    },
    [handle],
  );

  useNavigationAnimator({
    dashboardView: true,
    outerNavTab: null,
    innerNavTab: 'home',
  });
  const location = useLocation();

  useEffect(() => {
    if (currentUser?.username != null && handle?.toLowerCase() == currentUser?.username?.toLowerCase()) {
      navigate('/home', { replace: true});
    }
  }, [currentUser, handle]);

  return (
    <OuterNavigator outerNavTab={null} page={'profile'} title={title}>
      <>
        {"testing out profile"}
      </>
    </OuterNavigator>
  );
};

export default React.memo(UserProfilePage);