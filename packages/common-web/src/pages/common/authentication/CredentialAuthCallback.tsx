import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CompleteSignupAction, useFetchEmailAuthQuery } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import SubPageLoader from "@floro/storybook/stories/common-components/SubPageLoader";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import SignupContainer from '@floro/common-react/src/components/signup/SignupContainer';
import { protectedTrpc } from "../../../trpc";

const CredentialAuthCallback = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const authCode: string | null = searchParams.get("authorization_code");

  const { data, error } = useFetchEmailAuthQuery({
    variables: {
      authCode
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

  if (!authCode || data?.fetchEmailAuth?.type == "NOT_FOUND") {
    return (
      <SubPageLoader hideLoad>
        <div style={{marginTop: 24}}>
            <WarningLabel label="Invalid authorization code" size={"large"} />
        </div>
      </SubPageLoader>
    );
  }

  if (data?.fetchEmailAuth?.type == "COMPLETE_SIGNUP") {
    return <SignupContainer completeSignupAction={data.fetchEmailAuth.action as CompleteSignupAction}/>
  }
  return <SubPageLoader/>;
};

export default CredentialAuthCallback;