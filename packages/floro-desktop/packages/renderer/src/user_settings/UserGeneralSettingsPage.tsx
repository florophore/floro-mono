import React from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import UserGeneralSettings from '@floro/common-react/src/components/user_settings/UserGeneralSettings';
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';
import {useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import {useParams} from 'react-router-dom';
import {useSession} from '@floro/common-react/src/session/session-context';
import UserSettingsController from "@floro/storybook/stories/common-components/UserSettingsController";

const UserGeneralSettingsPage = () => {
  const params = useParams();
  const handle = params['handle'];
  const {currentUser} = useSession();
  const title = useLinkTitle(
    {
      value: '/home',
      label: '@' + currentUser?.username,
      next: {
        prefix: '>',
        label: 'Settings',
      },
    },
    [handle],
  );

  useNavigationAnimator({
    dashboardView: true,
    outerNavTab: 'settings',
    innerNavTab: 'settings',
  });

  return (
    <OuterNavigator outerNavTab={'home'} page={'settings'} title={title} organizationId={null}>
      <UserSettingsController page={'general'}>
        <UserGeneralSettings/>
      </UserSettingsController>
    </OuterNavigator>
  );
};

export default React.memo(UserGeneralSettingsPage);