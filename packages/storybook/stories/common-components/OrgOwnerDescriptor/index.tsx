import React, {
  useMemo,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import InitialProfileDefault from "../InitialProfileDefault";
import UserProfilePhoto from "../UserProfilePhoto";
import { Organization, User } from "@floro/graphql-schemas/build/generated/main-graphql";
import OrgProfilePhoto from "../OrgProfilePhoto";

export interface Props {
  label: string;
  organization: Organization;
  offlinePhoto?: string|null;
}

const Container = styled.div`
  margin-top: 14px;
  position: relative;
  height: 64px;
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  transition: 500ms border-color;
  user-select: none;
  min-width: 150px;
`;

const LabelContainer = styled.div`
  position: relative;
  height: 32;
  top: -16px;
  left: 32px;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.colors.inputLabelTextColor};
  padding: 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const LabelText = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  transition: 500ms color;
  user-select: none;
`;

const LabelBorderEnd = styled.div`
  position: absolute;
  height: 2px;
  width: 2px;
  border-radius: 50%;
  top: 14px;
  transition: 500ms background-color;
`;

const InfoContainer = styled.div`
  position: relative;
  width: 100%;
  box-sizing: border-box;
  height: 100%;
  top: -27px;
  border: none;
  outline: none;
  padding: 0 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-radius: 6px;

`;

const UsernameText = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.44rem;
  transition: 500ms color;
  color: ${props => props.theme.colors.ownerDescriptorUsernameColor};
  margin-left: 8px;
`;

const OrgOwnerDescriptor = ({
  label,
  organization,
  offlinePhoto = null
}: Props): React.ReactElement => {
  const theme = useTheme();
  const usernameFormatted = useMemo(() => "@"+ organization?.handle,[organization?.handle]);
  return (
    <div>
      <Container
        style={{ border: `2px solid ${theme.colors.inputBorderColor}` }}
      >
        <LabelContainer>
          <LabelBorderEnd
            style={{ left: -1, background: theme.colors.inputBorderColor }}
          />
          <LabelText style={{ color: theme.colors.inputLabelTextColor }}>
            {label}
          </LabelText>
          <LabelBorderEnd style={{ right: -1 }} />
        </LabelContainer>
        <InfoContainer>
          <OrgProfilePhoto
            organization={organization}
            size={40}
            offlinePhoto={offlinePhoto}
          />
          <UsernameText>{usernameFormatted}</UsernameText>
        </InfoContainer>
      </Container>
    </div>
  );
};

export default React.memo(OrgOwnerDescriptor);