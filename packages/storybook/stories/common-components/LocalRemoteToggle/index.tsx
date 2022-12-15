import React, { useMemo, useCallback } from 'react'
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import LaptopWhite from "@floro/common-assets/assets/images/icons/laptop.white.svg";
import LaptopGray from "@floro/common-assets/assets/images/icons/laptop.gray.svg";
import GlobeWhite from "@floro/common-assets/assets/images/icons/globe.white.svg";
import GlobeGray from "@floro/common-assets/assets/images/icons/globe.gray.svg";

const Container = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    width: 100%;
    height: 64px;
    border-bottom: 1px solid ${props => props.theme.colors.localRemoteBorderColor};
`;

const Tab = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 100%;
    cursor: pointer;
`;

const Divider = styled.div`
    background: ${props => props.theme.colors.localRemoteBorderColor};
    width: 1px;
    height: 100%;
`;

const Text = styled.span`
    font-size: 1.44rem;
    font-family: "MavenPro";
    font-weight: 600;
    margin-left: 24px;
    color: ${props => props.theme.colors.localRemoteTextColor};
`;

const Icon = styled.img`
    width: 32px;
    height: 32px;
`;


export interface Props {
    tab: "local"|"remote";
    onChange?: (tab: "local"|"remote") => void;
}

const LocalRemoteToggle = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const localIcon = useMemo(() => {
    if (props.tab == "local") {
        return LaptopWhite;
    }
    return theme.name == "light" ? LaptopGray : LaptopWhite;
  }, [props.tab, theme.name]);

  const remoteIcon = useMemo(() => {
    if (props.tab == "remote") {
        return GlobeWhite;
    }
    return theme.name == "light" ? GlobeGray : GlobeWhite;

  }, [props.tab, theme.name]);

  const selectedTabStyles = useMemo(() => {
    return {
        background: theme.colors.localRemoteSelectedBackgroundColor,
        boxShadow: `inset 0px 0px 4px 1px ${theme.shadows.localRemoteSelected}`
    };
  }, [theme]);

  const localTabStyles = useMemo(() => {
    return props.tab == "local" ? selectedTabStyles : {};
  }, [selectedTabStyles, props.tab]);

  const remoteTabStyles = useMemo(() => {
    return props.tab == "remote" ? selectedTabStyles : {};
  }, [selectedTabStyles, props.tab]);

  const selectedTabTextStyles = useMemo(() => {
    return {
        color: theme.colors.localRemoteSelectedTextColor
    };
  }, [theme]);

  const localTabTextStyles = useMemo(() => {
    return props.tab == "local" ? selectedTabTextStyles : {};
  }, [selectedTabTextStyles, props.tab]);

  const remoteTabTextStyles = useMemo(() => {
    return props.tab == "remote" ? selectedTabTextStyles : {};
  }, [selectedTabTextStyles, props.tab]);

  const onClickRemote = useCallback(() => {
    props?.onChange?.("remote");
  }, [props.onChange]);

  const onClickLocal = useCallback(() => {
    props?.onChange?.("local");
  }, [props.onChange]);

  return (
    <Container>
        <Tab style={localTabStyles} onClick={onClickLocal}>
            <Icon src={localIcon}/>
            <Text style={localTabTextStyles}>{'Local'}</Text>
        </Tab>
        <Divider/>
        <Tab style={remoteTabStyles} onClick={onClickRemote}>
            <Icon src={remoteIcon}/>
            <Text style={remoteTabTextStyles}>{'Remote'}</Text>
        </Tab>
    </Container>
  );
};

export default React.memo(LocalRemoteToggle);