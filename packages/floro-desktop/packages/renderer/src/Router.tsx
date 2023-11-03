import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoadingPage from './loader/LoadingPage';
import LoggedOutPage from './loggedout/LoggedOutPage';
import CompleteSignupPage from './complete_signup/CompleteSignupPage';
import HomePage from './home/HomePage';
import CreateOrgPage from './create_org/CreateOrgPage';
import {AnimatePresence} from 'framer-motion';
import CreateUserRepoPage from './create_user_repo/CreateUserRepoPage';
import OrganizationPage from './organization/OrganizationPage';
import CreateOrgRepoPage from './create_org_repo/CreateOrgRepoPage';
import RepoHomePage from './repository/RepoHomePage';
import UserPluginsPage from './user_plugins/UserPluginsPage';
import RepoHistoryPage from './repository/RepoHistoryPage';
import RepoCreateMergeRequestPage from './repository/RepoCreateMergeRequestPage';
import RepoMergeRequestHistoryPage from './repository/RepoMergeRequestHistoryPage';
import RepoMergeRequestPage from './repository/RepoMergeRequestPage';
import OrganizationMembersPage from './member_management/OrganizationMembersPage';
import OrganizationInvitationsPage from './member_management/OrganizationInvitationsPage';
import OrganizationRolesPage from './member_management/OrganizationRolesPage';
import RepoHomeSettingsPage from './repository/RepoHomeSettingsPage';
import RepoHomeBranchRuleSettingsPage from './repository/RepoHomeBranchRuleSettingsPage';
import UserLocalApiHome from './apikeys/UserLocalApiHome';
import UserRemoteApiHome from './apikeys/UserRemoteApiHome';
import UserLocalWebhookHome from './apikeys/UserLocalWebhookHome';
import UserRemoteWebhookHome from './apikeys/UserRemoteWebhookHome';
import OrgRemoteApiHome from './apikeys/OrgRemoteApiHome';
import OrgRemoteWebhookHome from './apikeys/OrgRemoteWebhookHome';
import RepoHomeApiSettingsPage from './repository/RepoHomeApiSettingsPage';
import UserProfilePage from './user_profile/UserProfilePage';
import UserProfilePluginsPage from './user_plugins/UserProfilePluginsPage';
import OrgPluginsPage from './org_plugins/OrgPluginsPage';
import RepoAnnouncementsPage from './repository/RepoAnnouncementsPage';
import RepoAnnouncementPage from './repository/RepoAnnouncementPage';
import UserGeneralSettingsPage from './user_settings/UserGeneralSettingsPage';
import UserPrivacySettingsPage from './user_settings/UserPrivacySettingsPage';
import UserNotificationsSettingsPage from './user_settings/UserNotificationsSettingsPage';

const Router = (): React.ReactElement => {
    const location = useLocation();
    return (
      <AnimatePresence>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LoadingPage isOpen={location.pathname == '/'}/>} />
          <Route path="/loggedout" element={<LoggedOutPage isOpen={location.pathname == '/loggedout'} />} />
          <Route path="/complete_signup" element={<CompleteSignupPage isOpen={location.pathname == '/complete_signup'} />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/home/create-org" element={<CreateOrgPage />} />
          <Route path="/home/create-repo" element={<CreateUserRepoPage />} />
          <Route path="/home/plugins/:plugin/v/:version" element={<UserPluginsPage />} />
          <Route path="/home/plugins/:plugin" element={<UserPluginsPage />} />
          <Route path="/home/plugins" element={<UserPluginsPage />} />

          <Route path="/home/settings/notifications" element={<UserNotificationsSettingsPage />} />
          <Route path="/home/settings/privacy" element={<UserPrivacySettingsPage />} />
          <Route path="/home/settings" element={<UserGeneralSettingsPage />} />

          <Route path="/home/local/api" element={<UserLocalApiHome />} />
          <Route path="/home/local/webhooks" element={<UserLocalWebhookHome />} />
          <Route path="/home/remote/api" element={<UserRemoteApiHome/>} />
          <Route path="/home/remote/webhooks" element={<UserRemoteWebhookHome />} />

          <Route path="/org/@/:handle" element={<OrganizationPage />} />
          <Route path="/org/@/:handle/create-repo" element={<CreateOrgRepoPage/>} />
          <Route path="/org/@/:handle/members" element={<OrganizationMembersPage/>} />
          <Route path="/org/@/:handle/invitations" element={<OrganizationInvitationsPage/>} />
          <Route path="/org/@/:handle/roles" element={<OrganizationRolesPage/>} />

          <Route path="/org/@/:handle/remote/api" element={<OrgRemoteApiHome/>} />
          <Route path="/org/@/:handle/remote/webhooks" element={<OrgRemoteWebhookHome/>} />

          <Route path="/org/@/:handle/settings" element={<OrganizationRolesPage/>} />

          <Route path="/org/@/:handle/billing/overview" element={<OrganizationRolesPage/>} />
          <Route path="/org/@/:handle/billing/payment-details" element={<OrganizationRolesPage/>} />
          <Route path="/org/@/:handle/billing/invoices" element={<OrganizationRolesPage/>} />

          <Route path="/user/@/:handle/plugins" element={<UserProfilePluginsPage />} />
          <Route path="/user/@/:handle/plugins/:plugin" element={<UserProfilePluginsPage />} />
          <Route path="/user/@/:handle/plugins/:plugin/v/:version" element={<UserProfilePluginsPage />} />

          <Route path="/user/@/:handle" element={<UserProfilePage />} />


          <Route path="/org/@/:handle/plugins/:plugin/v/:version" element={<OrgPluginsPage/>} />
          <Route path="/org/@/:handle/plugins/:plugin" element={<OrgPluginsPage/>} />
          <Route path="/org/@/:handle/plugins" element={<OrgPluginsPage/>}/>

          <Route path="/repo/@/:ownerHandle/:repoName/history" element={<RepoHistoryPage page={'history'}/>} />
          <Route path="/repo/@/:ownerHandle/:repoName/announcements/:repoAnnouncementId" element={<RepoAnnouncementPage/>} />
          <Route path="/repo/@/:ownerHandle/:repoName/announcements" element={<RepoAnnouncementsPage/>} />
          <Route path="/repo/@/:ownerHandle/:repoName/settings" element={<RepoHomeSettingsPage/>} />
          <Route path="/repo/@/:ownerHandle/:repoName/settings/api" element={<RepoHomeApiSettingsPage/>} />
          <Route path="/repo/@/:ownerHandle/:repoName/settings/branchrules/:branchRuleId" element={<RepoHomeBranchRuleSettingsPage/>} />
          <Route path="/repo/@/:ownerHandle/:repoName/mergerequests/create/:branchId" element={<RepoCreateMergeRequestPage/>} />
          <Route path="/repo/@/:ownerHandle/:repoName/mergerequests/:mergeRequestId/review" element={<RepoMergeRequestPage/>} />
          <Route path="/repo/@/:ownerHandle/:repoName/mergerequests/:mergeRequestId" element={<RepoMergeRequestPage/>} />
          <Route path="/repo/@/:ownerHandle/:repoName/mergerequests" element={<RepoMergeRequestHistoryPage/>} />
          <Route path="/repo/@/:ownerHandle/:repoName/openbranches" element={<RepoMergeRequestHistoryPage/>} />
          <Route path="/repo/@/:ownerHandle/:repoName" element={<RepoHomePage page={'home'}/>} />
        </Routes>
      </AnimatePresence>
    );
};

export default React.memo(Router);