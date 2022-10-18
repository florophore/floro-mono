import React, {  useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import WarningIconLight from '@floro/common-assets/assets/images/icons/warning.light.svg';
import WarningIconDark from '@floro/common-assets/assets/images/icons/warning.dark.svg';

const Container = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const WarningImage = styled.img`
    margin-right: 12px
`;

const WarningText = styled.p`
    font-family: "MavenPro";
    font-weight: 500;
    color: ${props => props.theme.colors.warningTextColor};
`;

export interface Props {
  label: string;
  size: "small"|"large";
}

const WarningLabel = ({
  label,
  size
}: Props): React.ReactElement => {
  const theme = useTheme();
  const height = useMemo(() => {
    if (size == 'small') {
        return 24;
    }
    return 32;
  }, [size])

  const warningIcon = useMemo(() => {
    if (theme.name == 'dark') {
        return WarningIconDark;
    }
    return WarningIconLight;
  }, [theme.name]);

  const fontSize = useMemo(() => {
    if (size == 'small') {
        return '1.2rem';
    }
    return '1.44rem';
  }, [size]);

  return (
    <Container>
        <WarningImage src={warningIcon} style={{height}}/>
        <WarningText style={{fontSize}}>{label}</WarningText>
    </Container>
  );
};

export default React.memo(WarningLabel);