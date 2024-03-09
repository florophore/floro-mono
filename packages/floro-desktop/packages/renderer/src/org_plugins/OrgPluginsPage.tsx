import { useCallback, useEffect, useMemo } from 'react';
import OrganizationSubscriber from "@floro/common-react/src/components/subscribers/OrganizationSubscriber";
import styled from "@emotion/styled";
import type {LinkChain} from '@floro/common-react/src/components/header_links/HeaderLink';
import { useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import {useSession} from '@floro/common-react/src/session/session-context';
import PluginEditor from '@floro/common-react/src/components/plugins/PluginEditor';
import React from 'react';
import {useUserByUseranmeQuery, type Plugin, useOrganizationByHandleQuery} from '@floro/graphql-schemas/src/generated/main-client-graphql';
import { useNavigate, useParams } from 'react-router-dom';
import { useNavigationAnimator } from '@floro/common-react/src/navigation/navigation-animator';
import DotsLoader from '@floro/storybook/stories/design-system/DotsLoader';
import { useUserOrganizations } from '@floro/common-react/src/hooks/offline';
import { useOpenLink } from '@floro/common-react/src/links/OpenLinkContext';

const NotFoundContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: center;
  justify-content: center;
  align-items: center;
`;

const NotFoundTextWrapper = styled.div`
  width: 50%;
  max-width: 450px;
  flex-direction: center;
  justify-content: center;
`;

const NotFoundText = styled.h3`
  font-weight: 600;
  font-size: 2.5rem;
  font-family: "MavenPro";
  text-align: center;
  color: ${(props) => props.theme.colors.contrastText};
`;


const OrgPluginsPage = () => {
  const navigate = useNavigate();
  const openLink = useOpenLink();
  const params = useParams();
  const handle = params?.['handle'] ?? '';
  const paramsVersion = (params?.['version'] ?? '')?.replaceAll("-", ".");
  const {data, loading} = useOrganizationByHandleQuery({
    variables: {
      handle:  handle ?? "",
    },
    fetchPolicy: 'cache-and-network'
  });

  const organizations = useUserOrganizations();
  const userOrg = useMemo(() => {
    if (!handle) {
      return null;
    }
    return organizations?.find(o => o.handle == handle) ?? null;
  }, [handle, organizations])

  const defaultOrganization = useMemo(() => {
    return organizations?.find(organization => {
      return organization?.handle?.toLowerCase() == handle?.toLowerCase();
    });
  }, [organizations, handle]);

  const organization = useMemo(() => {
    return data?.organizationByHandle ?? defaultOrganization;
  }, [data?.organizationByHandle, defaultOrganization]);

  const isOrgMember = useMemo(() => {
    return userOrg?.membership?.membershipState == "active";
  }, [userOrg?.membership?.membershipState])

  const plugins = useMemo(() => {
    return [...(organization?.publicPlugins ?? []), ...(!isOrgMember ? [] : organization?.privatePlugins ?? [])]?.sort(
      (a, b) => {
        if (a?.displayName?.toLowerCase?.() == b?.displayName?.toLowerCase?.()) {
          return 0;
        }
        return a?.displayName?.toLowerCase?.() ?? '' > (b?.displayName?.toLowerCase?.() ?? '')
          ? 1
          : -1;
      },
    ) as Plugin[];
  }, [isOrgMember, organization?.publicPlugins, organization?.privatePlugins]);

  const currentPlugin = useMemo(() => {
    if (plugins.length === 0) {
      return null;
    }
    if (!params['plugin']) {
      return plugins[0];
    }
    return plugins.find(plugin => plugin.name == params['plugin']);
  }, [params, plugins]);

  const currentVersion = useMemo(() => {
    if (!currentPlugin) {
      return null;
    }
    if (!paramsVersion) {
      return (
        currentPlugin?.versions?.find(
          version =>
            version?.version ==
            (currentPlugin.isPrivate
              ? currentPlugin?.lastReleasedPrivateVersion?.version
              : currentPlugin?.lastReleasedPublicVersion?.version),
        ) ?? currentPlugin?.versions?.[0] ?? null
      );
    }
    return (
      currentPlugin?.versions?.find(version => version?.version == paramsVersion) ??
      currentPlugin?.versions?.find(
        version =>
          version?.version ==
          (currentPlugin.isPrivate
            ? currentPlugin?.lastReleasedPrivateVersion?.version
            : currentPlugin?.lastReleasedPublicVersion?.version),
      ) ??
      currentPlugin?.versions?.[0] ??
      null
    );
  }, [params, paramsVersion, plugins, currentPlugin]);

  useNavigationAnimator({
    dashboardView: true,
    outerNavTab: null,
    innerNavTab: 'home',
  });

  useEffect(() => {
    if (!params['plugin'] && !paramsVersion && currentPlugin?.name && currentVersion?.version) {
      navigate(`/org/@/${handle}/plugins/${currentPlugin?.name}/v/${currentVersion?.version?.replaceAll(".", "-")}`, { replace: true});
      return;
    }

    if (!params['plugin'] && currentPlugin?.name) {
      navigate(`/org/@/${handle}/plugins/${currentPlugin?.name}`, { replace: true});
      return;
    }
  }, [params, paramsVersion, currentPlugin, currentVersion, navigate]);


  const linkInfo = useMemo(() => {
    const info: LinkChain = {
      value: '/org/@/' + handle,
      label: '@' + handle,
      next: {
        prefix: '>',
        label: 'Plugins',
      },
    };
    if (currentPlugin && info?.next) {
      info.next.next = {
        prefix: '/',
        label: currentPlugin.name ?? params?.['plugin'] ?? '',
        value: `/org/@/${handle}/plugins/${currentPlugin.name}`,
      };
    }
    if (currentPlugin && currentVersion && info?.next?.next) {
      info.next.next.next = {
        prefix: '@',
        label: (currentVersion.version ?? params?.['version'] ?? ''),
        value: `/org/@/${handle}/plugins/${currentPlugin.name}/v/${currentVersion?.version?.replaceAll(".", "-")}`,
      };
    }
    return info;
  }, [params, handle, currentPlugin, currentVersion]);

  useNavigationAnimator({
    dashboardView: true,
    outerNavTab: 'home',
    innerNavTab: 'plugins',
  });

  const title = useLinkTitle(linkInfo, [linkInfo]);

  const onOpenDocs = useCallback(() => {
    openLink("https://floro.io/docs")
  }, []);

  return (
    <OrganizationSubscriber organizationId={organization?.id ?? null}>
      <OuterNavigator outerNavTab={'org'} page={'organization'} title={title} organizationId={organization?.id ?? null}>
        <>
          {loading && (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <DotsLoader color={'purple'} size={'large'}/>
            </div>
          )}
          {!loading && !organization?.id && (
            <NotFoundContainer>
              <NotFoundTextWrapper>
                <NotFoundText>{'org not found'}</NotFoundText>
              </NotFoundTextWrapper>
            </NotFoundContainer>
          )}
          {!loading && organization?.id && (
            <PluginEditor
              onPressOpenDocs={onOpenDocs}
              currentPlugin={currentPlugin}
              currentVersion={currentVersion}
              linkPrefix={`/org/@/${organization?.handle}/plugins`}
              accountType={'org'}
              plugins={plugins}
              canRelease={organization?.membership?.permissions?.canReleasePlugins}
              isProfileMode={!isOrgMember}
              organization={organization}
              canRegister={organization?.membership?.permissions?.canRegisterPlugins}
            />
          )}
        </>
      </OuterNavigator>

    </OrganizationSubscriber>
  );
};

export default React.memo(OrgPluginsPage);