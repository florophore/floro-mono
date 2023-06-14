import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import InputSelector, { Option } from "../../design-system/InputSelector";
import BranchIconLight from "@floro/common-assets/assets/images/icons/branch_icon.light.svg";
import BranchIconDark from "@floro/common-assets/assets/images/icons/branch_icon.dark.svg";
import { useTheme } from "@emotion/react";
import { Branch } from "floro/dist/src/repo";

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
    branches?: Array<Branch|null>;
    branch?: Branch|null;
    label?: string;
    placeholder?: string;
    allowNone?: boolean;
    onChangeBranch: (branch: Branch|null) => void;
}

const BranchSelector = (props: Props) => {
    const theme = useTheme();
    const icon = useMemo(() => {
        return theme.name == "light" ? BranchIconLight : BranchIconDark;
    }, [theme.name])

    const branchOptions = useMemo(() => {
        const branchOpts = props.branches?.map?.(branch => {
            return {
                value: branch?.id as string,
                label: branch?.name as string,
                searchValue: branch?.name as string
            }
        }, []) ?? [];
        if (!props.allowNone) {
            return branchOpts;
        }
        return [...branchOpts, { value: null, label: "None" }];
    }, [props.branches, props.allowNone]);

    const selectedBranch = useMemo(() => {
      if (!props.branch) {
        return null;
      }
      return branchOptions?.find((b) => b.value == props.branch?.id)?.value ?? null;
    }, [props.branch, branchOptions]);

    const onChange = useCallback((option: Option<unknown>|null) => {
        const branch = props?.branches?.find?.(b => b?.id == option?.value) ?? null;
        props.onChangeBranch(branch);
    }, [props.branches, props.allowNone, props.branch, props.onChangeBranch]);

    return (
      <InputSelector
        size={props?.size ?? "regular"}
        options={branchOptions}
        value={selectedBranch}
        label={props?.label ?? "branch"}
        placeholder={props.placeholder ?? "select branch"}
        inputPaddingLeft={0}
        noResultsMessage="No branches found"
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

export default React.memo(BranchSelector);