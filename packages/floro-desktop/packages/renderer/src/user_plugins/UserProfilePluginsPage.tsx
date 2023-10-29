import { useCallback, useEffect, useMemo } from 'react';
import styled from "@emotion/styled";
import type {LinkChain} from '@floro/common-react/src/components/header_links/HeaderLink';
import { useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import {useSession} from '@floro/common-react/src/session/session-context';
import PluginEditor from '@floro/common-react/src/components/plugins/PluginEditor';
import React from 'react';
import {useUserByUseranmeQuery, type Plugin} from '@floro/graphql-schemas/src/generated/main-client-graphql';
import { useNavigate, useParams } from 'react-router-dom';
import { useNavigationAnimator } from '@floro/common-react/src/navigation/navigation-animator';
import DotsLoader from '@floro/storybook/stories/design-system/DotsLoader';

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

const UserProfilePluginsPage = () => {
  const {currentUser} = useSession();
  const navigate = useNavigate();
  const params = useParams();
  const handle = params?.['handle'] ?? '';
  const paramsVersion = (params?.['version'] ?? '')?.replaceAll("-", ".");
  const {data, loading} = useUserByUseranmeQuery({
    variables: {
      username: handle
    },
    fetchPolicy: 'cache-and-network'
  });

  const plugins = useMemo(() => {
    return [...(data?.userByUsername?.publicPlugins ?? [])]?.sort(
      (a, b) => {
        if (a?.displayName?.toLowerCase?.() == b?.displayName?.toLowerCase?.()) {
          return 0;
        }
        return a?.displayName?.toLowerCase?.() ?? '' > (b?.displayName?.toLowerCase?.() ?? '')
          ? 1
          : -1;
      },
    ) as Plugin[];
  }, [data?.userByUsername?.publicPlugins]);

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
            currentPlugin?.lastReleasedPublicVersion?.version,
        ) ?? currentPlugin?.versions?.[0] ?? null
      );
    }
    return (
      currentPlugin?.versions?.find(version => version?.version == paramsVersion) ??
      currentPlugin?.versions?.find(
        version =>
          version?.version ==
          currentPlugin?.lastReleasedPublicVersion?.version,
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
    if (currentUser?.username != null && handle?.toLowerCase() == currentUser?.username?.toLowerCase()) {
      if (params['plugin'] && paramsVersion) {
        navigate(`/home/plugins/${params['plugin']}/v/${paramsVersion?.replaceAll(".", "-")}`, { replace: true});
        return;
      }
      if (params['plugin']) {
        navigate(`/home/plugins/${params['plugin']}`, { replace: true});
        return;
      }
      navigate('/home/plugins', { replace: true});
      return;
    }

    if (!params['plugin'] && !paramsVersion && currentPlugin?.name && currentVersion?.version) {
      navigate(`/user/@/${handle}/plugins/${currentPlugin?.name}/v/${currentVersion?.version?.replaceAll(".", "-")}`, { replace: true});
      return;
    }

    if (!params['plugin'] && currentPlugin?.name) {
      navigate(`/user/@/${handle}/plugins/${currentPlugin?.name}`, { replace: true});
      return;
    }
  }, [currentUser, handle, params, paramsVersion, currentPlugin, currentVersion, navigate]);


  const linkInfo = useMemo(() => {
    const info: LinkChain = {
      value: '/user/@/' + handle,
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
        value: `/user/@/${data?.userByUsername?.username}/${currentPlugin.name}`,
      };
    }
    if (currentPlugin && currentVersion && info?.next?.next) {
      info.next.next.next = {
        prefix: '@',
        label: (currentVersion.version ?? params?.['version'] ?? ''),
        value: `/user/@/${data?.userByUsername?.username}/plugins/${currentPlugin.name}/v/${currentVersion?.version?.replaceAll(".", "-")}`,
      };
    }
    return info;
  }, [params, handle, data?.userByUsername?.username, currentPlugin, currentVersion]);

  useNavigationAnimator({
    dashboardView: true,
    outerNavTab: 'home',
    innerNavTab: 'plugins',
  });

  const title = useLinkTitle(linkInfo, [linkInfo]);

  return (
    <OuterNavigator outerNavTab={handle == currentUser?.username ? 'home' : null} page={'plugins'} title={title} organizationId={null}>
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
        {!loading && !data?.userByUsername?.id && (
          <NotFoundContainer>
            <NotFoundTextWrapper>
              <NotFoundText>{'user not found'}</NotFoundText>
            </NotFoundTextWrapper>
          </NotFoundContainer>
        )}
        {!loading && data?.userByUsername?.id && (
          <PluginEditor
            onPressOpenDocs={() => {}}
            currentPlugin={currentPlugin}
            currentVersion={currentVersion}
            linkPrefix={`/user/@/${data?.userByUsername?.username}/plugins`}
            accountType={'user'}
            plugins={plugins}
            canRelease={false}
            canRegister={false}
            isProfileMode
          />
        )}
      </>
    </OuterNavigator>
  );
};

export default React.memo(UserProfilePluginsPage);