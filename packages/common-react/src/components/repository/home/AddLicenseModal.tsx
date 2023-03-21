import React, { useMemo, useState, useCallback, useEffect } from "react";
import RootModal from "../../RootModal";
import styled from "@emotion/styled";
import Button from "@floro/storybook/stories/design-system/Button";
import { useCurrentLicenses } from "../local/hooks/local-hooks";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import { ApiReponse } from "@floro/floro-lib/src/repo";
import ColorPalette from "@floro/styles/ColorPalette";
import { Plugin } from '@floro/graphql-schemas/src/generated/main-client-graphql';

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const HeaderTitle = styled.div`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-align: center;
  color: ${ColorPalette.white};
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding: 24px;
`;

const TopContentContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const BottomContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

interface Props {
  show?: boolean;
  onDismiss?: () => void;
  apiReponse: ApiReponse;
  onAddLicense?: (licenses: Array<{ key: string; value: string }>) => void;
  isLoading?: boolean;
}

const AddLicenseModal = (props: Props) => {
  const licenses = useCurrentLicenses();

  const licensesFiltered = useMemo(() => {
    const existingLicenses = new Set(
      props?.apiReponse?.applicationState?.licenses?.map?.(
        (license) => license.key
      ) ?? []
    );
    return (
      licenses?.data?.filter?.((option) => {
        return !existingLicenses.has(option.value);
      }) ?? []
    );
  }, [props?.apiReponse?.applicationState?.licenses, licenses.data]);
  const [license, setLicense] =
    useState<{ key: string; value: string } | null>(null);
  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{"add license"}</HeaderTitle>
      </HeaderContainer>
    );
  }, []);

  const onSelectLicense = useCallback((option) => {
    if (option) {
      setLicense({
        key: option.value,
        value: option.label,
      });
    } else {
      setLicense(null);
    }
  }, []);

  const onAddLicense = useCallback(() => {
    if (license) {
      const nextLicense = [
        ...(props?.apiReponse?.applicationState?.licenses ?? []),
        license,
      ];
      props.onAddLicense?.(nextLicense);
    }
  }, [
    props?.apiReponse?.applicationState?.licenses,
    license,
    props.onAddLicense,
  ]);

  useEffect(() => {
    setLicense(null);
  }, [props.show]);

  return (
    <RootModal
      headerSize="small"
      headerChildren={title}
      show={props.show}
      onDismiss={props.onDismiss}
    >
      <ContentContainer>
        <TopContentContainer>
          <InputSelector
            value={license?.key ? license.key : null}
            onChange={onSelectLicense}
            options={
              licensesFiltered as Array<{ value: string; label: string }>
            }
            label={"add license"}
            placeholder={"select a license"}
          />
        </TopContentContainer>
        <BottomContentContainer>
          <Button
            label={"add license"}
            bg={"purple"}
            size={"big"}
            isLoading={props.isLoading}
            onClick={onAddLicense}
            isDisabled={license == null}
          />
        </BottomContentContainer>
      </ContentContainer>
    </RootModal>
  );
};

export default React.memo(AddLicenseModal);
