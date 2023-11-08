import React, { useEffect, useMemo } from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import OrgBilling from '@floro/common-react/src/components/billing/OrgBilling'
import {useNavigationAnimator} from '@floro/common-react/src/navigation/navigation-animator';
import {useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import {useNavigate, useParams} from 'react-router-dom';
import { useOrganizationByHandleQuery } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import { useUserOrganizations } from '@floro/common-react/src/hooks/offline';

const OrgBillingPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const handle = params['handle'];
  const title = useLinkTitle(
    {
      value: `/org/@/${handle}`,
      label: '@' + handle,
      next: {
        prefix: '>',
        label: 'Billing',
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
    if (organization && !organization.membership?.permissions?.canModifyBilling) {
      navigate(`/org/@/${handle}`);
    }
  }, [organization]);

  return (
    <OuterNavigator outerNavTab={'org'} page={'organization'} title={title} organizationId={organization?.id ?? null}>
        <OrgBilling organization={organization}/>
    </OuterNavigator>
  );
};

export default React.memo(OrgBillingPage);