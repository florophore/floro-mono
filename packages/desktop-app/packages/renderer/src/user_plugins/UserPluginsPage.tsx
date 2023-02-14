import { useMemo } from 'react';
import { useLinkTitle } from '@floro/common-react/src/components/header_links/HeaderLink';
import OuterNavigator from '@floro/common-react/src/components/outer-navigator/OuterNavigator';
import { useSession } from '@floro/common-react/src/session/session-context';
import PluginEditor from '@floro/common-react/src/components/plugins/PluginEditor';
import React from 'react';
import type { Plugin } from '@floro/graphql-schemas/src/generated/main-client-graphql';

const UserPluginsPage = () => {

    const {currentUser} = useSession();
    const title = useLinkTitle({
      value: '/home',
      label: '@' + currentUser?.username,
      next: {
        prefix: '>',
        label: 'Plugins',
      },
    }, [currentUser?.username]);
    const plugins = useMemo(() => {
      return [...(currentUser?.privatePlugins ?? []), ...(currentUser?.publicPlugins ?? [])]?.sort((a, b) => {
        if (a?.displayName?.toLowerCase?.() == b?.displayName?.toLowerCase?.()) {
          return 0;
        }
        return a?.displayName?.toLowerCase?.() ?? '' > (b?.displayName?.toLowerCase?.() ?? '') ? 1 : -1;
      }) as Plugin[];

    }, [currentUser?.privatePlugins, currentUser?.publicPlugins]);
    // if plugins.length > 0 redirect to same page with first plugin selected
    return (
      <OuterNavigator outerNavTab={'home'} page={'plugins'} title={title} organizationId={null}>
        <PluginEditor accountType={'user'} plugins={plugins}/>
      </OuterNavigator>
    );
};

export default React.memo(UserPluginsPage);
