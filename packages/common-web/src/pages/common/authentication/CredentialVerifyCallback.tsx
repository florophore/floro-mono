import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  AccountCreationSuccessAction,
  CompleteSignupAction,
  PassedLoginAction,
  useFetchGithubVerificationQuery,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import SubPageLoader from "@floro/storybook/stories/common-components/SubPageLoader";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import SignupContainer from "@floro/common-react/src/components/signup/SignupContainer";
import { useSocketEvent } from "@floro/common-react/src/pubsub/socket";
import { setClientSession } from "@floro/common-react/src/session/client-session";
import { useMutation } from "react-query";
import axios from "axios";

const CredentialVerifyCallback = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const verificationCode: string | null = searchParams.get("verification_code");
  const navigate = useNavigate();

  const { data, error } = useFetchGithubVerificationQuery({
    variables: {
      verificationCode,
    },
  });

  useSocketEvent<PassedLoginAction>(
    "login",
    (payload) => {
      setClientSession(payload);
      navigate("/home");
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
        setClientSession(loginInfo);
        await axios.post("http://localhost:63403/login", loginInfo);
        navigate("/home");
        return true;
      } catch (e) {
        return false;
      }
    }
  );

  useEffect(() => {
    if (data?.fetchGithubVerification?.type == "COMPLETE_SIGNUP") {
      completeSignupMutation.mutate(
        data?.fetchGithubVerification?.action as CompleteSignupAction
      );
    }
    if (data?.fetchGithubVerification?.type == "LOGIN") {
      loginMutation.mutate(
        data?.fetchGithubVerification?.action as PassedLoginAction
      );
    }
  }, [data?.fetchGithubVerification]);

  if (error) {
    return (
      <SubPageLoader hideLoad>
        <div style={{ marginTop: 24 }}>
          <WarningLabel label="Server error" size={"large"} />
        </div>
      </SubPageLoader>
    );
  }

  if (!verificationCode || data?.fetchGithubVerification?.type == "NOT_FOUND") {
    return (
      <SubPageLoader hideLoad>
        <div style={{ marginTop: 24 }}>
          <WarningLabel label="Invalid authorization code" size={"large"} />
        </div>
      </SubPageLoader>
    );
  }

  if (data?.fetchGithubVerification?.type == "COMPLETE_SIGNUP") {
    return (
      <SignupContainer
        completeSignupAction={
          data.fetchGithubVerification.action as CompleteSignupAction
        }
        onPassedLogin={loginMutation.mutate}
      />
    );
  }
  return <SubPageLoader />;
};

export default CredentialVerifyCallback;
