import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import InputSelector, { Option } from "../../design-system/InputSelector";
import CommitIconLight from "@floro/common-assets/assets/images/icons/commit_icon.light.svg";
import CommitIconDark from "@floro/common-assets/assets/images/icons/commit_icon.dark.svg";

import CompareIconLight from "@floro/common-assets/assets/images/repo_icons/compare.gray.svg";
import CompareIconDark from "@floro/common-assets/assets/images/repo_icons/compare.white.svg";
import { useTheme } from "@emotion/react";

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
  size?: 'regular'|'wide';
  onChangeAgainst?: (against: "wip"|"branch"|"sha") => void
  value?: "wip"|"branch"|"sha";
  isLoading?: boolean;
}


const CompareSelector = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo(() => {
    return theme.name == "light" ? CompareIconLight : CompareIconDark;
  }, [theme.name]);

  const options = useMemo((): Array<Option<"wip"|"branch"|"sha">> => {
    return [
      {
        label: "Uncommitted Changes",
        value: "wip",
      },
      {
        label: "Branch",
        value: "branch",
      },
      {
        label: "Commit",
        value: "sha",
      },
    ]

  }, []);


  const onChange = useCallback(
    (option: Option<"wip" | "branch" | "sha"|unknown> | null) => {
      if (option?.value) {
        props.onChangeAgainst?.(option.value as "wip" | "branch" | "sha");
      }
    },
    [props.onChangeAgainst]
  );

  return (
    <InputSelector
      size={props?.size ?? "regular"}
      options={options}
      onChange={onChange}
      value={props.value}
      label={"comparing"}
      placeholder={"compare against"}
      inputPaddingLeft={0}
      isLoading={props.isLoading}
      leftElement={
        <IconWrapper>
          <Icon src={icon} />
        </IconWrapper>
      }
    />
  );
};

export default React.memo(CompareSelector);