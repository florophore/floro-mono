import React, { useMemo } from 'react'
import styled from '@emotion/styled';
import ColorPalette from '@floro/styles/ColorPalette';
import { useTheme } from '@emotion/react';
import MemberSettingsIconLight from '@floro/common-assets/assets/images/icons/member_settings.light.svg';
import MemberSettingsIconDark from '@floro/common-assets/assets/images/icons/member_settings.dark.svg';

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

const MemberSettingsTab = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const memberSettingsIcon = useMemo(() => {
    if (theme.name == "light") {
      return MemberSettingsIconLight;
    }
    return MemberSettingsIconDark;
  }, [theme.name]);

  return (
    <Container>
      <Icon src={memberSettingsIcon} />
      <TextContainer>
        <TextSpan>{"Member Settings"}</TextSpan>
      </TextContainer>
    </Container>
  );
};

export default React.memo(MemberSettingsTab);