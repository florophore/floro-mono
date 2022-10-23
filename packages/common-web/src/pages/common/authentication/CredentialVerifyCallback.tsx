import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CompleteSignupAction, useFetchGithubVerificationQuery, useSubmitOAuthCodeQuery } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import SubPageLoader from "@floro/storybook/stories/common-components/SubPageLoader";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import { protectedTrpc } from "../../../trpc";
import SignupContainer from "@floro/common-react/src/components/signup/SignupContainer";

const CredentialVerifyCallback = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const verificationCode: string | null = searchParams.get("verification_code");

  const { data, error } = useFetchGithubVerificationQuery({
    variables: {
      verificationCode
    }
  });

  if (error) {
    return (
      <SubPageLoader hideLoad>
        <div style={{marginTop: 24}}>
            <WarningLabel label="Server error" size={"large"} />
        </div>
      </SubPageLoader>
    );
  }

  if (!verificationCode || data?.fetchGithubVerification?.type == "NOT_FOUND") {
    return (
      <SubPageLoader hideLoad>
        <div style={{marginTop: 24}}>
            <WarningLabel label="Invalid authorization code" size={"large"} />
        </div>
      </SubPageLoader>
    );
  }

  if (data?.fetchGithubVerification?.type == "COMPLETE_SIGNUP") {
    return <SignupContainer completeSignupAction={data.fetchGithubVerification.action as CompleteSignupAction}/>
  }
  return <SubPageLoader/>;
};

export default CredentialVerifyCallback;
