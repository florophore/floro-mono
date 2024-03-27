
import React, { useMemo } from "react";

import RootModal from "@floro/common-react/src/components/RootModal";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
// eslint-disable-next-line import/no-named-as-default
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";
import { useIcon } from "../../floro_listener/FloroIconsProvider";
import { DownloadLink } from "./downloads";
import { useRichText } from "../../floro_listener/hooks/locales";

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const HeaderTitle = styled.div`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-align: center;
  color: ${ColorPalette.white};
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  max-width: calc(100% - 16px);
  padding: 24px;
`;

const TopContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const WarningIcon = styled.img`
  height: 96px;
  width: 96px;
`;

const VersionText = styled.h6`
  padding: 0;
  margin: 24px 0 0 0;
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-align: center;
  color: ${(props) => props.theme.colors.releaseTextColor};
`;

const PromptText = styled.p`
  padding: 0;
  margin: 24px 0 0 0;
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 500;
  text-align: center;
  color: ${(props) => props.theme.colors.promptText};
`;

const BottomContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;



export interface Props {
  onDismiss: () => void;
  show?: boolean;
}

const MobileDownloadReminderModal = (props: Props) => {
  const theme = useTheme();
  const debian = useIcon("front-page.debian", "default", "dark");
  const rpm = useIcon("front-page.red-hat", "default", "dark");
  const icon = useIcon("front-page.floro-round");
  const pickLinux = useRichText("installation.pick_linux_installation");
  const done = useRichText("installation.done");
  const rpmInstallation = useRichText("installation.install_linux", { distribution: "rpm (x86 64)"})
  const debianInstallation = useRichText("installation.install_linux", { distribution: "debian (amd 64)"})
  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{pickLinux}</HeaderTitle>
      </HeaderContainer>
    );
  }, [pickLinux]);

  return (
    <RootModal
      headerSize="small"
      headerChildren={title}
      show={props.show}
      onDismiss={props.onDismiss}
    >
      <ContentContainer>
        <>
          <TopContentContainer>
            <WarningIcon src={icon} />
            <div
              style={{
                marginTop: 48,
                width: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DownloadLink style={{display: "block", width: 400}} type={"deb"}>
                <Button
                  label={
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingLeft: 24,
                        paddingRight: 36,
                      }}
                    >
                      <img
                        style={{
                          height: 32,
                          width: 32,
                          marginRight: 16,
                        }}
                        src={debian}
                      />
                      <span style={{width: 300}}>{debianInstallation}</span>
                    </div>
                  }
                  bg={"purple"}
                  size={"extra-big"}
                />
              </DownloadLink>
            </div>
            <div
              style={{
                marginTop: 24,
                width: 400,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DownloadLink style={{display: "block", width: 400}} type={"rpm"}>
                <Button
                  label={
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingLeft: 24,
                        paddingRight: 36,
                      }}
                    >
                      <img
                        style={{
                          height: 32,
                          width: 32,
                          marginRight: 16,
                        }}
                        src={rpm}
                      />
                      <span style={{width: 300}}>{rpmInstallation}</span>
                    </div>
                  }
                  bg={"teal"}
                  size={"extra-big"}
                />
              </DownloadLink>
            </div>
          </TopContentContainer>
          <BottomContentContainer>
            <Button
              onClick={props.onDismiss}
              label={done}
              bg={"orange"}
              size={"extra-big"}
            />
          </BottomContentContainer>
        </>
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(MobileDownloadReminderModal);