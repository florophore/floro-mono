import React, {useMemo} from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';
import {useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import {useParams} from 'react-router-dom';
import {useUserOrganizations} from '@floro/common-react/src/hooks/offline';
import {
  Organization,
  useOrganizationByHandleQuery,
} from '@floro/graphql-schemas/src/generated/main-client-graphql';
import OrganizationRemoteWebhook from '@floro/common-react/src/components/organization_api/OrganizationRemoteWebhook';

const OrgRemoteWebhookHome = () => {
  const params = useParams();
  const handle = params['handle'];
  const title = useLinkTitle(
    {
      value: `/org/@/${handle}`,
      label: '@' + handle,
      next: {
        prefix: '>',
        label: 'Developer Settings',
      },
    },
    [handle],
  );

  const {data} = useOrganizationByHandleQuery({
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
      <>
        {!!organization && (
          <OrganizationRemoteWebhook
            organization={organization as Organization}
            orgLink={`/org/@/${handle}`}
          />
        )}
      </>
    </OuterNavigator>
  );
};

export default React.memo(OrgRemoteWebhookHome);
