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
          <Route path="/org/@/:handle" element={<OrganizationPage />} />
          <Route path="/org/@/:handle/create-repo" element={<CreateOrgRepoPage/>} />
          <Route path="/org/@/:handle/members" element={<OrganizationMembersPage/>} />
          <Route path="/org/@/:handle/invitations" element={<OrganizationInvitationsPage/>} />
          <Route path="/org/@/:handle/roles" element={<OrganizationRolesPage/>} />
          <Route path="/repo/@/:ownerHandle/:repoName/history" element={<RepoHistoryPage page={'history'}/>} />
          <Route path="/repo/@/:ownerHandle/:repoName/settings" element={<RepoHomePage page={'settings'}/>} />
          <Route path="/repo/@/:ownerHandle/:repoName/settings/branchrules/:branchRuleId" element={<RepoHomePage page={'branch-rules'}/>} />
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