import React, { useMemo } from "react";
import styled from "@emotion/styled";
import InputSelector from "../../design-system/InputSelector";
import BranchIconLight from "@floro/common-assets/assets/images/icons/branch_icon.light.svg";
import BranchIconDark from "@floro/common-assets/assets/images/icons/branch_icon.dark.svg";
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

}

const BranchSelector = (props: Props) => {
    const theme = useTheme();
    const icon = useMemo(() => {
        return theme.name == "light" ? BranchIconLight : BranchIconDark;
    }, [theme.name])

    return (
        <InputSelector options={[]} label={"branch"} placeholder={"select branch"} inputPaddingLeft={0} leftElement={(
            <IconWrapper>
                <Icon src={icon}/>
            </IconWrapper>
        )}/>
    );
}

export default React.memo(BranchSelector);