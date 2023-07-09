import React, { useMemo } from 'react'
import styled from '@emotion/styled';
import ColorPalette from '@floro/styles/ColorPalette';
import { useTheme } from '@emotion/react';
import PluginsIconLight from '@floro/common-assets/assets/images/icons/plugin.light.svg';
import PluginsIconDark from '@floro/common-assets/assets/images/icons/plugin.dark.svg';

const Container = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    user-select: none;
    width: 100%;
`;

const TextContainer = styled.div`
    flex: 1;
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 0;
`;

const Icon = styled.img`
    width: 24px;
    margin-right: 8px;
`;

const TextSpan = styled.span`
    cursor: pointer;
    font-size: 0.9rem;
    font-family: "MavenPro";
    font-weight: 600;
    color: ${props => props.theme.colors.followerTextColor};
    &:hover {
        color: ${ColorPalette.linkBlue};
    }
`;
const PluginCountNumeral = styled.span`
    font-weight: 400;
`;


export interface Props {
  pluginCount: number;
}

const PluginsTab = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const pluginsIcon = useMemo(() => {
    if (theme.name == "light") {
      return PluginsIconLight;
    }
    return PluginsIconDark;
  }, [theme.name]);

  return (
    <Container>
      <Icon src={pluginsIcon} />
      <TextContainer>
        <TextSpan>{"Plugins "}<PluginCountNumeral>{props.pluginCount ?? 0}</PluginCountNumeral></TextSpan>
      </TextContainer>
    </Container>
  );
};

export default React.memo(PluginsTab);