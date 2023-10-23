import React, {useMemo} from 'react';
import OrganizationSubscriber from "@floro/common-react/src/components/subscribers/OrganizationSubscriber";
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import OrgHome from '@floro/common-react/src/components/orghome/OrgHome';
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';
import {useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import {useParams} from 'react-router-dom';
import {useUserOrganizations} from '@floro/common-react/src/hooks/offline';
import { useOrganizationByHandleQuery } from '@floro/graphql-schemas/src/generated/main-client-graphql';

const OrganizationPage = () => {
  const params = useParams();
  const handle = params['handle'];
  const title = useLinkTitle(
    {
      value: `/org/@/${handle}`,
      label: '@' + handle,
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

  return (
    <OrganizationSubscriber organizationId={organization?.id ?? null}>
      <OuterNavigator outerNavTab={'org'} page={'organization'} title={title} organizationId={organization?.id ?? null}>
        <OrgHome organization={organization}/>
      </OuterNavigator>
    </OrganizationSubscriber>
  );
};

export default React.memo(OrganizationPage);
