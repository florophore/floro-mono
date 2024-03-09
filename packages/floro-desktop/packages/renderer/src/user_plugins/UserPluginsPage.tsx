import { useCallback, useEffect, useMemo } from 'react';
import type {LinkChain} from '@floro/common-react/src/components/header_links/HeaderLink';
import { useLinkTitle} from '@floro/common-react/src/components/header_links/HeaderLink';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import {useSession} from '@floro/common-react/src/session/session-context';
import PluginEditor from '@floro/common-react/src/components/plugins/PluginEditor';
import React from 'react';
import type {Plugin} from '@floro/graphql-schemas/src/generated/main-client-graphql';
import { useNavigate, useParams } from 'react-router-dom';
import { useNavigationAnimator } from '@floro/common-react/src/navigation/navigation-animator';
import { useOpenLink } from '@floro/common-react/src/links/OpenLinkContext';

const UserPluginsPage = () => {
  const openLink = useOpenLink();
  const params = useParams();
  const paramsVersion = (params?.['version'] ?? '')?.replaceAll("-", ".");
  const {currentUser} = useSession();
  const navigate = useNavigate();

  const plugins = useMemo(() => {
    return [...(currentUser?.privatePlugins ?? []), ...(currentUser?.publicPlugins ?? [])]?.sort(
      (a, b) => {
        if (a?.displayName?.toLowerCase?.() == b?.displayName?.toLowerCase?.()) {
          return 0;
        }
        return a?.displayName?.toLowerCase?.() ?? '' > (b?.displayName?.toLowerCase?.() ?? '')
          ? 1
          : -1;
      },
    ) as Plugin[];
  }, [currentUser?.privatePlugins,  currentUser?.publicPlugins]);

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

  useEffect(() => {
    if (!params['plugin'] && !paramsVersion && currentPlugin?.name && currentVersion?.version) {
      navigate(`/home/plugins/${currentPlugin?.name}/v/${currentVersion?.version?.replaceAll(".", "-")}`, { replace: true});
      return;
    }

    if (!params['plugin'] && currentPlugin?.name) {
      navigate(`/home/plugins/${currentPlugin?.name}`, { replace: true});
      return;
    }

  }, [params, paramsVersion, currentPlugin, currentVersion, navigate]);

  const linkInfo = useMemo(() => {
    const info: LinkChain = {
      value: '/home',
      label: '@' + currentUser?.username,
      next: {
        prefix: '>',
        label: 'Plugins',
      },
    };
    if (currentPlugin && info?.next) {
      info.next.next = {
        prefix: '/',
        label: currentPlugin.name ?? params?.['plugin'] ?? '',
        value: `/home/plugins/${currentPlugin.name}`,
      };
    }
    if (currentPlugin && currentVersion && info?.next?.next) {
      info.next.next.next = {
        prefix: '@',
        label: (currentVersion.version ?? params?.['version'] ?? ''),
        value: `/home/plugins/${currentPlugin.name}/v/${currentVersion?.version?.replaceAll(".", "-")}`,
      };
    }
    return info;
  }, [params, currentUser?.username, currentPlugin, currentVersion]);

  useNavigationAnimator({
    dashboardView: true,
    outerNavTab: 'home',
    innerNavTab: 'plugins',
  });

  const title = useLinkTitle(linkInfo, [linkInfo]);

  const onOpenDocs = useCallback(() => {
    openLink("https://floro.io/docs");
  }, []);

  return (
    <OuterNavigator outerNavTab={'home'} page={'plugins'} title={title} organizationId={null}>
      <PluginEditor
        onPressOpenDocs={onOpenDocs}
        currentPlugin={currentPlugin}
        currentVersion={currentVersion}
        linkPrefix={'/home/plugins'}
        accountType={'user'}
        plugins={plugins}
        canRelease
        canRegister
      />
    </OuterNavigator>
  );
};

export default React.memo(UserPluginsPage);