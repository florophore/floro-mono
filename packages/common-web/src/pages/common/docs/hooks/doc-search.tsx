import { useEffect, useState } from "react";
import { useFloroText } from "../../../../floro_listener/FloroTextProvider";
import { useLocales } from "../../../../floro_listener/hooks/locales";
import { Locales, PhraseKeys, getPhraseValue } from "@floro/common-generators/floro_modules/text-generator";
import { plainTextRenderers } from "../../../../floro_listener/FloroPlainTextRenderer";

const productDocs = [
  {
    path: "/docs/product/product-and-terms",
    titleKey: "doc_titles.product_and_terminology_docs_page_title",
    phraseKey: "product_docs.product_and_terminology_overview",
  },
  {
    path: "/docs/product/user-portal",
    titleKey: "doc_titles.user_portal_docs_page_title",
    phraseKey: "product_docs.user_portal_docs",
  },
  {
    path: "/docs/product/org-portal",
    titleKey: "doc_titles.org_portal_docs_page_title",
    phraseKey: "product_docs.org_portal_docs",
  },
  {
    path: "/docs/product/local-repositories",
    titleKey: "doc_titles.local_repositories_docs_page_title",
    phraseKey: "product_docs.local_repository_docs",
  },
  {
    path: "/docs/product/remote-repositories",
    titleKey: "doc_titles.remote_repositories_docs_page_title",
    phraseKey: "product_docs.remote_repository_docs",
  },
  {
    path: "/docs/product/merging-and-conflicts",
    titleKey: "doc_titles.merge_and_conflicts_docs_page_title",
    phraseKey: "product_docs.merging_and_conflicts_docs",
  },
  {
    path: "/docs/product/advanced-commands",
    titleKey: "doc_titles.advanced_commands_docs_page_title",
    phraseKey: "product_docs.advanced_commands_docs",
  },
  {
    path: "/docs/product/floro-chrome-extension",
    titleKey: "doc_titles.chrome_extension_docs_page_title",
    phraseKey: "product_docs.floro_chrome_extension",
  },
  {
    path: "/docs/product/copy-and-paste",
    titleKey: "doc_titles.copy_and_paste",
    phraseKey: "product_docs.copy_and_paste",
  },
];

const devDocs = [
  {
    path: "/docs/dev/integrating",
    titleKey: "doc_titles.integration_docs_page_title",
    phraseKey: "dev_docs.integrating_floro",
  },
  {
    path: "/docs/dev/cli",
    titleKey: "doc_titles.cli_docs_page_title",
    phraseKey: "dev_docs.cli_docs_floro",
  },
  {
    path: "/docs/dev/api",
    titleKey: "doc_titles.api_docs_page_title",
    phraseKey: "dev_docs.api_docs_floro",
  },
  {
    path: "/docs/dev/developing-with-floro",
    titleKey: "doc_titles.developing_with_floro_docs_page_title",
    phraseKey: "dev_docs.developing_with_floro_docs_floro",
  },
];

export const useDocSearch = (docs: "product"|"development", searchString: string, limit = 4) => {

  const floroText = useFloroText();
  const { selectedLocaleCode } = useLocales();

  const [docStrings, setDocStrings] = useState<Array<{article: string, title: string, path: string}>>([]);

  useEffect(() => {
    if (searchString.trim() == "") {
        setDocStrings([]);
        return;
    }
    const docsMeta = docs == "development" ? devDocs : productDocs;

    const articles = docsMeta.map(docMetaInfo => {
        const articleNodes = getPhraseValue<string, keyof Locales, any>(
          floroText,
          selectedLocaleCode,
          docMetaInfo.phraseKey,
          {}
        );
        const titleNodes = getPhraseValue<string, keyof Locales, any>(
          floroText,
          selectedLocaleCode,
          docMetaInfo.titleKey,
          {}
        );
        const article = plainTextRenderers.render(articleNodes, plainTextRenderers);
        const title = plainTextRenderers.render(titleNodes, plainTextRenderers);
        return {
            article,
            title,
            path: docMetaInfo.path
        }
    }).filter(articleInfo => {
        if (articleInfo.article.toLowerCase().indexOf(searchString.toLowerCase()) != -1) {
            return true;
        }
        if (articleInfo.title.toLowerCase().indexOf(searchString.toLowerCase()) != -1) {
            return true;
        }
        return false;
    });

    setDocStrings(articles.slice(0, limit));
  }, [floroText, selectedLocaleCode, searchString, docs])

  return docStrings;
}