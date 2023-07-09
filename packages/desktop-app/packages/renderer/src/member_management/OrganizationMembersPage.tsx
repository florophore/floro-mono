
import React, {useMemo} from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import MembersHome from '@floro/common-react/src/components/member_management/MembersHome';
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';
import {useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import {useParams, useSearchParams} from 'react-router-dom';
import {useUserOrganizations} from '@floro/common-react/src/hooks/offline';
import { useOrganizationMemberManagementQuery } from '@floro/graphql-schemas/src/generated/main-client-graphql';

const OrganizationMembersPage = () => {
  const params = useParams();
  const handle = params['handle'];
  const [searchParams] = useSearchParams();
  const search = searchParams.get("query") ?? "";
  const id = searchParams.get("id") ?? null;
  const isSearching = search?.trim() != "";
  const title = useLinkTitle(
    {
      value: `/org/@/${handle}`,
      label: '@' + handle,
      next: {
        prefix: '>',
        label: 'Members',
      },
    },
    [handle],
  );

  const {data} = useOrganizationMemberManagementQuery({
    variables: {
      handle: handle ?? '',
      memberId: isSearching ? null : id,
      memberQuery: search
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
      <MembersHome organization={organization}/>
    </OuterNavigator>
  );
};

export default React.memo(OrganizationMembersPage);