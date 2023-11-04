import React, { useEffect, useMemo } from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import OrgAccountSettings from '@floro/common-react/src/components/org_settings/OrgAccountSettings'
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';
import {useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import {useNavigate, useParams} from 'react-router-dom';
import OrgSettingsController from "@floro/storybook/stories/common-components/OrgSettingsController";
import { useOrganizationByHandleQuery } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import { useUserOrganizations } from '@floro/common-react/src/hooks/offline';

const OrgAccountSettingsPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const handle = params['handle'];
  const title = useLinkTitle(
    {
      value: `/org/@/${handle}`,
      label: '@' + handle,
      next: {
        prefix: '>',
        label: 'Settings',
      },
    },
    [handle],
  );

  const {data} = useOrganizationByHandleQuery({
    variables: {
      handle:  handle ?? "",
    },
  });

  const organizations = useUserOrganizations();
  const defaultOrganization = useMemo(() => {
    return organizations?.find(organization => {
      return organization?.handle?.toLowerCase() == handle?.toLowerCase();
    });
  }, [organizations, handle]);

  const organization = useMemo(() => {
    return data?.organizationByHandle ?? defaultOrganization;
  }, [data?.organizationByHandle, defaultOrganization]);

  useNavigationAnimator({
    dashboardView: true,
    outerNavTab: 'org',
    innerNavTab: 'org',
  });

  useEffect(() => {
    if (organization && !organization.membership?.permissions?.canModifyOrganizationSettings) {
      navigate(`/org/@/${handle}`);
    }
  }, [organization]);

  return (
    <OuterNavigator outerNavTab={'org'} page={'organization'} title={title} organizationId={organization?.id ?? null}>
      <OrgSettingsController page={'account'}>
        <OrgAccountSettings organization={organization}/>
      </OrgSettingsController>
    </OuterNavigator>
  );
};

export default React.memo(OrgAccountSettingsPage);