
import React, {useMemo} from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import RolesHome from '@floro/common-react/src/components/member_management/RolesHome';
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';
import {useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import {useParams} from 'react-router-dom';
import {useUserOrganizations} from '@floro/common-react/src/hooks/offline';
import {  useOrganizationMemberManagementQuery } from '@floro/graphql-schemas/src/generated/main-client-graphql';

const OrganizationRolesPage = () => {
  const params = useParams();
  const handle = params['handle'];
  const title = useLinkTitle(
    {
      value: `/org/@/${handle}`,
      label: '@' + handle,
      next: {
        prefix: '>',
        label: 'Roles',
      },
    },
    [handle],
  );

  const {data} = useOrganizationMemberManagementQuery({
    variables: {
      handle: handle ?? '',
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

  return (
    <OuterNavigator
      outerNavTab={'org'}
      page={'organization'}
      title={title}
      organizationId={organization?.id ?? null}
    >
      <RolesHome organization={organization}/>
    </OuterNavigator>
  );
};

export default React.memo(OrganizationRolesPage);