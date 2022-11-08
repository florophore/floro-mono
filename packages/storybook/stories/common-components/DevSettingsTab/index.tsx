import React, { useMemo } from 'react'
import styled from '@emotion/styled';
import ColorPalette from '@floro/styles/ColorPalette';
import { useTheme } from '@emotion/react';
import CodeIconLight from '@floro/common-assets/assets/images/icons/code.light.svg';
import CodeIconDark from '@floro/common-assets/assets/images/icons/code.dark.svg';

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
    color: ${props => props.theme.colors.followerTextColor};
`;


export interface Props {
}

const DevSettingsTab = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const settingsIcon = useMemo(() => {
    if (theme.name == "light") {
      return CodeIconLight;
    }
    return CodeIconDark;
  }, [theme.name]);

  return (
    <Container>
      <Icon src={settingsIcon} />
      <TextContainer>
        <TextSpan>{"Developer Settings"}</TextSpan>
      </TextContainer>
    </Container>
  );
};

export default React.memo(DevSettingsTab);