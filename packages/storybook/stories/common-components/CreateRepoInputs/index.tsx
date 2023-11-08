import React, { useCallback, useMemo, useState, useEffect } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import {
  REPO_REGEX,
} from "@floro/common-web/src/utils/validators";
import ProfanityFilter from "bad-words";

import Input from "@floro/storybook/stories/design-system/Input";

import {
  Organization,
  User,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import OwnerDescriptor from "../OwnerDescriptor";
import OrgOwnerDescriptor from "../OrgOwnerDescriptor";
import RepoPrivateSelect from "../RepoPrivateSelect";
import InputSelector from "../../design-system/InputSelector";
import ToolTip from "../../design-system/ToolTip";
import WarningLabel from "../../design-system/WarningLabel";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const SlashSpan = styled.span`
  font-size: 2.2rem;
  font-weight: 700;
  font-family: "MavenPro";
  padding: 0;
  margin: 12px 16px 0;
  display: block;
  color: ${(props) => props.theme.colors.slashRepoCreateColor};
`;

const Disclaimer = styled.p`
  font-size: 1.4rem;
  font-weight: 500;
  font-family: "MavenPro";
  padding: 0;
  display: block;
  color: ${(props) => props.theme.colors.contrastText};
`;

export interface Props {
  name: string;
  repoType: "org_repo" | "user_repo";
  onUpdateName: (name: string) => void;
  nameIsTaken: boolean;
  user?: User|null;
  organization?: Organization;
  offlinePhoto?: string|null;
  isPrivate: boolean;
  onChangeIsPrivate: (isPrivate: boolean) => void;
}

const CreateRepoInputs = (props: Props): React.ReactElement => {
  const profanityFilter = useMemo(() => new ProfanityFilter(), []);

  const nameInputIsValid = useMemo(() => {
    if (props.nameIsTaken) {
      return false;
    }
    if (REPO_REGEX.test(props.name) || props.name == "") {
      return !profanityFilter.isProfane(props.name);
    }
    return false;
  }, [props.name, props.nameIsTaken]);

  return (
    <Container>
      <div
        className={css`
          display: flex;
          flex-direction: row;
          align-items: center;
          margin-bottom: 12px;
        `}
      >
        <div>
          {props?.user &&
            <OwnerDescriptor
              label="owner"
              user={props.user}
              offlinePhoto={props.offlinePhoto}
            />
          }
          {props?.organization &&
            <OrgOwnerDescriptor
              label="owner"
              organization={props?.organization}
              offlinePhoto={props.offlinePhoto}
            />
          }
        </div>
        <div>
          <SlashSpan>{"/"}</SlashSpan>
        </div>
        <div>
          <Input
            label={"repo name"}
            placeholder={"repository name"}
            value={props.name}
            onTextChanged={props.onUpdateName}
            isValid={nameInputIsValid}
          />
        </div>
        <div style={{marginTop: 64}}>
          <ToolTip
            show={props?.nameIsTaken ?? false}
            inner={<div>
              <div style={{width: 200}}>
                <WarningLabel label={"repo name in use"} size={"small"}/>
              </div>
            </div>}
          />
        </div>
      </div>
      <div
        className={css`
          margin-bottom: 12px;
        `}
      >
        <RepoPrivateSelect isPrivate={props.isPrivate} onChange={props.onChangeIsPrivate} />
      </div>
      {props.isPrivate && props.repoType == "org_repo" &&
        <div style={{width: 880, marginTop: 48}}>
          <Disclaimer>
            {'Organization with privates repositories will be charged monthly when the organization has more than 5 active users.'}
          </Disclaimer>
        </div>
      }
    </Container>
  );
};

export default React.memo(CreateRepoInputs);