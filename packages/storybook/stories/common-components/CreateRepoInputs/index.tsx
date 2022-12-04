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

const options = [
  {
    value: "apache_2",
    label: "Apache License 2.0",
  },
  {
    value: "gnu_general_public_3",
    label: "GNU General Public License v3.0",
  },
  {
    value: "mit",
    label: "MIT License",
  },
  {
    value: "bsd2_simplified",
    label: 'BSD 2-Clause "Simplified" License',
  },
  {
    value: "bsd3_new_or_revised",
    label: 'BSD 3-Clause "New" or "Revised" License',
  },
  {
    value: "boost",
    label: "Boost Software License",
  },
  {
    value: "creative_commons_zero_1_0",
    label: "Creative Commons Zero v1.0 Universal",
  },
  {
    value: "eclipse_2",
    label: "Eclipse Public License 2.0",
  },
  {
    value: "gnu_affero_3",
    label: "GNU Affero General Public License v3.0",
  },
  {
    value: "gnu_general_2",
    label: "GNU General Public License v2.0",
  },
  {
    value: "gnu_lesser_2_1",
    label: "GNU Lesser General Public License v2.1",
  },
  {
    value: "mozilla_2",
    label: "Mozilla Public License v2.0",
  },
  {
    value: "unlicense",
    label: "The Unlicense",
  },
];

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
  license: string|null;
  onChangeLicense: (license: string|null) => void;
}

const CreateRepoInputs = (props: Props): React.ReactElement => {
  const theme = useTheme();
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

  const onChangeLicense = useCallback((option) => {
    props.onChangeLicense(option?.value ?? null)
  }, [props.onChangeLicense]);

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
      {!props.isPrivate &&
        <div>
          <InputSelector value={props.license} onChange={onChangeLicense} label={"license"} placeholder={"select a license"} options={options} />
        </div>
      }
    </Container>
  );
};

export default React.memo(CreateRepoInputs);