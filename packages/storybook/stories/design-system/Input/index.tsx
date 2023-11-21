import React, {
  useMemo,
  useCallback,
  useRef,
  useImperativeHandle,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import { css } from "@emotion/css";
import { reduce } from "d3";
import { ProposedMergeRequestRepositoryUpdatesDocument } from "@floro/graphql-schemas/build/generated/main-client-graphql";

export interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  label: string;
  placeholder: string;
  isLoading?: boolean;
  isValid?: boolean;
  hideLabel?: boolean;
  onTextChanged: (text: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  tabIndex?: number;
  inputPaddingLeft?: number;
  rightElement?: React.ReactElement|null;
  leftElement?: React.ReactElement|null;
  widthSize?: 'regular'|'wide'|'mid'|'shorter'|'semi-short'|'short'|'shortest';
}

const Container = styled.div`
  margin-top: 14px;
  position: relative;
  height: 64px;
  width: 432px;
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  transition: 500ms border-color;
  cursor: pointer;
  max-width: 100%;
`;

const LabelContainer = styled.div`
  position: relative;
  height: 32;
  top: -16px;
  left: 32px;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.colors.inputLabelTextColor};
  padding: 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const LabelText = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  transition: 500ms color;
  user-select: none;
`;

const LabelBorderEnd = styled.div`
  position: absolute;
  height: 2px;
  width: 2px;
  border-radius: 50%;
  top: 14px;
  transition: 500ms background-color;
`;

const InputRowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const InputElement = styled.input`
  position: relative;
  flex-grow: 1;
  box-sizing: border-box;
  height: 32px;
  top: -12px;
  border: none;
  outline: none;
  background: ${(props) => props.theme.background};
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  padding: 0 16px;
  width: 100%;
  color: ${(props) => props.theme.colors.inputEntryTextColor};
  ::placeholder {
    color: ${(props) => props.theme.colors.inputPlaceholderTextColor};
  }
`;

const Input = React.forwardRef(
  (
    {
      value,
      label,
      onTextChanged,
      onFocus,
      onBlur,
      isValid = true,
      hideLabel = false,
      isLoading,
      placeholder,
      inputPaddingLeft = 16,
      widthSize = 'regular',
      ...rest
    }: Props,
    ref: React.ForwardedRef<HTMLInputElement | null>
  ): React.ReactElement => {
    const theme = useTheme();
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(
      ref,
      () => inputRef.current
    );

    const borderColor = useMemo(() => {
      if (!isValid) {
        return theme.colors.inputInvalidBorderColor;
      }
      return theme.colors.inputBorderColor;
    }, [theme, isValid]);

    const labelTextColor = useMemo(() => {
      if (!isValid) {
        return theme.colors.inputInvalidLabelTextColor;
      }
      return theme.colors.inputLabelTextColor;
    }, [theme.name, isValid]);

    const onClickContainer = useCallback(() => {
      inputRef?.current?.focus?.();
    }, []);

    const onInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onTextChanged(event.target.value, event);
      },
      [onTextChanged]
    );

    const onInputFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement, Element>): void => {
        onFocus?.(event);
      },
      [onFocus]
    );

    const onInputBlur = useCallback(
      (event: React.FocusEvent<HTMLInputElement, Element>): void => {
        onBlur?.(event);
      },
      [onBlur]
    );

    const disabledColor = useMemo(() => {
      if (theme.name == "light") {
        return ColorPalette.lightGray;
      }
      return ColorPalette.mediumGray;
    }, [theme.name])

    const disabledBorderColor = useMemo(() => {
      if (theme.name == "light") {
        return ColorPalette.gray;
      }
      return ColorPalette.gray;
    }, [theme.name])

    return (
      <Container
        onClick={onClickContainer}
        style={{
          border: `2px solid ${borderColor}`,
          width: widthSize == "regular" ? 432 : widthSize == "mid" ? 452 : widthSize == "short" ? 240 : widthSize == 'semi-short' ? 300 : widthSize == 'shorter' ? 400 : widthSize == 'shortest' ? 152 : 470,
          ...(rest.disabled ? {
              background: disabledColor,
              border: `2px solid ${disabledBorderColor}`,
              cursor: "not-allowed",
          }: {})

        }}
      >
        <LabelContainer style={{
          ...(rest.disabled ? {
              background: disabledColor,
              borderColor: disabledBorderColor,
              cursor: "not-allowed",
          }: {})
        }}>
          <div
          style={{
            position: 'absolute',
            background: theme.background,
            top: 0,
            height: 16,
            width: '100%',
            zIndex: 0,
          }}>
          </div>
          <LabelBorderEnd style={{ left: -1, background: rest.disabled ? disabledBorderColor : borderColor, zIndex: 0 }} />
          <LabelText style={{ color: rest.disabled ? disabledBorderColor : labelTextColor, zIndex: 0 }}>{label}</LabelText>
          <LabelBorderEnd style={{ right: -1, zIndex: 0 }} />
        </LabelContainer>
        <InputRowWrapper>
          {!!rest?.leftElement && (
            <div style={{ height: 64, position: "relative", marginTop: -27 }}>
              {rest?.leftElement}
            </div>
          )}
          <InputElement
            value={value}
            ref={inputRef}
            onChange={onInputChange}
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            placeholder={placeholder}
            spellCheck={"false"}

          className={rest.disabled ? css`
              background: ${disabledColor};
              color: ${theme.name == 'light' ? ColorPalette.darkGray : ColorPalette.gray} !important;
              cursor: not-allowed;
              ::placeholder {
                color: ${theme.name == 'light' ? ColorPalette.gray : ColorPalette.gray} !important;
              }
          ` : css``}
            style={{
              paddingLeft: inputPaddingLeft,
              ...(rest.disabled ? {
                  background: disabledColor,
                  borderColor: disabledBorderColor,
                  cursor: "not-allowed",
          }: {})
            }}
            {...rest}
          />
          {!!rest?.rightElement && (
            <div style={{ height: 64, position: "relative", marginTop: -27 }}>
              {rest?.rightElement}
            </div>
          )}
        </InputRowWrapper>
      </Container>
    );
  }
);

export default React.memo(Input);