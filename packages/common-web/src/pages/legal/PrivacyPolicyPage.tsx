import styled from "@emotion/styled";
import { usePlainText, useRichText } from "../../floro_listener/hooks/locales";
import { Helmet } from "react-helmet";
import PageWrapper from "../../components/wrappers/PageWrapper";

const AboutWrapper = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: ${(props) => props.theme.background};
  padding-top: 48px;
`;

const SectionParagraph = styled.div`
  font-size: 1.44rem;
  font-weight: 400;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
`;

function PrivacyPolicyPage() {
  const privacyMetaTitle = usePlainText("meta_tags.privacy_policy");
  const privacyPolicy = useRichText("legal.privacy_policy");
  return (
    <PageWrapper isCentered>
      <Helmet>
        <title>{privacyMetaTitle}</title>
      </Helmet>
      <AboutWrapper>
        <div
          style={{
            paddingTop: 16,
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: 32,
          }}
        >
          <SectionParagraph>{privacyPolicy}</SectionParagraph>
        </div>
      </AboutWrapper>
    </PageWrapper>
  );
}

export default PrivacyPolicyPage;
