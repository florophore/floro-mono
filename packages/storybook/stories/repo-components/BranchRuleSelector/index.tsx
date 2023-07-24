import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import InputSelector, { Option } from "../../design-system/InputSelector";
import BranchRuleIconLight from "@floro/common-assets/assets/images/icons/branch_rule.light.svg";
import BranchRuleIconDark from "@floro/common-assets/assets/images/icons/branch_rule.dark.svg";
import { useTheme } from "@emotion/react";
import { Branch } from "floro/dist/src/repo";
import { ProtectedBranchRule } from "@floro/graphql-schemas/build/generated/main-graphql";

const IconWrapper = styled.div`
  height: 100%;
  width: 48px;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: row;
`;

const Icon = styled.img`
  width: 24px;
`

export interface Props {
    size?: 'regular'|'wide'|'mid';
    branchRules?: Array<ProtectedBranchRule|null>;
    branchRule?: ProtectedBranchRule|null;
    label?: string;
    placeholder?: string;
    allowNone?: boolean;
    onChangeBranchRule: (branchRule: ProtectedBranchRule|null) => void;
}

const BranchRuleSelector = (props: Props) => {
    const theme = useTheme();
    const icon = useMemo(() => {
        return theme.name == "light" ? BranchRuleIconLight : BranchRuleIconDark;
    }, [theme.name])

    const branchOptions = useMemo(() => {
        const branchRuleOpts = props.branchRules?.map?.(branchRule => {
            return {
                value: branchRule?.id as string,
                label: branchRule?.branchName as string,
                searchValue: branchRule?.branchName as string
            }
        }, []) ?? [];
        if (!props.allowNone) {
            return branchRuleOpts;
        }
        return [...branchRuleOpts, { value: null, label: "None" }];
    }, [props.branchRules, props.allowNone]);

    const selectedBranch = useMemo(() => {
      if (!props.branchRule) {
        return null;
      }
      return branchOptions?.find((b) => b.value == props.branchRule?.id)?.value ?? null;
    }, [props.branchRule, branchOptions]);

    const onChange = useCallback((option: Option<unknown>|null) => {
        const branchRule = props?.branchRules?.find?.(b => b?.id == option?.value) ?? null;
        props.onChangeBranchRule(branchRule);
    }, [props.branchRules, props.allowNone, props.branchRule, props.onChangeBranchRule]);

    return (
      <InputSelector
        size={props?.size ?? "regular"}
        options={branchOptions}
        value={selectedBranch}
        label={props?.label ?? "branch rules"}
        placeholder={props.placeholder ?? "select branch rule"}
        inputPaddingLeft={0}
        noResultsMessage="No branch rule found"
        onChange={onChange}
        disableNull
        leftElement={
          <IconWrapper>
            <Icon src={icon} />
          </IconWrapper>
        }
      />
    );
}

export default React.memo(BranchRuleSelector);