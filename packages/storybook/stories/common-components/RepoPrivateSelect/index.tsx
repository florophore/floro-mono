import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import LockLight from "@floro/common-assets/assets/images/icons/lock.light.svg";
import LockDark from "@floro/common-assets/assets/images/icons/lock.dark.svg";
import LockSelectedLight from "@floro/common-assets/assets/images/icons/lock.selected.light.svg";
import LockSelectedDark from "@floro/common-assets/assets/images/icons/lock.selected.dark.svg";
import OpenbookLight from "@floro/common-assets/assets/images/icons/openbook.light.svg";
import OpenbookDark from "@floro/common-assets/assets/images/icons/openbook.dark.svg";
import OpenbookSelectedLight from "@floro/common-assets/assets/images/icons/openbook.selected.light.svg";
import OpenbookSelectedDark from "@floro/common-assets/assets/images/icons/openbook.selected.dark.svg";
import Radio from "../../design-system/Radio";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const IconWrapper = styled.div`
    width: 64px;
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 12px;
`;

const PrivateIcon = styled.img`
    height: 40px;
    cursor: pointer;
`;

const PublicIcon = styled.img`
    height: 32px;
    cursor: pointer;
`;
const TextWrap = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-end;
`;

const CheckTitle = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.44rem;
  margin-left: 24px;
  min-width: 120px;
  cursor: pointer;
`;

const Subtext = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  color: ${props => props.theme.colors.repoSelectSubtitleTextColor};
`;

const SubtextBold = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1rem;
  color: ${props => props.theme.colors.repoSelectSubtitleTextColor};
`;

export interface Props {
  isPrivate: boolean;
  onChange: (isPrivate: boolean) => void;
}

const RepoPrivateSelect = (props: Props): React.ReactElement => {
  const theme = useTheme();

  const lockIcon = useMemo(() => {
    if (!props.isPrivate) {
      return theme.name == "light" ? LockLight : LockDark;
    }
    if (theme.name == "light") {
      return LockSelectedLight;
    }
    return LockSelectedDark;
  }, [props.isPrivate, theme.name]);

  const openBookIcon = useMemo(() => {
    if (props.isPrivate) {
      return theme.name == "light" ? OpenbookLight : OpenbookDark;
    }
    if (theme.name == "light") {
    return OpenbookSelectedLight;
    }
    return OpenbookSelectedDark;
  }, [props.isPrivate, theme.name]);

  const privateTextColor = useMemo(() => {
    if (!props.isPrivate) {
      return theme.colors.privateSelectTextColor;
    }
    if (theme.name == "light") {
      return ColorPalette.purple;
    }
    return ColorPalette.lightPurple;
  }, [props.isPrivate, theme.name])

  const publicTextColor = useMemo(() => {
    if (props.isPrivate) {
      return theme.colors.privateSelectTextColor;
    }
    if (theme.name == "light") {
      return ColorPalette.purple;
    }
    return ColorPalette.lightPurple;
  }, [props.isPrivate, theme.name])

  const onSelectPrivate = useCallback((isPrivate) => {
    if (isPrivate) {
        props.onChange(true);
    }
  }, [props.onChange]);

  const onSelectPublic = useCallback((isPublic) => {
    if (isPublic) {
        props.onChange(false);
    }
  }, [props.onChange]);

  const onSelectPrivateClick = useCallback(() => {
        props.onChange(true);
  }, [props.onChange]);

  const onSelectPublicClick = useCallback(() => {
        props.onChange(false);
  }, [props.onChange]);

  return (
    <div>
      <Container>
        <Row>
          <Radio isChecked={props.isPrivate} onChange={onSelectPrivate} />
          <IconWrapper>
            <PrivateIcon src={lockIcon} onClick={onSelectPrivateClick} />
          </IconWrapper>
          <TextWrap>
            <CheckTitle style={{color: privateTextColor}} onClick={onSelectPrivateClick}>
              {'Private'}
            </CheckTitle>
            <Subtext>
              {"You choose who can see and commit to this repository."}
            </Subtext>
          </TextWrap>
        </Row>
        <Row>
          <Radio isChecked={!props.isPrivate} onChange={onSelectPublic} />
          <IconWrapper>
            <PublicIcon src={openBookIcon} onClick={onSelectPublicClick} />
          </IconWrapper>
          <TextWrap>
            <CheckTitle style={{color: publicTextColor}} onClick={onSelectPublicClick}>
              {'Public'}
            </CheckTitle>
            <Subtext>
              {"Anyone on the internet can see this repository. You choose who can push commits."}
            </Subtext>
          </TextWrap>
        </Row>
      </Container>
    </div>
  );
};

export default React.memo(RepoPrivateSelect);
