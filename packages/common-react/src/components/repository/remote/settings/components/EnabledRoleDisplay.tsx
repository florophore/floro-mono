import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  useUpdateAnyoneCanChangeSettingsMutation,
  RepoBranch,
  Repository,
  User,
  OrganizationRole,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import TimeAgo from "javascript-time-ago";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";

import en from "javascript-time-ago/locale/en";
import PaginationToggle from "@floro/storybook/stories/repo-components/PaginationToggle";
import { useNavigate } from "react-router";
import ColorPalette, {
  ColorPalette as ColorPaletteType,
} from "@floro/styles/ColorPalette";
import { Branch } from "floro/dist/src/repo";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import Button from "@floro/storybook/stories/design-system/Button";
import { useRepoLinkBase } from "../../hooks/remote-hooks";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import { useSession } from "../../../../../session/session-context";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";

const Container = styled.div`
  width: 100%;
  padding: 8px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  border-radius: 8px;
  position: relative;
`;

const MainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justift-content: space-between;
  position: relative;
`;

const LeftContainer = styled.div`
  margin-right: 12px;
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleContainer = styled.div`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const PillContainer = styled.div`
  height: 32px;
  background: ${(props) => props.theme.colors.titleText};
  margin-left: 8px;
  margin-right: 8px;
  margin-top: 4px;
  margin-bottom: 4px;
  border-radius: 6px;
  padding: 4px 12px 4px 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
`;

const PillText = styled.span`
  padding: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${ColorPalette.white};
`;

const PlaceholderText = styled.span`
  padding: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  margin-top: 8px;
  margin-left: 6px;
  color: ${(props) => props.theme.colors.standardTextLight};
`;

const LabelContainer = styled.div`
  position: absolute;
  top: -16px;
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
  color: ${(props) => props.theme.colors.inputLabelTextColor};
`;

const LabelBorderEnd = styled.div`
  position: absolute;
  height: 2px;
  width: 2px;
  border-radius: 50%;
  top: 14px;
  transition: 500ms background-color;
  color: ${(props) => props.theme.colors.inputLabelTextColor};
`;

const findFirstChar = (str: string) => {
  for (let i = 0; i < str.length; ++i) {
    if (/[A-z]/.test(str[i])) return str[i].toUpperCase();
  }
  return "";
};

const upcaseFirst = (str: string) => {
  const firstChar = findFirstChar(str);
  const pos = str.toLowerCase().indexOf(firstChar.toLowerCase());
  return firstChar + str.substring(pos + 1);
};

interface Props {
  repository: Repository;
  enabledRoles: OrganizationRole[];
  onClickShow: () => void;
  label: string;
}

const EnabledRoleDisplay = (props: Props) => {
  return (
    <Container>
      <LabelContainer>
        <LabelBorderEnd style={{ left: -1 }} />
        <LabelText>{props?.label}</LabelText>
        <LabelBorderEnd style={{ right: -1 }} />
      </LabelContainer>
      <MainContainer>
        <LeftContainer>
          {props?.enabledRoles.length == 0 && (
            <PlaceholderText>{"No Roles Selected"}</PlaceholderText>
          )}
          {props.enabledRoles.map((role, index) => {
            return (
              <PillContainer key={index}>
                <PillText>{upcaseFirst(role.name ?? "")}</PillText>
              </PillContainer>
            );
          })}
        </LeftContainer>
        <RightContainer>
          <div style={{ width: 120 }}>
            <Button
              onClick={props.onClickShow}
              label={"edit roles"}
              bg={"teal"}
              size={"small"}
            />
          </div>
        </RightContainer>
      </MainContainer>
    </Container>
  );
};

export default React.memo(EnabledRoleDisplay);
