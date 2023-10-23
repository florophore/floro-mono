import React, { useMemo } from "react";
import { Plugin } from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Button from "../../design-system/Button";
import LinkWhite from "@floro/common-assets/assets/images/icons/link.dark.svg";
import { Organization } from "@floro/graphql-schemas/build/generated/main-client-graphql";

const Container = styled.div`
  height: 100%;
  max-width: 100%;
  overflow-x: scroll;
  padding: 24px;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 528px;
  margin-bottom: 48px;
`;

const Icon = styled.img`
  width: 80px;
  height: 80px;
  margin-right: 24px;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const SectionContainer = styled.div`
  max-width: 528px;
  margin-bottom: 48px;
`;

const SectionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
  margin-bottom: 24px;
`;

const BlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
`;

const BlurbText = styled.p`
  color: ${(props) => props.theme.colors.blurbBorder};
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  white-space: pre-wrap;
`;

const ButtonContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  width: 100%;
`;

const ButtonIcon = styled.img`
  height: 32px;
  width: 32px;
`;

const ButtonText = styled.span`
  display: block;
  flex-grow: 1;
  text-align: center;
`;

const blurbText = (name) => ({
  __html: `Congratulations on registering ${name}!

If this is your first time creating a plugin, you may find the
documentation listed below helpful in getting started.
Otherewise feel free to run the following command from the
floro cli to start building.

<b>$</b> <b style="user-select: all;">floro create-plugin ${name}</b>

We can't wait to see what you make!
`,
});

export interface Props {
  currentPlugin?: Plugin | null;
  organization?: Organization;
  icons: { [key: string]: string };
  onPressOpenDocs?: () => void;
}

const PluginNoVersion = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo(() => {
    if (theme.name == "light") {
      return (
        props.icons?.[props.currentPlugin?.selectedLightIcon as string] ??
        props.currentPlugin?.selectedLightIcon
      );
    }
    return (
      props.icons?.[props.currentPlugin?.selectedDarkIcon as string] ??
      props.currentPlugin?.selectedDarkIcon
    );
  }, [
    theme.name,
    props.icons,
    props.currentPlugin?.selectedDarkIcon,
    props.currentPlugin?.selectedLightIcon,
  ]);
  return (
    <Container>
      <TopContainer>
        <Icon src={icon} />
        <Title>{props.currentPlugin?.displayName}</Title>
      </TopContainer>
      <SectionContainer>
        <SectionTitle>{"Introduction"}</SectionTitle>
        <BlurbBox>
          <BlurbText
            dangerouslySetInnerHTML={blurbText(props.currentPlugin?.name)}
          />
        </BlurbBox>
      </SectionContainer>
      <SectionContainer>
        <SectionTitle>{"Documentation"}</SectionTitle>
        <Button
          onClick={props.onPressOpenDocs}
          label={
            <ButtonContentWrapper>
              <ButtonIcon src={LinkWhite} />
              <ButtonText>{"Documentation"}</ButtonText>
            </ButtonContentWrapper>
          }
          bg={"orange"}
          size={"big"}
        />
      </SectionContainer>
    </Container>
  );
};

export default React.memo(PluginNoVersion);
