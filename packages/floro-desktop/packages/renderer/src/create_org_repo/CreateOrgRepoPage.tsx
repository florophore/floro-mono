import React, { useMemo } from 'react';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import { useNavigationAnimator } from '@floro/common-react/src/navigation/navigation-animator';
import CreateOrgRepo from '@floro/common-react/src/components/create_repo/CreateOrgRepo';
import { useLinkTitle } from '@floro/common-react/src/components/header_links/HeaderLink';
import type { Repository} from '@floro/graphql-schemas/src/generated/main-client-graphql';
import { useOrganizationByHandleQuery } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import { useParams } from 'react-router-dom';
import { useUserOrganizations } from '@floro/common-react/src/hooks/offline';
import type { Organization } from '@floro/graphql-schemas/build/generated/main-graphql';

const CreateOrgRepoPage = () => {
  const params = useParams();
  const handle = params['handle'];
  const title = useLinkTitle(
    {
      value: `/org/@/${handle}`,
      label: '@' + handle,
      next: {
        prefix: '>',
        label: 'Create Repository',
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
    return data?.organizationByHandle ?? defaultOrganization as Organization;
  }, [data?.organizationByHandle, defaultOrganization]);

  useNavigationAnimator({
    dashboardView: true,
    outerNavTab: 'org',
    innerNavTab: 'org',
  });

    const existingRepos: Repository[] = useMemo(() => {
      if (organization?.__typename == 'Organization' && (organization?.publicRepositories || organization?.privateRepositories)) {
        const repos = [];
        if (organization?.publicRepositories) {
          repos.push(...(organization.publicRepositories as Repository[]));
        }
        if (organization?.privateRepositories) {
          repos.push(...(organization.privateRepositories as Repository[]));
        }
        return repos;
      }
      return [];
    }, [organization?.publicRepositories, organization?.privateRepositories]);

    return (
      <OuterNavigator outerNavTab={'org'} page={'create-org'} title={title} organizationId={organization?.id}>
        {organization &&
          <CreateOrgRepo repositories={existingRepos} organization={organization}/>
        }
      </OuterNavigator>
    );
};

export default React.memo(CreateOrgRepoPage);