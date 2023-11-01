import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import ColorPalette from "@floro/styles/ColorPalette";
import { useSession } from "../../session/session-context";
import OrgProfilePhoto from "@floro/storybook/stories/common-components/OrgProfilePhoto";
import {
  useOfflinePhoto,
  useOfflinePhotoMap,
} from "../../offline/OfflinePhotoContext";
import { useUserOrganizations } from "../../hooks/offline";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import { useNavigationAnimatorContext } from "../../navigation/navigation-animator";

const Navigator = styled.nav`
  width: 72px;
  border-right: 1px solid ${ColorPalette.lightPurple};
  padding: 0;
  margin: 0;
  position: relative;
  background: ${(props) => props.theme.background};
`;

const NavOptionHighlight = styled.div`
  z-index: 0;
  position: absolute;
  top: 0px;
  left: 0px;
  height: 72px;
  width: 72px;
`;

const DragFill = styled.div`
  flex: 1;
  height: 100%;
  -webkit-app-region: drag;
  cursor: drag;
`;

const NavOptionList = styled.div`
  z-index: 0;
  width: 72px;
  display: flex;
  flex-direction: column;
`;
const NavOption = styled.div`
  z-index: 0;
  height: 72px;
  width: 72px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  position: relative;
`;

const Drag = css`
  -webkit-app-region: drag;
  cursor: drag;
`;

const OfflineIndicatorWrapper = styled.div`
  position: absolute;
  left: calc(50% - 72px);
  background-color: ${(props) => props.theme.colors.offlineWarningTabColor};
  height: 36px;
  width: 144px;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: bottom 300ms;
`;

const OfflineText = styled.span`
  color: ${ColorPalette.white};
  font-weight: 600;
  font-size: 1.2rem;
  font-family: "MavenPro";
  text-align: center;
`;

const NotificationCircle = styled.div`
  height: 24px;
  width: 24px;
  background: ${ColorPalette.lightRed};
  border: 2px solid ${ColorPalette.white};
  border-radius: 50%;
  position: absolute;
  top: 4px;
  right: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const NotificationCount = styled.span`
  font-family: "MavenPro";
  color: ${ColorPalette.white};
  font-weight: 700;
  font-size: 0.7rem;
`;

const mainVariants = {
  open: {
    right: 0,
  },
  closed: {
    right: "-100%",
  },
};

interface Props {
  organizationId?: string | null;
  page: string;
  outerNavTab: string;
}

const UserOrgNavigator = (props: Props) => {
  const { currentUser } = useSession();
  const offlinePhoto = useOfflinePhoto(currentUser?.profilePhoto ?? null);
  const offlinePhotoMap = useOfflinePhotoMap();
  const organizations = useUserOrganizations();
  const homeHighlightBackground = useMemo(() => {
    return props.outerNavTab == "home" ? ColorPalette.lightPurple : "none";
  }, [props.outerNavTab]);

  const showNotificationCount = useMemo(() => {
    return (currentUser?.unreadNotificationsCount ?? 0) > 0;
  }, [currentUser?.unreadNotificationsCount])

  const notificationsCount = useMemo(() => {
    const count = (currentUser?.unreadNotificationsCount ?? 0);
    if (count > 10) {
      return '10+';
    }
    return count;
  }, [currentUser?.unreadNotificationsCount])

  return (
    <Navigator>
      <NavOptionList>
        <NavOption
          style={{
            backgroundColor: homeHighlightBackground,
          }}
        >
          {currentUser && (
            <Link
              to={"/home"}
              style={{ textDecoration: "none", display: "contents" }}
            >
              <UserProfilePhoto
                user={currentUser}
                size={56}
                offlinePhoto={offlinePhoto}

              />
              {showNotificationCount && (
                <NotificationCircle>
                  <NotificationCount>{notificationsCount}</NotificationCount>
                </NotificationCircle>
              )}
            </Link>
          )}
        </NavOption>
        {organizations?.map((organization, index) => {
          const offlinePhoto = organization?.profilePhoto?.hash
            ? offlinePhotoMap?.[organization.profilePhoto.hash] ?? null
            : null;
          return (
            <NavOption
              key={organization.id}
              style={{
                backgroundColor:
                  props?.organizationId == organization.id
                    ? ColorPalette.lightPurple
                    : "none",
              }}
            >
              <Link
                to={`/org/@/${organization.handle}`}
                style={{ textDecoration: "none", display: "contents" }}
              >
                <OrgProfilePhoto
                  organization={organization}
                  size={56}
                  offlinePhoto={offlinePhoto}
                />
              </Link>
            </NavOption>
          );
        })}
      </NavOptionList>
    </Navigator>
  );
};

export default React.memo(UserOrgNavigator);
