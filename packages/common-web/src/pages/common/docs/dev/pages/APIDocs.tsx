import {
  useMemo,
  useCallback,
  JSXElementConstructor,
  ReactElement,
  useEffect,
  useRef
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Helmet } from "react-helmet";
import { richTextRenderers } from "@floro/common-web/src/floro_listener/FloroTextRenderer";
import { StaticLinkNode } from "@floro/common-generators/floro_modules/text-generator";
import { Link } from "react-router-dom";
import PageWrapper from "../../../../../components/wrappers/PageWrapper";
import { usePlainText, useRichText } from "../../../../../floro_listener/hooks/locales";
import DocSearch from "../../DocSearch";
import { LinkChain } from "../../DocsLink";
import { useIcon } from "../../../../../floro_listener/FloroIconsProvider";
import CLICopy from "../../../../../components/home/CLICopy";
import ColorPalette from "@floro/styles/ColorPalette";

import LocalSettingsLight from "@floro/main/public/doc_images/development/api/local_settings.light.png";
import LocalSettingsDark from "@floro/main/public/doc_images/development/api/local_settings.dark.png";

import RemoteSettingsLight from "@floro/main/public/doc_images/development/api/remote_settings.light.png";
import RemoteSettingsDark from "@floro/main/public/doc_images/development/api/remote_settings.dark.png";

import RemoteKeysLight from "@floro/main/public/doc_images/development/api/remote_keys.light.png";
import RemoteKeysDark from "@floro/main/public/doc_images/development/api/remote_keys.dark.png";

import Highlight from 'react-highlight'
import "highlight.js/styles/atom-one-dark.css";

const ATOM_ONE_HEX = "#282c34";


const AboutWrapper = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: ${(props) => props.theme.background};
  padding-top: 48px;
`;

const SectionTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 600;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.titleText};
  @media screen and (max-width: 767px) {
    font-size: 2rem;
  }
`;

const SubTitle = styled.h2`
  font-size: 1.7rem;
  font-weight: 600;
  padding: 0;
  margin: 24px 0 0 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.titleText};
  @media screen and (max-width: 767px) {
    font-size: 1.44rem;
  }
`;

const APITitle = styled.h2`
  font-size: 1.44rem;
  font-weight: 600;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.titleText};
  @media screen and (max-width: 767px) {
    font-size: 1.2rem;
  }
`;

const SectionParagraph = styled.div`
  font-size: 1.44rem;
  font-weight: 400;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
  @media screen and (max-width: 767px) {
    font-size: 1.2rem;
    word-wrap: break-word;
  }
`;

const ScreenshotImg = styled.img`
  border-radius: 8px;
  box-shadow: 0px 4px 16px 12px
    ${(props) => props.theme.colors.tooltipOuterShadowColor};
  width: 100%;
  max-width: 800px;
`;

const SlideImg = styled.img`
  width: 100%;
  max-width: 800px;
  margin-top: 24px;
  margin-bottom: 24px;
`;

const Command = styled.div`
  background: ${(props) => props.theme.name == 'light' ? ColorPalette.lightGray : ColorPalette.mediumGray};
  border-radius: 8px;
  padding: 6px 8px;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastText};
  box-shadow: 0px 2px 8px 4px ${props => props.theme.colors.tooltipOuterShadowColor};
  font-size: 1rem;
  font-weight: 600;
`;

const CommandOut = styled.div`
  background: ${(props) => props.theme.name == 'light' ? ColorPalette.lightGray : ColorPalette.mediumGray};
  border-radius: 8px;
  padding: 6px 8px;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastText};
  box-shadow: 0px 2px 8px 4px ${props => props.theme.colors.tooltipOuterShadowColor};
  font-size: 1rem;
  font-weight: 400;
  white-space: pre-wrap;
`;

const CodeOut = styled.div`
  background: ${ATOM_ONE_HEX};
  border-radius: 8px;
  padding: 6px 8px;
  font-family: "MavenPro";
  box-shadow: 0px 2px 8px 4px ${props => props.theme.colors.tooltipOuterShadowColor};
  font-size: 1rem;
  font-weight: 400;
  white-space: pre-wrap;
`;


const REPO_TYPE = `
interface Repository {
  id: string;
  name: string;
  defaultBranchId: string;
}
`.trim();

const REPOSITORIES_RESPONSE = `
interface RepositoriesResponse {
  repositories: Array<Repository>;
  apiTrackingId: string; // included in remote API only
}
`.trim();

const REPOSITORY_RESPONSE = `
interface RepositoryResponse {
  repository: Repository;
  apiTrackingId: string; // included in remote API only
}
`.trim();

const BRANCH_TYPE = `
interface Branch {
  id: string;
  name: string;
  lastCommit: string|null;
  createdBy: string; // floro user uuid
  createdByUsername: string; // floro user username
  createdAt: string; // ISO DateTime UTC
  baseBranchId: string|null;
}
`.trim();

const STATE_TYPE = `
interface State {
  binaries: Array<string>;
  description: Array<string>;
  licenses: Array<{key: string, value: string}>;
  plugins: Array<{key: string, value: string}>;
  store: {
    [pluginName: string]: PluginStateTree; // this is specific to the schemas of the plugins your repository consumes
  }
}
`.trim();

const BRANCHES_RESPONSE = `
interface BranchesResponse {
  branches: Array<Branch>;
  apiTrackingId: string; // included in remote API only
}
`.trim();

const BRANCH_RESPONSE = `
interface BranchResponse {
  branch: Branch;
  apiTrackingId: string; // included in remote API only
}
`.trim();

const COMMIT_TYPE = `
interface Commit {
  sha: string; // sha-256
  originalSha: string|null; // sha-256
  parent: string|null; // sha-256
  historicalParent: string|null; // sha-256
  idx: number; // commit index
  mergeBase: string|null;// sha-256
  mergeRevertSha: string|null;// sha-256
  revertFromSha: string|null;// sha-256
  revertToSha: string|null;// sha-256
  message: string;
  username: string;
  authorUsername: string;
  timestamp: string; // ISO DateTime UTC
  authorUserId: string; // floro user uuid
  userId: string; // floro user uuid
}
`.trim();

const COMMIT_RESPONSE = `
interface CommitResponse {
  commit: Commit;
  apiTrackingId: string; // included in remote API only
}
`.trim();

const STATE_LINK_COMMIT_RESPONSE = `
interface StateLinkResponse {
  stateLink: string; // signed CDN url (remote) or state url (local)
  apiTrackingId: string; // included in remote API only
}
`.trim();

const BINARY_TYPE = `
interface Binary {
  hash: string; // sha-256 hash of file contents
  fileName: string;
  url: string; // signed CDN url (remote) or url with access token (local)
}
`.trim();

const BINARIES_RESPONSE = `
interface BinariesResponse {
  binaries: Array<Binary>;
  apiTrackingId: string; // included in remote API only
}
`.trim();

const MANIFEST_TYPE = `
export interface ManifestNode {
  type: string;
  isKey?: boolean;
  values?: string | TypeStruct;
  ref?: string;
  refKeyType?: string;
  refType?: string;
  nullable?: boolean;
  emptyable?: boolean;
  bounded?: boolean;
  manualOrdering?: boolean;
  onDelete?: "delete" | "nullify";
  default?: unknown|Array<unknown>;
}

export interface TypeStruct {
  [key: string]: ManifestNode | TypeStruct;
}

export interface Manifest {
  version: string;
  name: string;
  displayName: string;
  description?: string;
  codeDocsUrl?: string;
  codeRepoUrl?: string;
  managedCopy?: boolean;
  icon:
    | string
    | {
        light: string;
        dark: string;
        selected?:
          | string
          | {
              dark?: string;
              light?: string;
            };
      };
  imports: {
    [name: string]: string;
  };
  types: TypeStruct; // this is the floro schema language (documentation coming soon)
  store: TypeStruct; // this is the floro schema language (documentation coming soon)
  seed?: unknown; // this is the initial default value of the plugin state post installation
}
`.trim();

const MANIFEST_RESPONSE = `
interface ManifestResponse {
  manifests: Array<Manifest>;
  apiTrackingId: string; // included in remote API only
}
`.trim();

const ROOT_SCHEMA_MAP_TYPE = `
export interface RootSchemaMap {
  [pluginName: string]: TypeStruct; // this is specific to the schemas of the plugins your repository consumes
}
`.trim();

const ROOT_SCHEMA_MAP_RESPONSE = `
interface ManifestResponse {
  rootSchemaMap: RootSchemaMap;
  apiTrackingId: string; // included in remote API only
}
`.trim();

const INVALIDITY_MAP_TYPE = `
export interface InvalidityMap {
  [pluginName: string]: Array<string>; // list of plugin keys that are marked invalid
}
`.trim();

const INVALIDITY_MAP_RESPONSE = `
export interface InvalidityMapResponse {
  invalidityMap: InvalidityMap;
  apiTrackingId: string; // included in remote API only
}
`.trim();

const IS_TOPOLOGICAL_SUBSET_RESPONSE = `
export interface IsTopologicalSubsetResponse {
  isTopologicalSubset: boolean;
  apiTrackingId: string; // included in remote API only
}
`.trim();

const IS_TOPOLOGICAL_SUBSET_VALID_RESPONSE = `
export interface IsTopologicalSubsetValidResponse {
  isTopologicalSubsetValid: boolean;
  apiTrackingId: string; // included in remote API only
}
`.trim();


const WEBHOOK_EVENT_TYPES = `
//types
${BRANCH_TYPE}

//events
export interface TestWebhookEvent {
  event: "test";
  repositoryId: string;
  payload: {};
}

export interface BranchUpdatedWebhook {
  event: "branch.updated";
  repositoryId: string;
  payload: {
    branch: Branch;
  };
}
`.trim();


function CLIDocs() {
  const theme = useTheme();
  // change this
  const docsMetaTitle = usePlainText("meta_tags.api_docs");
  const renderLinkNode = useCallback(
    (
      node: StaticLinkNode<React.ReactElement>,
      renderers
    ): React.ReactElement => {
      let children = renderers.renderStaticNodes(node.children, renderers);
      return (
          <Link
            style={{ fontWeight: 600, color: theme.colors.linkColor, display: 'inline-block' }}
            to={node.href}
          >
            {children}
          </Link>
      );
    },
    [theme]
  );


  const localSettingsImg = useMemo(() => {
    if (theme.name == "light") {
      return LocalSettingsLight;
    }
    return LocalSettingsDark;
  }, [theme.name]);

  const remoteSettingsImg = useMemo(() => {
    if (theme.name == "light") {
      return RemoteSettingsLight;
    }
    return RemoteSettingsDark;
  }, [theme.name]);

  const remoteKeysImg = useMemo(() => {
    if (theme.name == "light") {
      return RemoteKeysLight;
    }
    return RemoteKeysDark;
  }, [theme.name]);

  const docsTitle = usePlainText("doc_titles.docs_page_title");
  const pageDocsTitle = usePlainText("doc_titles.dev_docs_page_title");
  const apiDocsTitle = usePlainText("doc_titles.api_docs_page_title");

  const titleChain = useMemo((): LinkChain => {
    return {
      label: docsTitle,
      value: '/docs',
      next: {
        prefix: '/',
        label: pageDocsTitle,
        value: '/docs/dev',
        next: {
          label: apiDocsTitle,
          prefix: '/',
          value: '/docs/dev/api',
        }
      }
    }
  }, [docsTitle, pageDocsTitle, apiDocsTitle]);

  const rtRenderers = useMemo(() => {
    return {
      ...richTextRenderers,
      renderLinkNode,
    };
  }, [renderLinkNode]);

  const article = useRichText(
    "dev_docs.api_docs_floro",
    {
      docSearch: (
        <DocSearch
          docs="development"
          linkChain={titleChain}
        />
      ),
      localSettings: (
        <div>
          <ScreenshotImg src={localSettingsImg}/>
        </div>
      ),
      remoteSettings: (
        <div>
          <ScreenshotImg src={remoteSettingsImg}/>
        </div>
      ),
      remoteKeys: (
        <div>
          <ScreenshotImg src={remoteKeysImg}/>
        </div>
      ),
      repoType: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {REPO_TYPE}
          </Highlight>
        </CodeOut>
      ),
      branchType: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {BRANCH_TYPE}
          </Highlight>
        </CodeOut>
      ),
      commitType: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {COMMIT_TYPE}
          </Highlight>
        </CodeOut>
      ),
      stateType: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900, marginBottom: 24}}>
          <Highlight className="typescript">
            {STATE_TYPE}
          </Highlight>
        </CodeOut>
      ),
      binaryType: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {BINARY_TYPE}
          </Highlight>
        </CodeOut>
      ),
      manifestType: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {MANIFEST_TYPE}
          </Highlight>
        </CodeOut>
      ),
      rootSchemaMapType: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {ROOT_SCHEMA_MAP_TYPE}
          </Highlight>
        </CodeOut>
      ),
      invalidityMapType: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {INVALIDITY_MAP_TYPE}
          </Highlight>
        </CodeOut>
      ),
      webhookEventTypes: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {WEBHOOK_EVENT_TYPES}
          </Highlight>
        </CodeOut>
      ),
      repositoriesResponse: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {REPOSITORIES_RESPONSE}
          </Highlight>
        </CodeOut>
      ),
      repositoryResponse: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {REPOSITORY_RESPONSE}
          </Highlight>
        </CodeOut>
      ),
      branchesResponse: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {BRANCHES_RESPONSE}
          </Highlight>
        </CodeOut>
      ),
      branchResponse: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {BRANCH_RESPONSE}
          </Highlight>
        </CodeOut>
      ),
      commitResponse: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {COMMIT_RESPONSE}
          </Highlight>
        </CodeOut>
      ),
      stateLinkResponse: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {STATE_LINK_COMMIT_RESPONSE}
          </Highlight>
        </CodeOut>
      ),
      binaryResponse: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {BINARIES_RESPONSE}
          </Highlight>
        </CodeOut>
      ),
      manifestsResponse: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {MANIFEST_RESPONSE}
          </Highlight>
        </CodeOut>
      ),
      rootSchemaMapResponse: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {ROOT_SCHEMA_MAP_RESPONSE}
          </Highlight>
        </CodeOut>
      ),
      invalidityMapResponse: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {INVALIDITY_MAP_RESPONSE}
          </Highlight>
        </CodeOut>
      ),
      isTopologicalSubsetResponse: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {IS_TOPOLOGICAL_SUBSET_RESPONSE}
          </Highlight>
        </CodeOut>
      ),
      isTopologicalSubsetValidResponse: (
        <CodeOut style={{fontSize: '1.2rem', overflowX: 'scroll', maxWidth: 900}}>
          <Highlight className="typescript">
            {IS_TOPOLOGICAL_SUBSET_VALID_RESPONSE}
          </Highlight>
        </CodeOut>
      ),
      mainTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <SectionTitle>{content}</SectionTitle>;
      },
      subtitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <SubTitle>{content}</SubTitle>;
      },
      apiTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <APITitle>{content}</APITitle>;
      },
    },
    rtRenderers
  );

  return (
    <PageWrapper>
      <Helmet>
        <title>{docsMetaTitle}</title>
      </Helmet>
      <AboutWrapper>
        <div
          style={{
            padding: 16,
          }}
        >
          <SectionParagraph>
            <section>{article}</section>
          </SectionParagraph>
        </div>
      </AboutWrapper>
    </PageWrapper>
  );
}

export default CLIDocs;