import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  AccountCreationSuccessAction,
  CompleteSignupAction,
  PassedLoginAction,
  useFetchEmailAuthQuery
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import SubPageLoader from "@floro/storybook/stories/common-components/SubPageLoader";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import SignupContainer from "@floro/common-react/src/components/signup/SignupContainer";
import { useMutation } from "react-query";
import { useSocketEvent } from "@floro/common-react/src/pubsub/socket";
import axios from "axios";
import { setClientSession } from '@floro/common-react/src/session/client-session';

const CredentialAuthCallback = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const authCode: string | null = searchParams.get("authorization_code");
  const navigate = useNavigate();

  const { data, error } = useFetchEmailAuthQuery({
    variables: {
      authCode,
    }
  });

  useSocketEvent<PassedLoginAction>(
    "login",
    (payload) => {
      if (payload.session) {
        setClientSession(payload.session);
        navigate("/home");
      }
    },
    [navigate]
  );

  const completeSignupMutation = useMutation(
    async (completeSignupInfo: CompleteSignupAction) => {
      try {
        await axios.post(
          "http://localhost:63403/complete_signup",
          completeSignupInfo
        );
        return true;
      } catch (e) {
        return false;
      }
    }
  );

  const loginMutation = useMutation(
    async (loginInfo: PassedLoginAction | AccountCreationSuccessAction) => {
      try {
        if (loginInfo.session) {
          setClientSession(loginInfo.session);
          await axios.post("http://localhost:63403/login", loginInfo);
          navigate("/home");
        }
        return true;
      } catch (e) {
        return false;
      }
    }
  );

  useEffect(() => {
    if (data?.fetchEmailAuth?.type == "COMPLETE_SIGNUP") {
      completeSignupMutation.mutate(
        data?.fetchEmailAuth?.action as CompleteSignupAction
      );
    }
    if (data?.fetchEmailAuth?.type == "LOGIN") {
      loginMutation.mutate(data?.fetchEmailAuth?.action as PassedLoginAction);
    }
  }, [data?.fetchEmailAuth]);

  if (error) {
    return (
      <SubPageLoader hideLoad>
        <div style={{ marginTop: 24 }}>
          <WarningLabel label="Server error" size={"large"} />
        </div>
      </SubPageLoader>
    );
  }

  if (!authCode || data?.fetchEmailAuth?.type == "NOT_FOUND") {
    return (
      <SubPageLoader hideLoad>
        <div style={{ marginTop: 24 }}>
          <WarningLabel label="Invalid authorization code" size={"large"} />
        </div>
      </SubPageLoader>
    );
  }

  if (data?.fetchEmailAuth?.type == "COMPLETE_SIGNUP") {
    return (
      <SignupContainer
        completeSignupAction={
          data.fetchEmailAuth.action as CompleteSignupAction
        }
        onPassedLogin={loginMutation.mutate}
      />
    );
  }
  return <SubPageLoader />;
};

export default CredentialAuthCallback;
