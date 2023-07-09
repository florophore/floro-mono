
import React, {useMemo} from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import InvitationsHome from '@floro/common-react/src/components/member_management/InvitationsHome';
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';
import {useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import {useParams, useSearchParams} from 'react-router-dom';
import {useUserOrganizations} from '@floro/common-react/src/hooks/offline';
import {  useOrganizationMemberManagementQuery } from '@floro/graphql-schemas/src/generated/main-client-graphql';

const OrganizationInvitationsPage = () => {
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
        label: 'Invitations',
      },
    },
    [handle],
  );

  const {data} = useOrganizationMemberManagementQuery({
    variables: {
      handle: handle ?? '',
      invitationId: isSearching ? null : id,
      invitationQuery: search
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
      <InvitationsHome organization={organization}/>
    </OuterNavigator>
  );
};

export default React.memo(OrganizationInvitationsPage);