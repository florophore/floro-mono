import React from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';
import {useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import {useParams} from 'react-router-dom';
import {useSession} from '@floro/common-react/src/session/session-context';
import UserLocalWebhooks from '@floro/common-react/src/components/user_api/UserLocalWebhooks';

const UserLocalWebhookHome = () => {
  const params = useParams();
  const handle = params['handle'];
  const {currentUser} = useSession();
  const title = useLinkTitle(
    {
      value: '/home',
      label: '@' + currentUser?.username,
      next: {
        prefix: '>',
        label: 'Developer Settings',
      },
    },
    [handle],
  );

  useNavigationAnimator({
    dashboardView: true,
    outerNavTab: 'keys',
    innerNavTab: 'keys',
  });

  return (
    <OuterNavigator outerNavTab={'home'} page={'keys'} title={title} organizationId={null}>
      <UserLocalWebhooks/>
    </OuterNavigator>
  );
};

export default React.memo(UserLocalWebhookHome);