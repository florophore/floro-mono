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
  ProtectedBranchRule,
  RepoBranch,
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import TimeAgo from "javascript-time-ago";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";

import en from "javascript-time-ago/locale/en";
import PaginationToggle from "@floro/storybook/stories/repo-components/PaginationToggle";
import { useNavigate } from "react-router";
import ColorPalette from "@floro/styles/ColorPalette";
import { Branch } from "floro/dist/src/repo";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import Button from "@floro/storybook/stories/design-system/Button";
import { useColorTheme } from "@floro/common-web/src/hooks/ColorThemeProvider";
import InputSelector, {
  Option,
} from "@floro/storybook/stories/design-system/InputSelector";

const Container = styled.div`
  margin-top: 24px;
  width: 100%;
  max-width: 960px;
  padding: 16px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  border-radius: 8px;
`;

const Title = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

const TitleContainer = styled.div`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const SubTitle = styled.p`
  margin-top: 8px;
  padding: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.standardTextLight};
`;

const BottomContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const options = [
  {
    label: "System Default",
    value: "system",
  },
  {
    label: "Light",
    value: "light",
  },
  {
    label: "Dark",
    value: "dark",
  },
];

interface Props {}

const SetSystemTheme = (props: Props) => {
  const { themePreference, selectColorTheme } = useColorTheme();

  const onChange = useCallback((option: Option<unknown> | null) => {
    if (option?.value == "system") {
      selectColorTheme("system");
    }
    if (option?.value == "light") {
      selectColorTheme("light");
    }
    if (option?.value == "dark") {
      selectColorTheme("dark");
    }
  }, []);

  return (
    <>
      <Container>
        <Title>{"Color Theme Preference"}</Title>
        <SubTitle>
          {
            "Select your preferred color theme. By default Floro will use your operating system's default color theme."
          }
        </SubTitle>
        <BottomContainer style={{ marginTop: 12 }}>
          <InputSelector
            options={options}
            label={"theme preference"}
            placeholder={"select theme"}
            onChange={onChange}
            value={themePreference}
          />
        </BottomContainer>
      </Container>
    </>
  );
};

export default React.memo(SetSystemTheme);
