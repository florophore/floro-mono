import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useFetchGithubVerificationQuery, useSubmitOAuthCodeQuery } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import SubPageLoader from "@floro/storybook/stories/common-components/SubPageLoader";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import { protectedTrpc } from "../../../trpc";

const CredentialVerifyCallback = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const verificationCode: string | null = searchParams.get("verification_code");

  const { data, error, loading } = useFetchGithubVerificationQuery({
    variables: {
      verificationCode
    }
  });
  console.log(data, error, loading)
  //const login = protectedTrpc.useMutation('login');
  //console.log("LOGIN", login);


  if (!verificationCode) {
    return (
      <SubPageLoader hideLoad>
        <div style={{marginTop: 24}}>
            <WarningLabel label="Invalid verification code" size={"large"} />
        </div>
      </SubPageLoader>
    );
  }
  return <SubPageLoader/>;
};

export default CredentialVerifyCallback;
