import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSubmitOAuthCodeQuery } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import SubPageLoader from "@floro/storybook/stories/common-components/SubPageLoader";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";

const CredentialVerifyCallback = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const verificationCode: string | null = searchParams.get("verification_code");

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
