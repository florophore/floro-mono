import React, { useMemo} from 'react';
import { useUserAgent } from '../contexts/UAContext';


const VERSIONS = {
    mac: "0.0.33",
    linux: {
        rpm: "0.0.33",
        deb: "0.0.33",
    },
    windows: "0.0.29"
}


export const getLink = (type: "mac"|"windows"|"rpm"|"deb") => {
    const version = type == "mac" || type == "windows" ? VERSIONS[type] : VERSIONS.linux[type];
    if (type == "mac") {
        return `https://github.com/florophore/floro-mono/releases/download/v${version}/Floro-Mac-${version}.dmg`
    }
    if (type == "windows") {
        return `https://github.com/florophore/floro-mono/releases/download/v${version}/Floro_${version}.exe`
    }
    if (type == "rpm") {
        return `https://github.com/florophore/floro-mono/releases/download/v${version}/floro-desktop-${version}.x86_64.rpm`
    }
    if (type == "deb") {
        return `https://github.com/florophore/floro-mono/releases/download/v${version}/floro-desktop_${version}_amd64.deb`
    }
    return null;
}

export function detectMobile(userAgent: string) {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
        return userAgent.match(toMatchItem);
    });
}


interface DownloadLinkProps extends React.HTMLProps<HTMLAnchorElement> {
    type?: "mac"|"windows"|"rpm"|"deb"
    isLinuxDownload?: boolean;
    onShowMobileModal?: () => void;
    onShowLinuxModal?: () => void;
    children?: React.ReactElement|string;
}

export const DownloadLink = (props: DownloadLinkProps) => {
  const { type, isLinuxDownload, onShowMobileModal, onShowLinuxModal, children, ...rest } = props;

  const { userAgent } = useUserAgent();

  const isMobileVar = useMemo(() => detectMobile(userAgent), [userAgent]);
  const isWindowsVar = useMemo(() => userAgent.toLowerCase().indexOf("windows") >= 0, [userAgent]);
  const isLinuxVar = useMemo(() => userAgent.toLowerCase().indexOf("linux") >= 0, [userAgent]);
  const isMacVar = useMemo(() => userAgent.toLowerCase().indexOf("mac") >= 0, [userAgent]);

  const linkValue = useMemo(() => {
    if (props.type) {
      return getLink(props.type);
    }
    if (isWindowsVar) {
        return getLink("windows");
    }
    if (isMacVar) {
        return getLink("mac");
    }
    return null;
  }, [props.type, isWindowsVar, isMacVar]);

  if (isMobileVar) {
    return (
      <a {...rest} onClick={onShowMobileModal}>
        {children}
      </a>
    );
  }

  if (isLinuxDownload || (!linkValue && isLinuxVar)) {
    return (
      <a {...rest} onClick={onShowLinuxModal}>
        {children}
      </a>
    );
  }

  if (linkValue) {
    return (
        <a {...rest} href={linkValue} download onClick={() => {
            window.fathom.trackEvent("download-desktop-app", {
                linkValue
            })
        }}>
        {children}
        </a>
    );
  }
  return <a {...rest}>{children}</a>
};