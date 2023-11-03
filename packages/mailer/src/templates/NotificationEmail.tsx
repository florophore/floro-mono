import React from 'react';
import {
    Mjml,
    MjmlHead,
    MjmlTitle,
    MjmlPreview,
    MjmlBody,
    MjmlSection,
    MjmlDivider,
    MjmlColumn,
    MjmlButton,
    MjmlImage,
    MjmlFont,
    MjmlText,
  } from 'mjml-react';
  import colorPalette from '@floro/styles/ColorPalette';
import {
  Notification
} from "@floro/graphql-schemas/src/generated/main-client-graphql";

export interface Props {
  assetHost: string;
  notification: Notification;
  repoName: string;
  notificationLink: string;
  mergeRequestName: string;
  eventName: string;
  firstName: string;
  performedByUserFullName: string;
  subjectLine: string;
  commentText: string;
  commentReplyText: string;
}

const NotificationEmail = (props: Props): React.ReactElement => {
  return (
    <Mjml>
      <MjmlHead>
          <MjmlTitle>{props.subjectLine}</MjmlTitle>
          <MjmlPreview>{props.subjectLine}</MjmlPreview>
          <MjmlFont name="Maven-Pro" href="https://fonts.googleapis.com/css?family=Maven%20Pro"/>
      </MjmlHead>
      <MjmlBody width={500}>
        <MjmlSection fullWidth backgroundColor={colorPalette.white}>
          <MjmlColumn width={500}>
            <MjmlImage width={200} src={`${props.assetHost}/email_images/floro_with_text_email.png`} />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection paddingTop={0}>
          <MjmlColumn>
            <MjmlText align={'center'} lineHeight={32} fontSize={32} color={colorPalette.mediumGray}>
                {`Hi ${props.firstName}!`}
            </MjmlText>
            <MjmlDivider width={'50%'} borderColor={colorPalette.mediumGray}/>
            {props.eventName == "REPO_ANNOUNCEMENT_REPLY_CREATED" && (
              <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                  {`${props.performedByUserFullName} replied `}
                  <i>{`"${props.commentReplyText}"`}</i>
                  {" to announcement "}
                  <b>{`"${props.commentText}"`}</b>
              </MjmlText>
            )}
            {props.eventName == "REPOSITORY_WRITE_ACCESS_GRANTED" && (
              <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                  {`${props.performedByUserFullName} granted you write access to the repository `}
                  <b>{`${props.repoName}`}</b>
              </MjmlText>
            )}
            {props.eventName == "MERGE_REQUEST_BRANCH_UPDATED" && (
              <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                  {`${props.performedByUserFullName} updated merge request `}
                  <b>{`${props.mergeRequestName}`}</b>
                  {" for repository "}
                  <b>{`${props.repoName}`}</b>
              </MjmlText>
            )}
            {props.eventName == "REVIEWER_ADDED" && (
              <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                  {`${props.performedByUserFullName} added you as a reviewer to `}
                  <b>{`${props.mergeRequestName}`}</b>
              </MjmlText>
            )}
            {props.eventName == "REVIEW_STATUS_ADDED" &&
                props?.notification?.reviewStatus?.approvalStatus == "approved" && (
              <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                  {`${props.performedByUserFullName} approved merge request `}
                  <b>{`${props.mergeRequestName}`}</b>
                  {" for repository "}
                  <b>{`${props.repoName}`}</b>
              </MjmlText>
            )}
            {props.eventName == "REVIEW_STATUS_CHANGED" &&
                props?.notification?.reviewStatus?.approvalStatus == "approved" && (
              <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                  {`${props.performedByUserFullName} changed review status to approved for merge request `}
                  <b>{`${props.mergeRequestName}`}</b>
                  {" for repository "}
                  <b>{`${props.repoName}`}</b>
              </MjmlText>
            )}
            {props.eventName == "REVIEW_STATUS_ADDED" &&
                props?.notification?.reviewStatus?.approvalStatus == "blocked" && (
              <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                  {`${props.performedByUserFullName} blocked merge request `}
                  <b>{`${props.mergeRequestName}`}</b>
                  {" for repository "}
                  <b>{`${props.repoName}`}</b>
              </MjmlText>
            )}
            {props.eventName == "REVIEW_STATUS_CHANGED" &&
                props?.notification?.reviewStatus?.approvalStatus == "blocked" && (
              <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                  {`${props.performedByUserFullName} changed review status to blocked for merge request `}
                  <b>{`${props.mergeRequestName}`}</b>
                  {" for repository "}
                  <b>{`${props.repoName}`}</b>
              </MjmlText>
            )}
            {props.eventName == "MERGE_REQUEST_CLOSED" &&
                props?.notification?.reviewStatus?.approvalStatus == "blocked" && (
              <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                  {`${props.performedByUserFullName} closed merge request `}
                  <b>{`${props.mergeRequestName}`}</b>
                  {" for repository "}
                  <b>{`${props.repoName}`}</b>
              </MjmlText>
            )}
            {props.eventName == "MERGE_REQUEST_MERGED" &&
                props?.notification?.reviewStatus?.approvalStatus == "blocked" && (
              <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                  {`${props.performedByUserFullName} merged merge request `}
                  <b>{`${props.mergeRequestName}`}</b>
                  {" for repository "}
                  <b>{`${props.repoName}`}</b>
              </MjmlText>
            )}
            {props.eventName == "MERGE_REQUEST_COMMENT_ADDED" && (
              <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                  {`${props.performedByUserFullName} commented on merge request `}
                  <b>{`${props.mergeRequestName}`}</b>
                  <i>{` "${props.commentText}"`}</i>
                  {" for repository "}
                  <b>{`${props.repoName}`}</b>
              </MjmlText>
            )}
            {props.eventName == "MERGE_REQUEST_COMMENT_REPLY_ADDED" && (
              <MjmlText align={'center'} lineHeight={32} fontSize={20} color={colorPalette.mediumGray}>
                  {`${props.performedByUserFullName} replied`}
                  <i>{` "${props.commentReplyText}"`}</i>
                  {" to comment "}
                  <i>{` "${props.commentReplyText}"`}</i>
                  {" on merge request "}
                  <b>{`${props.mergeRequestName}`}</b>
                  {" for repository "}
                  <b>{`${props.repoName}`}</b>
              </MjmlText>
            )}
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection paddingTop={0}>
          <MjmlColumn>
            <MjmlButton
              href={props.notificationLink}
              backgroundColor={colorPalette.purple}
              borderRadius={8}
              width={300}
              height={60}
              fontSize={20}
            >
              {props.eventName == "REPO_ANNOUNCEMENT_REPLY_CREATED" && (
                <MjmlText fontFamily={"Maven-Pro"} fontWeight={600}>
                    {"view announcement"}
                </MjmlText>
              )}
              {props.eventName == "REPOSITORY_WRITE_ACCESS_GRANTED" && (
                <MjmlText fontFamily={"Maven-Pro"} fontWeight={600}>
                    {"view repository"}
                </MjmlText>
              )}
              {props.eventName == "MERGE_REQUEST_BRANCH_UPDATED" && (
                <MjmlText fontFamily={"Maven-Pro"} fontWeight={600}>
                    {"view merge request"}
                </MjmlText>
              )}
              {props.eventName == "REVIEWER_ADDED" && (
                <MjmlText fontFamily={"Maven-Pro"} fontWeight={600}>
                    {"view merge request"}
                </MjmlText>
              )}
              {props.eventName == "REVIEW_STATUS_ADDED" && (
                <MjmlText fontFamily={"Maven-Pro"} fontWeight={600}>
                    {"view merge request"}
                </MjmlText>
              )}
              {props.eventName == "REVIEW_STATUS_CHANGED" && (
                <MjmlText fontFamily={"Maven-Pro"} fontWeight={600}>
                    {"view merge request"}
                </MjmlText>
              )}
              {props.eventName == "MERGE_REQUEST_CLOSED" && (
                <MjmlText fontFamily={"Maven-Pro"} fontWeight={600}>
                    {"view merge request"}
                </MjmlText>
              )}
              {props.eventName == "MERGE_REQUEST_MERGED" && (
                <MjmlText fontFamily={"Maven-Pro"} fontWeight={600}>
                    {"view merge request"}
                </MjmlText>
              )}
              {props.eventName == "MERGE_REQUEST_COMMENT_ADDED" && (
                <MjmlText fontFamily={"Maven-Pro"} fontWeight={600}>
                    {"view merge request"}
                </MjmlText>
              )}
              {props.eventName == "MERGE_REQUEST_COMMENT_REPLY_ADDED" && (
                <MjmlText fontFamily={"Maven-Pro"} fontWeight={600}>
                    {"view merge request"}
                </MjmlText>
              )}
            </MjmlButton>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  );
};

export const mock: Props = {
  assetHost: "http://localhost:5173",
  notification: {},
  repoName: "@test/repo",
  notificationLink: "https://floro.io/notification/abc",
  mergeRequestName: "[1] First Merge Request",
  eventName: "REPO_ANNOUNCEMENT_REPLY_CREATED",
  firstName: "Jamie",
  performedByUserFullName: "Jacqueline Ho",
  subjectLine: "Here is the subject",
  commentText: "Some comment.",
  commentReplyText: "Here is a reply."
}

export const writeAccessMock: Props = {
  assetHost: "http://localhost:5173",
  notification: {},
  repoName: "@test/repo",
  notificationLink: "https://floro.io/notification/abc",
  mergeRequestName: "[1] First Merge Request",
  eventName: "REPOSITORY_WRITE_ACCESS_GRANTED",
  firstName: "Jamie",
  performedByUserFullName: "Jacqueline Ho",
  subjectLine: "Here is the subject",
  commentText: "Some comment.",
  commentReplyText: "Here is a reply."
}

export const branchUpdatedMock: Props = {
  assetHost: "http://localhost:5173",
  notification: {},
  repoName: "@test/repo",
  notificationLink: "https://floro.io/notification/abc",
  mergeRequestName: "[1] First Merge Request",
  eventName: "MERGE_REQUEST_BRANCH_UPDATED",
  firstName: "Jamie",
  performedByUserFullName: "Jacqueline Ho",
  subjectLine: "Here is the subject",
  commentText: "Some comment.",
  commentReplyText: "Here is a reply."
}

export const reviewerAddedMock: Props = {
  assetHost: "http://localhost:5173",
  notification: {},
  repoName: "@test/repo",
  notificationLink: "https://floro.io/notification/abc",
  mergeRequestName: "[1] First Merge Request",
  eventName: "REVIEWER_ADDED",
  firstName: "Jamie",
  performedByUserFullName: "Jacqueline Ho",
  subjectLine: "Here is the subject",
  commentText: "Some comment.",
  commentReplyText: "Here is a reply."
}

export const reviewStatusAddedApprovedMock: Props = {
  assetHost: "http://localhost:5173",
  notification: {
    reviewStatus: {
      approvalStatus: "approved"
    }
  },
  repoName: "@test/repo",
  notificationLink: "https://floro.io/notification/abc",
  mergeRequestName: "[1] First Merge Request",
  eventName: "REVIEW_STATUS_ADDED",
  firstName: "Jamie",
  performedByUserFullName: "Jacqueline Ho",
  subjectLine: "Here is the subject",
  commentText: "Some comment.",
  commentReplyText: "Here is a reply."
}

export const reviewStatusAddedBlockeddMock: Props = {
  assetHost: "http://localhost:5173",
  notification: {
    reviewStatus: {
      approvalStatus: "blocked"
    }
  },
  repoName: "@test/repo",
  notificationLink: "https://floro.io/notification/abc",
  mergeRequestName: "[1] First Merge Request",
  eventName: "REVIEW_STATUS_ADDED",
  firstName: "Jamie",
  performedByUserFullName: "Jacqueline Ho",
  subjectLine: "Here is the subject",
  commentText: "Some comment.",
  commentReplyText: "Here is a reply."
}

export const reviewStatusChangedApprovedMock: Props = {
  assetHost: "http://localhost:5173",
  notification: {
    reviewStatus: {
      approvalStatus: "approved"
    }
  },
  repoName: "@test/repo",
  notificationLink: "https://floro.io/notification/abc",
  mergeRequestName: "[1] First Merge Request",
  eventName: "REVIEW_STATUS_CHANGED",
  firstName: "Jamie",
  performedByUserFullName: "Jacqueline Ho",
  subjectLine: "Here is the subject",
  commentText: "Some comment.",
  commentReplyText: "Here is a reply."
}

export const reviewStatusChangedBlockeddMock: Props = {
  assetHost: "http://localhost:5173",
  notification: {
    reviewStatus: {
      approvalStatus: "blocked"
    }
  },
  repoName: "@test/repo",
  notificationLink: "https://floro.io/notification/abc",
  mergeRequestName: "[1] First Merge Request",
  eventName: "REVIEW_STATUS_CHANGED",
  firstName: "Jamie",
  performedByUserFullName: "Jacqueline Ho",
  subjectLine: "Here is the subject",
  commentText: "Some comment.",
  commentReplyText: "Here is a reply."
}

export const mergeRequestClosedMock: Props = {
  assetHost: "http://localhost:5173",
  notification: {
    reviewStatus: {
      approvalStatus: "blocked"
    }
  },
  repoName: "@test/repo",
  notificationLink: "https://floro.io/notification/abc",
  mergeRequestName: "[1] First Merge Request",
  eventName: "MERGE_REQUEST_CLOSED",
  firstName: "Jamie",
  performedByUserFullName: "Jacqueline Ho",
  subjectLine: "Here is the subject",
  commentText: "Some comment.",
  commentReplyText: "Here is a reply."
}

export const mergeRequestMergedMock: Props = {
  assetHost: "http://localhost:5173",
  notification: {
    reviewStatus: {
      approvalStatus: "blocked"
    }
  },
  repoName: "@test/repo",
  notificationLink: "https://floro.io/notification/abc",
  mergeRequestName: "[1] First Merge Request",
  eventName: "MERGE_REQUEST_MERGED",
  firstName: "Jamie",
  performedByUserFullName: "Jacqueline Ho",
  subjectLine: "Here is the subject",
  commentText: "Some comment.",
  commentReplyText: "Here is a reply."
}

export const mergeRequestCommentedAddedMock: Props = {
  assetHost: "http://localhost:5173",
  notification: {
    reviewStatus: {
      approvalStatus: "blocked"
    }
  },
  repoName: "@test/repo",
  notificationLink: "https://floro.io/notification/abc",
  mergeRequestName: "[1] First Merge Request",
  eventName: "MERGE_REQUEST_COMMENT_ADDED",
  firstName: "Jamie",
  performedByUserFullName: "Jacqueline Ho",
  subjectLine: "Here is the subject",
  commentText: "Some comment.",
  commentReplyText: "Here is a reply."
}

export const mergeRequestCommentedReplyAddedMock: Props = {
  assetHost: "http://localhost:5173",
  notification: {
    reviewStatus: {
      approvalStatus: "blocked"
    }
  },
  repoName: "@test/repo",
  notificationLink: "https://floro.io/notification/abc",
  mergeRequestName: "[1] First Merge Request",
  eventName: "MERGE_REQUEST_COMMENT_REPLY_ADDED",
  firstName: "Jamie",
  performedByUserFullName: "Jacqueline Ho",
  subjectLine: "Here is the subject",
  commentText: "Some comment.",
  commentReplyText: "Here is a reply."
}

export default NotificationEmail;