import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {Helmet} from "react-helmet";
import { useLocation } from "react-router-dom";
import { useIsOnline } from "@floro/common-react/src/hooks/offline";
import Button from '@floro/storybook/stories/design-system/Button';
import { useFloroSocket } from '@floro/common-react/src/pubsub/socket';

function AppProxyPage(): React.ReactElement {
    const location = useLocation();
    const redirectLink = useMemo(() => {
        const rawRoutePart = location.pathname.replace("/app-proxy", "");
        return (rawRoutePart == "" ? "/" : rawRoutePart) + location.search;
    }, [location.pathname, location.search]);

    const isOnline = useIsOnline();
    const { socket } = useFloroSocket();

    const onOpenPage = useCallback(() => {
        if (!isOnline) {
            return;
        }
        socket?.emit("open-event", {redirectLink})

    }, [isOnline, redirectLink]);

    useEffect(() => {
      onOpenPage();
    }, [onOpenPage])

  return (
    <div>
      <Helmet>
        <title>{'About'}</title>
      </Helmet>
        <p>
            {'App Proxy'}
        </p>
        <Button onClick={onOpenPage} size='medium' label={'open page'} bg={'purple'}/>
    </div>
  )
}

export default AppProxyPage;