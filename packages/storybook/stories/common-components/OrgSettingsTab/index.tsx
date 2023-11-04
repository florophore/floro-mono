import React, { useMemo } from 'react'
import styled from '@emotion/styled';
import ColorPalette from '@floro/styles/ColorPalette';
import { useTheme } from '@emotion/react';
import SettingsIconLight from '@floro/common-assets/assets/images/icons/settings.light.svg';
import SettingsIconDark from '@floro/common-assets/assets/images/icons/settings.dark.svg';

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
    font-size: 0.9rem;
    font-family: "MavenPro";
    font-weight: 600;
    cursor: pointer;
    color: ${props => props.theme.colors.followerTextColor};
    &:hover {
      color: ${props => props.theme.colors.linkColor};
    }
`;


export interface Props {
}

const OrgSettingsTab = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const settingsIcon = useMemo(() => {
    if (theme.name == "light") {
      return SettingsIconLight;
    }
    return SettingsIconDark;
  }, [theme.name]);

  return (
    <Container>
      <Icon src={settingsIcon} />
      <TextContainer>
        <TextSpan>{"Org Settings"}</TextSpan>
      </TextContainer>
    </Container>
  );
};

export default React.memo(OrgSettingsTab);