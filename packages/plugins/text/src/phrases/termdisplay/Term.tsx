import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  SchemaTypes,
  useFloroContext,
  useReferencedObject,
} from "../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

import RedXCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import VerifiedLight from "@floro/common-assets/assets/images/icons/verified.light.svg";
import VerifiedDark from "@floro/common-assets/assets/images/icons/verified.dark.svg";
import TermsModal from "./TermsModal";

const TermWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-top: 12px;
  margin-right: 12px;
`;

const TermSpan = styled.span`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.linkColor};
  text-decoration: underline;
  margin-right: 8px;
  margin-top: -2px;
  cursor: pointer;
`;

const TermIcon = styled.img`
  height: 24px;
  width: 24px;
`;

interface Props {
  term: {
    id: string;
    value: string;
    name: string;
  };
  selectedLocale?: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale?: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]|null;
  isEnabled: boolean;
  isReadOnly?: boolean;
  onChange?: (termId: string) => void;
  enabledTerms: string[];
}

const Term = (props: Props) => {
  const { commandMode } = useFloroContext();
  const theme = useTheme();
  const [showModal, setShowModal] = useState(false);
  const floroTerm = useReferencedObject(`$(text).terms.id<${props.term.id}>`)

  const onShowModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const onHideModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const onChange = useCallback(() => {
    props.onChange?.(props.term.id);
  }, [
    props.onChange,
    props.term.id,
  ]);

  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return RedXCircleLight;
    }
    return RedXCircleDark;
  }, [theme.name]);
  const verifiedIcon = useMemo(() => {
    if (theme.name == "light") {
      return VerifiedLight;
    }
    return VerifiedDark;
  }, [theme.name]);

  return (
    <>
      {floroTerm && (
        <TermsModal
          selectedLocale={props.selectedLocale}
          systemSourceLocale={props.systemSourceLocale}
          term={floroTerm}
          show={showModal}
          onDismiss={onHideModal}
        />
      )}
      <TermWrapper>
        <TermSpan onClick={onShowModal}>{props.term.name}</TermSpan>
        {!props.isReadOnly && (
          <>
            {commandMode != "edit" && (
              <div
                style={{
                  height: 28,
                  width: 28,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TermIcon src={props.isEnabled ? verifiedIcon : xIcon} />
              </div>
            )}
            {commandMode == "edit" && (
              <Checkbox
                disabled={commandMode != "edit"}
                isChecked={props.isEnabled}
                onChange={onChange}
              />
            )}
          </>
        )}
      </TermWrapper>
    </>
  );
};

export default React.memo(Term);
