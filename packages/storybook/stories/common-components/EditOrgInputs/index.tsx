import React, { useCallback, useMemo, useState, useEffect } from "react";
import { css } from "@emotion/css";

import Input from "@floro/storybook/stories/design-system/Input";
import EmailValidator from "email-validator";

export interface Props {
  contactEmail: string;
  onUpdateContactEmail: (contactEmail: string) => void;
}

const EditOrgInputs = (props: Props): React.ReactElement => {

  const contactEmailIsValid = useMemo(
    () => EmailValidator.validate(props.contactEmail),
    [props.contactEmail]
  );
  const contactEmailInputIsValid = useMemo(
    () => contactEmailIsValid || props.contactEmail == "",
    [props.contactEmail, contactEmailIsValid]
  );

  return (
    <div>
      <div
        className={css`
          margin-bottom: 22px;
        `}
      >
        <Input
          label={"contact email"}
          placeholder={"contact email"}
          value={props.contactEmail}
          onTextChanged={props.onUpdateContactEmail}
          isValid={contactEmailInputIsValid}
          widthSize="wide"
        />
      </div>
    </div>
  );
};

export default React.memo(EditOrgInputs);
