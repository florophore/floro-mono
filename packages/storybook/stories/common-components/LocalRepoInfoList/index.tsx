import React, { useMemo} from "react";
import styled from "@emotion/styled";
import { RepoInfo } from "floro/dist/src/repo";
import LocalRepoRow from "./LocalRepoRow";
import { Repository } from "@floro/graphql-schemas/build/generated/main-graphql";

const SectionContainer = styled.div`
  width: 100%;
  margin-bottom: 48px;
`;

const SectionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const DependencyBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
  max-height: 592px;
  overflow: scroll;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const UnReleasedText = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
  margin-top: 4px;
  padding: 0;
`;

export interface Props {
  repoInfos: RepoInfo[];
  onSelectRepoInfo: (repoInfo: RepoInfo) => void;
  fromRepository: Repository;
}

const LocalRepoInfoList = (props: Props) => {

  const repoInfos = useMemo(() => {
    if (!props.fromRepository.isPrivate) {
      return props.repoInfos;
    }
    return props?.repoInfos.filter(repoInfo => {
      if (!repoInfo.isPrivate) {
        return true;
      }
      if (repoInfo.repoType == "user_repo" && props.fromRepository?.repoType == "user_repo") {
        return repoInfo.userId == props?.fromRepository?.user?.id;
      }
      if (repoInfo.repoType == "org_repo" && props.fromRepository?.repoType == "org_repo") {
        return repoInfo.organizationId == props?.fromRepository?.organization?.id;
      }
      return false;
    })
  }, [props.fromRepository, props.repoInfos])

  return (
    <SectionContainer>
      <TopRow>
        <div>
            <SectionTitle>{"Copy Into Repository"}</SectionTitle>
            <UnReleasedText>{'choose the local repository you would like to copy into'}</UnReleasedText>
        </div>
      </TopRow>
      <DependencyBox>
        {repoInfos?.map((repoInfo, index) => {
          return (
            <LocalRepoRow
              repoInfo={repoInfo}
              onSelectRepoInfo={props.onSelectRepoInfo}
              isFirst={0 == index}
              key={index}
              isEven={index % 2 == 0}
            />
          );
        })}
      </DependencyBox>
    </SectionContainer>
  );
};

export default React.memo(LocalRepoInfoList);