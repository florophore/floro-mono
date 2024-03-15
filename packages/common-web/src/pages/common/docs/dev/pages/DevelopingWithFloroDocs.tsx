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
import SystemDesignFloroText from "@floro/main/public/doc_images/development/system_design_floro_text.jpg";
import CLICopy from "../../../../../components/home/CLICopy";
import ColorPalette from "@floro/styles/ColorPalette";
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

const SectionParagraph = styled.div`
  font-size: 1.44rem;
  font-weight: 400;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
  @media screen and (max-width: 767px) {
    font-size: 1.2rem;
  }
`;

const SlideImg = styled.img`
  width: 100%;
  max-width: 900px;
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

const HELP_OUTPUT = `
Commands:
  floro start                                              Start the floro daemon
  floro kill                                                 Kill the floro daemon
  floro restart                                           Restart the floro daemon
  floro login                                              Login to floro via cli
  floro logout                                            Logout from floro via cli
  floro create-generator [generator]        Generates floro generator scaffolding
  floro create-plugin [plugin]                    Generates floro plugin scaffolding
  floro module                                          Build application state from repository
  floro generator                                      Generator development commands
  floro plugin                                            Local plugin development commands

Options:
  --version  Show version number
  --help     Show help
`.trim();

const MODULE_HELP_OUTPUT = `
Build application state from repository

Commands:
  floro module sync           Syncs state to meta file
  floro module build           Builds application state from floro repository
  floro module watch         Watch floro state and rebuild
  floro module current       Use current state and rebuild

Options:
      --version            Show version number
      --help                 Show help
  -m, --module         Specify the floro module script
  -k, --remote-key    Specify a remote api key to pull with (only needed if logged out)
  -l, --local                Syncs meta file with state from local repository
`.trim();

const FLORO_MODULE_JS = `
const paletteGenerator = require("@floro/palette-generator");
const themesGenerator = require("@floro/themes-generator");
const iconGenerator = require("@floro/icon-generator");
const textGenerator = require("@floro/text-generator")

module.exports = function () {
  return {
    repository: "@floro/floro-mono", // this points to your floro repository
    // branch: "main", (branch defaults to "main", but you could point to any branch)
    generators: [
      {
        generator: iconGenerator,
        args: {
          lang: "typescript",
        },
      },
      {
        generator: themesGenerator,
        args: {
          lang: "typescript",
        },
      },
      {
        generator: paletteGenerator,
        args: {
          lang: "typescript",
        },
      },
      {
        generator: textGenerator,
        args: {
          lang: "typescript",
        },
      },
    ],
  };
};
`.trim();

const META_FLORO_JSON = `
{
  "moduleFile": "floro.module.js",
  "repositoryId": "12aa1618-9e0b-404c-8423-7c38047e18c9",
  "sha": "892bdc97a7f4f26c7ede62edb8591c44d1afd561a6d94c41c81a8ee48e9b3a52",
  "message": "updated docs",
  "idx": 95,
  "generatorDependencies": {
    "icon-generator": {
      "icons": "0.0.40"
    },
    "themes-generator": {
      "theme": "0.0.40"
    },
    "palette-generator": {
      "palette": "0.0.39"
    },
    "text-generator": {
      "text": "0.0.32"
    }
  }
}
`.trim();

function DevelopingWithFloroDocs() {
  const theme = useTheme();
  // change this
  const docsMetaTitle = usePlainText("meta_tags.developing_with_floro_docs");
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

  const docsTitle = usePlainText("doc_titles.docs_page_title");
  const pageDocsTitle = usePlainText("doc_titles.dev_docs_page_title");
  const cliDocsTitle = usePlainText("doc_titles.developing_with_floro_docs_page_title");

  const titleChain = useMemo((): LinkChain => {
    return {
      label: docsTitle,
      value: '/docs',
      next: {
        prefix: '/',
        label: pageDocsTitle,
        value: '/docs/dev',
        next: {
          label: cliDocsTitle,
          prefix: '/',
          value: '/docs/dev/developing-with-floro',
        }
      }
    }
  }, [docsTitle, pageDocsTitle, cliDocsTitle]);

  const rtRenderers = useMemo(() => {
    return {
      ...richTextRenderers,
      renderLinkNode,
    };
  }, [renderLinkNode]);

  const article = useRichText(
    "dev_docs.developing_with_floro_docs_floro",
    {
      docSearch: (
        <DocSearch
          docs="development"
          linkChain={titleChain}
        />
      ),
      mainTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <SectionTitle>{content}</SectionTitle>;
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

export default DevelopingWithFloroDocs;