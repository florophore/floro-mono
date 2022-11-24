import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoadingPage from './loader/LoadingPage';
import LoggedOutPage from './loggedout/LoggedOutPage';
import CompleteSignupPage from './complete_signup/CompleteSignupPage';
import HomePage from './home/HomePage';
import CreateOrgPage from './create_org/CreateOrgPage';
import {AnimatePresence} from 'framer-motion';
import CreateUserRepoPage from './create_user_repo/CreateUserRepoPage';

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
          <Route path="/org/:organizationId/create-repo" element={<CreateOrgPage />} />
        </Routes>
      </AnimatePresence>
    );
};

export default React.memo(Router);