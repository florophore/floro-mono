import React, { useCallback} from "react";
import styled from "@emotion/styled";
import MuteRepoAnnouncementReplyAddedSetting from "./setting_boxes/MuteRepoAnnouncementReplyAddedSetting";
import MuteRepoWriteAccessGrantedSetting from "./setting_boxes/MuteRepoWriteAccessGrantedSetting";
import MuteMergeRequestBranchUpdatedSetting from "./setting_boxes/MuteMergeRequestBranchUpdatedSetting";
import MuteMergeRequestMergedOrClosedSetting from "./setting_boxes/MuteMergeRequestMergedOrClosedSetting";
import MuteMergeRequestReviewStatusChangedSetting from "./setting_boxes/MuteMergeRequestReviewStatusChangedSetting";
import MuteMergeRequestCommentAddedSetting from "./setting_boxes/MuteMergeRequestCommentAddedSetting";
import MuteMergeRequestCommentReplyAddedSetting from "./setting_boxes/MuteMergeRequestCommentReplyAddedSetting";
import ColorPalette from "@floro/styles/ColorPalette";

const Container = styled.div`
  height: 100%;
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

const SettingSectionText = styled.h3`
  font-weight: 500;
  font-size: 1.7rem;
  font-family: "MavenPro";
  color: ${ColorPalette.gray};
`;

interface Props {}

const UserNotificationsSettings = (props: Props) => {

  return (
    <Container>
      <InnerContainer>
        <TitleContainer>
          <Title>{"Notification Settings"}</Title>
        </TitleContainer>
        <SettingSectionText style={{marginTop: 24}}>
          {'Announcement Emails'}
        </SettingSectionText>
        <MuteRepoAnnouncementReplyAddedSetting/>
        <SettingSectionText style={{marginTop: 24}}>
          {'Repository Emails'}
        </SettingSectionText>
        <MuteRepoWriteAccessGrantedSetting/>
        <SettingSectionText style={{marginTop: 24}}>
          {'Merge Request Emails'}
        </SettingSectionText>
        <MuteMergeRequestBranchUpdatedSetting/>
        <MuteMergeRequestMergedOrClosedSetting/>
        <MuteMergeRequestReviewStatusChangedSetting/>
        <MuteMergeRequestCommentAddedSetting/>
        <MuteMergeRequestCommentReplyAddedSetting/>
      </InnerContainer>
    </Container>
  );
};

export default React.memo(UserNotificationsSettings);
