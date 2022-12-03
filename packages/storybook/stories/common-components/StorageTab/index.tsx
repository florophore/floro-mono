import React, { useMemo } from 'react'
import styled from '@emotion/styled';
import ColorPalette from '@floro/styles/ColorPalette';
import { useTheme } from '@emotion/react';
import DatabaseIconLight from '@floro/common-assets/assets/images/icons/database.light.svg';
import DatabaseIconDark from '@floro/common-assets/assets/images/icons/database.dark.svg';

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
    width: 18px;
    margin-left: 2px;
    margin-right: 12px;
`;

const TextSpan = styled.span`
    font-size: 0.9rem;
    font-family: "MavenPro";
    font-weight: 600;
    color: ${props => props.theme.colors.followerTextColor};
`;

const StorageSpan = styled.span`
    font-size: 0.9rem;
    font-family: "MavenPro";
    font-weight: 400;
    color: ${props => props.theme.colors.followerTextColor};
    text-dectoration: underline;
    margin-left: 12px;
`;

const StorageEmphasis = styled.span`
    font-size: 0.9rem;
    font-family: "MavenPro";
    font-weight: 600;
    color: ${props => props.theme.colors.followerTextColor};
`;

const GB = 1024 * 1024 * 1024;

export interface Props {
  diskSpaceLimitBytes: number;
  utilizedDiskSpaceBytes: number;
}

const StorageTab = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const databaseIcon = useMemo(() => {
    if (theme.name == "light") {
      return DatabaseIconLight;
    }
    return DatabaseIconDark;
  }, [theme.name]);

  const numerator = useMemo(() => ((props?.utilizedDiskSpaceBytes ?? 0)/GB).toFixed(1),[props?.utilizedDiskSpaceBytes]);
  const denominator = useMemo(() => (props?.diskSpaceLimitBytes ?? 0)/GB,[props?.diskSpaceLimitBytes]);

  return (
    <Container>
      <Icon src={databaseIcon} />
      <TextContainer>
        <TextSpan>{"Storage"}</TextSpan>
        <StorageSpan>{`${numerator}GB/`}<StorageEmphasis>{`${denominator}GB`}</StorageEmphasis></StorageSpan>
      </TextContainer>
    </Container>
  );
};

export default React.memo(StorageTab);