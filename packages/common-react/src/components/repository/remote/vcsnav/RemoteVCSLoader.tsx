import React, {
} from "react";
import {
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";

const InnerContent = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

const LoaderContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: center;
  justify-content: center;
  align-items: center;
`;

const RemoteVCSAnnouncement = () => {
  const theme = useTheme();

  return (
    <>
      <InnerContent>
        <LoaderContainer>
          <DotsLoader size={"large"} color={theme.name == "light" ? "purple" : "lightPurple"}/>
        </LoaderContainer>
      </InnerContent>
    </>
  );
};
export default React.memo(RemoteVCSAnnouncement);
