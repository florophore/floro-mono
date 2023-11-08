import React, { useCallback, useState, useMemo, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import EditOrgInputs from "@floro/storybook/stories/common-components/EditOrgInputs";
import {
  Organization,
  useUpdateOrganizationAcknowledgeBetaPricingMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import EmailValidator from "email-validator";
import Button from "@floro/storybook/stories/design-system/Button";

import { useOpenLink } from "../../links/OpenLinkContext";

const Container = styled.div`
  height: 100%;
  width: 100%;
  max-width: 100%;
  user-select: text;
  ::-webkit-scrollbar {
    width: 4px;
    background: ${(props) => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: ${(props) => props.theme.background};
  }
`;

const InnerContainer = styled.div`
  padding: 16px 40px 80px 24px;
  overflow-y: scroll;
  height: 100%;
`;

const TitleContainer = styled.div`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const SectionContainer = styled.div`
  max-width: 720px;
  margin-bottom: 48px;
`;

const SectionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.contrastText};
  margin-bottom: 24px;
`;

const BlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
`;

const BlurbText = styled.p`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  white-space: pre-wrap;
  color: ${(props) => props.theme.colors.contrastText};
`;

const ButtonContainer = styled.div`
  width: 720px;
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;

const UpdateTitle = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.44rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const ThankYouText = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.7rem;
  white-space: pre-wrap;
`;




const pricingText = () => ({
  __html: `
  While Floro is in beta, it is entirely free to use. We are highly appreciative of your willingness to test-drive the product!

Although Floro is an open-source product, we are still a business that needs to find a way to make money that works for us, our users, and our customers.

We are happy to host any public repository or plugin on our servers for free. We are also happy to host all personal repositories and plugins for free, regardless of whether they are public or private.

<b>To be clear, Floro will always be free for your organization if all of your organization's repositories are public. Additionally Floro will always be free for personal repositories and plugins.</b>

Our current plan for pricing is to charge <b>$12 per active member per month</b> of an organization <i>with one or more</i> private repositories. We will not charge organizations for additional private repositories. <b>All organizations get up to 5 members before we begin charging.</b>

<b>We also do consulting!</b>

`.trimStart(),
});

interface Props {
  organization: Organization;
}

const OrgBilling = (props: Props) => {
  const theme = useTheme();
  const openLink = useOpenLink();
  const [acknowledge, acknowledgeRequest] = useUpdateOrganizationAcknowledgeBetaPricingMutation();

  const onAcknowledge = useCallback(() => {
    if (!props?.organization?.id) {
      return;
    }
    acknowledge({
      variables: {
        organizationId: props.organization.id
      }
    })

  }, [props.organization]);

  const onClickLearnMore= (e) => {
    e.preventDefault();
    alert("test")
    //openLink(href);
  }

  return (
    <Container>
      <InnerContainer style={{width: '100%', flexGrow: 1}}>
        <TitleContainer style={{ marginBottom: 48 }}>
          <Title>{"Beta Acknowledgement"}</Title>
        </TitleContainer>
        <SectionContainer>
          <SectionTitle>{"Pricing Plan"}</SectionTitle>
          <BlurbBox>
            <BlurbText>
              <span dangerouslySetInnerHTML={pricingText()}></span>
              <span>
                {
                  "The best way to support us (and the most sustainable way to support us) is to hire us to help you fully utilize Floro. We're happy to help you host your own instance or distribution of Floro, create custom plugins, generators and develop custom architectures and integrations based on your specific use cases and needs. Check out our website to "
                }
                <a style={{color: theme.colors.linkColor, fontWeight: 600}} onClick={onClickLearnMore}>learn more about the services we provide</a>
                {"."}
              </span>
            </BlurbText>
          </BlurbBox>
        </SectionContainer>
        {!props.organization?.hasAcknowledgedBetaPricing && (
          <ButtonContainer>
            <Button onClick={onAcknowledge} isLoading={acknowledgeRequest.loading} label={"acknowledge pricing"} bg={"orange"} size={"big"}/>
          </ButtonContainer>
        )}
        {props.organization?.hasAcknowledgedBetaPricing && (
        <ButtonContainer style={{ justifyContent: 'center'}}>
            <ThankYouText>
              {'Thank you for helping us beta test!'}
            </ThankYouText>
        </ButtonContainer>
        )}
      </InnerContainer>
    </Container>
  );
};

export default React.memo(OrgBilling);
