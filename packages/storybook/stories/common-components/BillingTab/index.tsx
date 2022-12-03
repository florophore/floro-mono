import React, { useMemo } from 'react'
import styled from '@emotion/styled';
import ColorPalette from '@floro/styles/ColorPalette';
import { useTheme } from '@emotion/react';
import BillingIconLight from '@floro/common-assets/assets/images/icons/billing.light.svg';
import BillingIconDark from '@floro/common-assets/assets/images/icons/billing.dark.svg';

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
    width: 16px;
    margin-left: 4px;
    margin-right: 12px;
`;

const TextSpan = styled.span`
    font-size: 0.9rem;
    font-family: "MavenPro";
    font-weight: 600;
    color: ${props => props.theme.colors.followerTextColor};
`;


export interface Props {
}

const BillingTab = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const billingIcon = useMemo(() => {
    if (theme.name == "light") {
      return BillingIconLight;
    }
    return BillingIconDark;
  }, [theme.name]);

  return (
    <Container>
      <Icon src={billingIcon} />
      <TextContainer>
        <TextSpan>{"Billing"}</TextSpan>
      </TextContainer>
    </Container>
  );
};

export default React.memo(BillingTab);