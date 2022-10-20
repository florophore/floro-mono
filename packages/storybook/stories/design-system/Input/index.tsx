import React, {
  useMemo,
  useCallback,
  useRef,
  useImperativeHandle,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";

export interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  label: string;
  placeholder: string;
  isLoading?: boolean;
  isValid?: boolean;
  onTextChanged: (text: string) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
  tabIndex?: number;
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

const InputElement = styled.input`
  position: relative;
  width: 100%;
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
      isLoading,
      placeholder,
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
    }, [theme.name, isValid]);

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
        onTextChanged(event.target.value);
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

    return (
      <Container
        onClick={onClickContainer}
        style={{ border: `2px solid ${borderColor}` }}
      >
        <LabelContainer>
          <LabelBorderEnd style={{ left: -1, background: borderColor }} />
          <LabelText style={{ color: labelTextColor }}>{label}</LabelText>
          <LabelBorderEnd style={{ right: -1 }} />
        </LabelContainer>
        <InputElement
          value={value}
          ref={inputRef}
          onChange={onInputChange}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          placeholder={placeholder}
          spellCheck={'false'}
          {...rest}
        />
      </Container>
    );
  }
);

export default React.memo(Input);