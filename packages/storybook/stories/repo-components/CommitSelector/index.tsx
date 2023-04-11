import React, { useMemo } from "react";
import styled from "@emotion/styled";
import InputSelector from "../../design-system/InputSelector";
import CommitIconLight from "@floro/common-assets/assets/images/icons/commit_icon.light.svg";
import CommitIconDark from "@floro/common-assets/assets/images/icons/commit_icon.dark.svg";
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
}



const CommitSelector = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo(() => {
    return theme.name == "light" ? CommitIconLight : CommitIconDark;
  }, [theme.name]);

  return (
    <InputSelector
      size={props?.size ?? "regular"}
      options={[]}
      label={"commit"}
      placeholder={"select commit"}
      inputPaddingLeft={0}
      leftElement={
        <IconWrapper>
          <Icon src={icon} />
        </IconWrapper>
      }
    />
  );
};

export default React.memo(CommitSelector);