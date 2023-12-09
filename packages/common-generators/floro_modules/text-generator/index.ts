import textJSON from './text.json';

// To parse this data:
//
//   import { Convert, LocalizedPhrases } from "./file";
//
//   const localizedPhrases = Convert.toLocalizedPhrases(json);

export interface LocalizedPhrases {
    locales:             Locales;
    localizedPhraseKeys: LocalizedPhraseKeys;
    phraseKeyDebugInfo:  PhraseKeyDebugInfo;
}

export interface Locales {
    EN?: En;
    ZH?: Zh;
}

export interface En {
    defaultFallbackCode: null | string;
    isGlobalDefault:     boolean;
    localeCode:          string;
    name:                string;
}

export interface Zh {
    defaultFallbackCode: null | string;
    isGlobalDefault:     boolean;
    localeCode:          string;
    name:                string;
}

export interface LocalizedPhraseKeys {
    EN: PhraseKeys;
    ZH: PhraseKeys;
}

export interface PhraseKeys {
    "about.bringing_it_all_together_part_1":              AboutBringingItAllTogetherPart1;
    "about.bringing_it_all_together_title":               AboutBringingItAllTogetherTitle;
    "about.how_floro_works_title":                        AboutHowFloroWorksTitle;
    "about.how_it's_all_related":                         AboutHowItSAllRelated;
    "about.how_it_is_all_related_blurb_1":                AboutHowItIsAllRelatedBlurb1;
    "about.how_it_is_all_related_part_2":                 AboutHowItIsAllRelatedPart2;
    "about.how_it_works_blurb":                           AboutHowItWorksBlurb;
    "about.how_it_works_blurb_part_2":                    AboutHowItWorksBlurbPart2;
    "about.how_it_works_blurb_part_3":                    AboutHowItWorksBlurbPart3;
    "about.how_it_works_blurb_part_4":                    AboutHowItWorksBlurbPart4;
    "about.how_its_all_related_part_3":                   AboutHowItsAllRelatedPart3;
    "about.things_change_blurb_1":                        AboutThingsChangeBlurb1;
    "about.things_change_blurb_2":                        AboutThingsChangeBlurb2;
    "about.things_change_blurb_3":                        AboutThingsChangeBlurb3;
    "about.things_change_title":                          AboutThingsChangeTitle;
    "about.whats_the_difference_blurb_1":                 AboutWhatsTheDifferenceBlurb1;
    "about.whats_the_difference_blurb_2":                 AboutWhatsTheDifferenceBlurb2;
    "about.whats_the_difference_part_4":                  AboutWhatsTheDifferencePart4;
    "about.whats_the_difference_part_5":                  AboutWhatsTheDifferencePart5;
    "about.whats_the_difference_part_6":                  AboutWhatsTheDifferencePart6;
    "about.whats_the_difference_part_7":                  AboutWhatsTheDifferencePart7;
    "about.whats_the_difference_title":                   AboutWhatsTheDifferenceTitle;
    "about.whats_the_different_part_3":                   AboutWhatsTheDifferentPart3;
    "components.copied":                                  ComponentsCopied;
    "components.copyright":                               ComponentsCopyright;
    "components.privacy_policy":                          ComponentsPrivacyPolicy;
    "components.released_under_mit":                      ComponentsReleasedUnderMIT;
    "components.terms_of_service":                        ComponentsTermsOfService;
    "doc_titles.docs_page_title":                         DocTitlesDocsPageTitle;
    "doc_titles.org_portal_docs_page_title":              DocTitlesOrgPortalDocsPageTitle;
    "doc_titles.product_and_terminology_docs_page_title": DocTitlesProductAndTerminologyDocsPageTitle;
    "doc_titles.product_docs_page_title":                 DocTitlesProductDocsPageTitle;
    "doc_titles.user_portal_docs_page_title":             DocTitlesUserPortalDocsPageTitle;
    "docs.docs_general":                                  DocsDocsGeneral;
    "docs.icons_plugin_description":                      DocsIconsPluginDescription;
    "docs.palette_plugin_description":                    DocsPalettePluginDescription;
    "docs.search_developer_docs":                         DocsSearchDeveloperDocs;
    "docs.search_product_docs":                           DocsSearchProductDocs;
    "docs.search_product_docs_page":                      DocsSearchProductDocsPage;
    "docs.text_plugin_description":                       DocsTextPluginDescription;
    "docs.theme_plugin_description":                      DocsThemePluginDescription;
    "front_page.appearance":                              FrontPageAppearance;
    "front_page.download_desktop_client":                 FrontPageDownloadDesktopClient;
    "front_page.get_help_and_contribute":                 FrontPageGetHelpAndContribute;
    "front_page.install_the_cli":                         FrontPageInstallTheCLI;
    "front_page.nav_about":                               FrontPageNavAbout;
    "front_page.nav_consulting":                          FrontPageNavConsulting;
    "front_page.nav_docs":                                FrontPageNavDocs;
    "front_page.nav_download":                            FrontPageNavDownload;
    "front_page.nav_foss":                                FrontPageNavFOSS;
    "front_page.nav_pricing":                             FrontPageNavPricing;
    "front_page.read_technical_overview":                 FrontPageReadTechnicalOverview;
    "front_page.see_a_demo":                              FrontPageSeeADemo;
    "front_page.subtext_of_tag_line":                     FrontPageSubtextOfTagLine;
    "front_page.tag_line":                                FrontPageTagLine;
    "how_it_works.how_it_works_blog":                     HowItWorksHowItWorksBlog;
    "how_it_works.how_it_works_blog_part_2":              HowItWorksHowItWorksBlogPart2;
    "main.hello_world":                                   MainHelloWorld;
    "meta_tags.about":                                    MetaTagsAbout;
    "meta_tags.docs":                                     MetaTagsDocs;
    "meta_tags.how_it_works":                             MetaTagsHowItWorks;
    "meta_tags.org_portal_docs":                          MetaTagsOrgPortalDocs;
    "meta_tags.product_docs":                             MetaTagsProductDocs;
    "meta_tags.product_docs_and_terminology":             MetaTagsProductDocsAndTerminology;
    "meta_tags.user_portal_docs":                         MetaTagsUserPortalDocs;
    "product_docs.org_portal_docs":                       ProductDocsOrgPortalDocs;
    "product_docs.product_and_terminology_overview":      ProductDocsProductAndTerminologyOverview;
    "product_docs.product_docs_general":                  ProductDocsProductDocsGeneral;
    "product_docs.product_docs_index":                    ProductDocsProductDocsIndex;
    "product_docs.user_portal_docs":                      ProductDocsUserPortalDocs;
}

export interface AboutBringingItAllTogetherPart1 {
    args:             AboutBringingItAllTogetherPart1_Args;
    contentVariables: AboutBringingItAllTogetherPart1_ContentVariables;
    interpolations:   AboutBringingItAllTogetherPart1_Interpolations;
    links:            AboutBringingItAllTogetherPart1_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutBringingItAllTogetherPart1_StyleClasses;
    styledContents:   AboutBringingItAllTogetherPart1_StyledContents;
    variables:        AboutBringingItAllTogetherPart1_Variables;
}

export interface AboutBringingItAllTogetherPart1_Args {
}

export interface AboutBringingItAllTogetherPart1_ContentVariables {
}

export interface AboutBringingItAllTogetherPart1_Interpolations {
}

export interface AboutBringingItAllTogetherPart1_Links {
    "CRDT Link":            Link;
    "Git Merge Link":       Link;
    "Three Way Merge Link": Link;
}

export interface Link {
    displayValue: TextNode[];
    href?:        PlainTextNode[];
    linkName:     string;
}

export interface TextNode {
    children: TextNode[];
    content:  string;
    styles:   Styles;
    type:     PhraseType;
}

export interface Styles {
    isBold:          boolean;
    isItalic:        boolean;
    isStrikethrough: boolean;
    isSubscript:     boolean;
    isSuperscript:   boolean;
    isUnderlined:    boolean;
}

export enum PhraseType {
    ContentVariable = "content-variable",
    Interpolation = "interpolation",
    Li = "li",
    Link = "link",
    Ol = "ol",
    StyledContent = "styled-content",
    Text = "text",
    UL = "ul",
    Variable = "variable",
}

export interface PlainTextNode {
    content: string;
    type:    HrefType;
}

export enum HrefType {
    Text = "text",
    Variable = "variable",
}

export interface AboutBringingItAllTogetherPart1_StyleClasses {
}

export interface AboutBringingItAllTogetherPart1_StyledContents {
}

export interface AboutBringingItAllTogetherPart1_Variables {
}

export interface AboutBringingItAllTogetherTitle {
    args:             AboutBringingItAllTogetherTitleArgs;
    contentVariables: AboutBringingItAllTogetherTitleContentVariables;
    interpolations:   AboutBringingItAllTogetherTitleInterpolations;
    links:            AboutBringingItAllTogetherTitleLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutBringingItAllTogetherTitleStyleClasses;
    styledContents:   AboutBringingItAllTogetherTitleStyledContents;
    variables:        AboutBringingItAllTogetherTitleVariables;
}

export interface AboutBringingItAllTogetherTitleArgs {
}

export interface AboutBringingItAllTogetherTitleContentVariables {
}

export interface AboutBringingItAllTogetherTitleInterpolations {
}

export interface AboutBringingItAllTogetherTitleLinks {
}

export interface AboutBringingItAllTogetherTitleStyleClasses {
}

export interface AboutBringingItAllTogetherTitleStyledContents {
}

export interface AboutBringingItAllTogetherTitleVariables {
}

export interface AboutHowFloroWorksTitle {
    args:             AboutHowFloroWorksTitleArgs;
    contentVariables: AboutHowFloroWorksTitleContentVariables;
    interpolations:   AboutHowFloroWorksTitleInterpolations;
    links:            AboutHowFloroWorksTitleLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutHowFloroWorksTitleStyleClasses;
    styledContents:   AboutHowFloroWorksTitleStyledContents;
    variables:        AboutHowFloroWorksTitleVariables;
}

export interface AboutHowFloroWorksTitleArgs {
}

export interface AboutHowFloroWorksTitleContentVariables {
}

export interface AboutHowFloroWorksTitleInterpolations {
}

export interface AboutHowFloroWorksTitleLinks {
}

export interface AboutHowFloroWorksTitleStyleClasses {
}

export interface AboutHowFloroWorksTitleStyledContents {
}

export interface AboutHowFloroWorksTitleVariables {
}

export interface AboutHowItSAllRelated {
    args:             AboutHowItSAllRelatedArgs;
    contentVariables: AboutHowItSAllRelatedContentVariables;
    interpolations:   AboutHowItSAllRelatedInterpolations;
    links:            AboutHowItSAllRelatedLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutHowItSAllRelatedStyleClasses;
    styledContents:   AboutHowItSAllRelatedStyledContents;
    variables:        AboutHowItSAllRelatedVariables;
}

export interface AboutHowItSAllRelatedArgs {
}

export interface AboutHowItSAllRelatedContentVariables {
}

export interface AboutHowItSAllRelatedInterpolations {
}

export interface AboutHowItSAllRelatedLinks {
}

export interface AboutHowItSAllRelatedStyleClasses {
}

export interface AboutHowItSAllRelatedStyledContents {
}

export interface AboutHowItSAllRelatedVariables {
}

export interface AboutHowItIsAllRelatedBlurb1 {
    args:             AboutHowItIsAllRelatedBlurb1_Args;
    contentVariables: AboutHowItIsAllRelatedBlurb1_ContentVariables;
    interpolations:   AboutHowItIsAllRelatedBlurb1_Interpolations;
    links:            AboutHowItIsAllRelatedBlurb1_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutHowItIsAllRelatedBlurb1_StyleClasses;
    styledContents:   AboutHowItIsAllRelatedBlurb1_StyledContents;
    variables:        AboutHowItIsAllRelatedBlurb1_Variables;
}

export interface AboutHowItIsAllRelatedBlurb1_Args {
}

export interface AboutHowItIsAllRelatedBlurb1_ContentVariables {
}

export interface AboutHowItIsAllRelatedBlurb1_Interpolations {
}

export interface AboutHowItIsAllRelatedBlurb1_Links {
}

export interface AboutHowItIsAllRelatedBlurb1_StyleClasses {
}

export interface AboutHowItIsAllRelatedBlurb1_StyledContents {
}

export interface AboutHowItIsAllRelatedBlurb1_Variables {
}

export interface AboutHowItIsAllRelatedPart2 {
    args:             AboutHowItIsAllRelatedPart2_Args;
    contentVariables: AboutHowItIsAllRelatedPart2_ContentVariables;
    interpolations:   AboutHowItIsAllRelatedPart2_Interpolations;
    links:            AboutHowItIsAllRelatedPart2_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutHowItIsAllRelatedPart2_StyleClasses;
    styledContents:   AboutHowItIsAllRelatedPart2_StyledContents;
    variables:        AboutHowItIsAllRelatedPart2_Variables;
}

export interface AboutHowItIsAllRelatedPart2_Args {
}

export interface AboutHowItIsAllRelatedPart2_ContentVariables {
}

export interface AboutHowItIsAllRelatedPart2_Interpolations {
}

export interface AboutHowItIsAllRelatedPart2_Links {
}

export interface AboutHowItIsAllRelatedPart2_StyleClasses {
}

export interface AboutHowItIsAllRelatedPart2_StyledContents {
}

export interface AboutHowItIsAllRelatedPart2_Variables {
}

export interface AboutHowItWorksBlurb {
    args:             AboutHowItWorksBlurbArgs;
    contentVariables: AboutHowItWorksBlurbContentVariables;
    interpolations:   AboutHowItWorksBlurbInterpolations;
    links:            AboutHowItWorksBlurbLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutHowItWorksBlurbStyleClasses;
    styledContents:   AboutHowItWorksBlurbStyledContents;
    variables:        AboutHowItWorksBlurbVariables;
}

export interface AboutHowItWorksBlurbArgs {
}

export interface AboutHowItWorksBlurbContentVariables {
}

export interface AboutHowItWorksBlurbInterpolations {
}

export interface AboutHowItWorksBlurbLinks {
    redux: Link;
}

export interface AboutHowItWorksBlurbStyleClasses {
}

export interface AboutHowItWorksBlurbStyledContents {
}

export interface AboutHowItWorksBlurbVariables {
}

export interface AboutHowItWorksBlurbPart2 {
    args:             AboutHowItWorksBlurbPart2_Args;
    contentVariables: AboutHowItWorksBlurbPart2_ContentVariables;
    interpolations:   AboutHowItWorksBlurbPart2_Interpolations;
    links:            AboutHowItWorksBlurbPart2_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutHowItWorksBlurbPart2_StyleClasses;
    styledContents:   AboutHowItWorksBlurbPart2_StyledContents;
    variables:        AboutHowItWorksBlurbPart2_Variables;
}

export interface AboutHowItWorksBlurbPart2_Args {
}

export interface AboutHowItWorksBlurbPart2_ContentVariables {
}

export interface AboutHowItWorksBlurbPart2_Interpolations {
}

export interface AboutHowItWorksBlurbPart2_Links {
}

export interface AboutHowItWorksBlurbPart2_StyleClasses {
}

export interface AboutHowItWorksBlurbPart2_StyledContents {
}

export interface AboutHowItWorksBlurbPart2_Variables {
}

export interface AboutHowItWorksBlurbPart3 {
    args:             AboutHowItWorksBlurbPart3_Args;
    contentVariables: AboutHowItWorksBlurbPart3_ContentVariables;
    interpolations:   AboutHowItWorksBlurbPart3_Interpolations;
    links:            AboutHowItWorksBlurbPart3_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutHowItWorksBlurbPart3_StyleClasses;
    styledContents:   AboutHowItWorksBlurbPart3_StyledContents;
    variables:        AboutHowItWorksBlurbPart3_Variables;
}

export interface AboutHowItWorksBlurbPart3_Args {
}

export interface AboutHowItWorksBlurbPart3_ContentVariables {
}

export interface AboutHowItWorksBlurbPart3_Interpolations {
}

export interface AboutHowItWorksBlurbPart3_Links {
}

export interface AboutHowItWorksBlurbPart3_StyleClasses {
}

export interface AboutHowItWorksBlurbPart3_StyledContents {
}

export interface AboutHowItWorksBlurbPart3_Variables {
}

export interface AboutHowItWorksBlurbPart4 {
    args:             AboutHowItWorksBlurbPart4_Args;
    contentVariables: AboutHowItWorksBlurbPart4_ContentVariables;
    interpolations:   AboutHowItWorksBlurbPart4_Interpolations;
    links:            AboutHowItWorksBlurbPart4_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutHowItWorksBlurbPart4_StyleClasses;
    styledContents:   AboutHowItWorksBlurbPart4_StyledContents;
    variables:        AboutHowItWorksBlurbPart4_Variables;
}

export interface AboutHowItWorksBlurbPart4_Args {
}

export interface AboutHowItWorksBlurbPart4_ContentVariables {
}

export interface AboutHowItWorksBlurbPart4_Interpolations {
}

export interface AboutHowItWorksBlurbPart4_Links {
}

export interface AboutHowItWorksBlurbPart4_StyleClasses {
}

export interface AboutHowItWorksBlurbPart4_StyledContents {
}

export interface AboutHowItWorksBlurbPart4_Variables {
}

export interface AboutHowItsAllRelatedPart3 {
    args:             AboutHowItsAllRelatedPart3_Args;
    contentVariables: AboutHowItsAllRelatedPart3_ContentVariables;
    interpolations:   AboutHowItsAllRelatedPart3_Interpolations;
    links:            AboutHowItsAllRelatedPart3_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutHowItsAllRelatedPart3_StyleClasses;
    styledContents:   AboutHowItsAllRelatedPart3_StyledContents;
    variables:        AboutHowItsAllRelatedPart3_Variables;
}

export interface AboutHowItsAllRelatedPart3_Args {
}

export interface AboutHowItsAllRelatedPart3_ContentVariables {
}

export interface AboutHowItsAllRelatedPart3_Interpolations {
}

export interface AboutHowItsAllRelatedPart3_Links {
}

export interface AboutHowItsAllRelatedPart3_StyleClasses {
}

export interface AboutHowItsAllRelatedPart3_StyledContents {
}

export interface AboutHowItsAllRelatedPart3_Variables {
}

export interface AboutThingsChangeBlurb1 {
    args:             AboutThingsChangeBlurb1_Args;
    contentVariables: AboutThingsChangeBlurb1_ContentVariables;
    interpolations:   AboutThingsChangeBlurb1_Interpolations;
    links:            AboutThingsChangeBlurb1_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutThingsChangeBlurb1_StyleClasses;
    styledContents:   AboutThingsChangeBlurb1_StyledContents;
    variables:        AboutThingsChangeBlurb1_Variables;
}

export interface AboutThingsChangeBlurb1_Args {
}

export interface AboutThingsChangeBlurb1_ContentVariables {
}

export interface AboutThingsChangeBlurb1_Interpolations {
}

export interface AboutThingsChangeBlurb1_Links {
}

export interface AboutThingsChangeBlurb1_StyleClasses {
}

export interface AboutThingsChangeBlurb1_StyledContents {
}

export interface AboutThingsChangeBlurb1_Variables {
}

export interface AboutThingsChangeBlurb2 {
    args:             AboutThingsChangeBlurb2_Args;
    contentVariables: AboutThingsChangeBlurb2_ContentVariables;
    interpolations:   AboutThingsChangeBlurb2_Interpolations;
    links:            AboutThingsChangeBlurb2_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutThingsChangeBlurb2_StyleClasses;
    styledContents:   AboutThingsChangeBlurb2_StyledContents;
    variables:        AboutThingsChangeBlurb2_Variables;
}

export interface AboutThingsChangeBlurb2_Args {
}

export interface AboutThingsChangeBlurb2_ContentVariables {
}

export interface AboutThingsChangeBlurb2_Interpolations {
}

export interface AboutThingsChangeBlurb2_Links {
}

export interface AboutThingsChangeBlurb2_StyleClasses {
}

export interface AboutThingsChangeBlurb2_StyledContents {
}

export interface AboutThingsChangeBlurb2_Variables {
}

export interface AboutThingsChangeBlurb3 {
    args:             AboutThingsChangeBlurb3_Args;
    contentVariables: AboutThingsChangeBlurb3_ContentVariables;
    interpolations:   AboutThingsChangeBlurb3_Interpolations;
    links:            AboutThingsChangeBlurb3_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutThingsChangeBlurb3_StyleClasses;
    styledContents:   AboutThingsChangeBlurb3_StyledContents;
    variables:        AboutThingsChangeBlurb3_Variables;
}

export interface AboutThingsChangeBlurb3_Args {
}

export interface AboutThingsChangeBlurb3_ContentVariables {
}

export interface AboutThingsChangeBlurb3_Interpolations {
}

export interface AboutThingsChangeBlurb3_Links {
    "unit test": Link;
}

export interface AboutThingsChangeBlurb3_StyleClasses {
}

export interface AboutThingsChangeBlurb3_StyledContents {
}

export interface AboutThingsChangeBlurb3_Variables {
}

export interface AboutThingsChangeTitle {
    args:             AboutThingsChangeTitleArgs;
    contentVariables: AboutThingsChangeTitleContentVariables;
    interpolations:   AboutThingsChangeTitleInterpolations;
    links:            AboutThingsChangeTitleLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutThingsChangeTitleStyleClasses;
    styledContents:   AboutThingsChangeTitleStyledContents;
    variables:        AboutThingsChangeTitleVariables;
}

export interface AboutThingsChangeTitleArgs {
}

export interface AboutThingsChangeTitleContentVariables {
}

export interface AboutThingsChangeTitleInterpolations {
}

export interface AboutThingsChangeTitleLinks {
}

export interface AboutThingsChangeTitleStyleClasses {
}

export interface AboutThingsChangeTitleStyledContents {
}

export interface AboutThingsChangeTitleVariables {
}

export interface AboutWhatsTheDifferenceBlurb1 {
    args:             AboutWhatsTheDifferenceBlurb1_Args;
    contentVariables: AboutWhatsTheDifferenceBlurb1_ContentVariables;
    interpolations:   AboutWhatsTheDifferenceBlurb1_Interpolations;
    links:            AboutWhatsTheDifferenceBlurb1_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutWhatsTheDifferenceBlurb1_StyleClasses;
    styledContents:   AboutWhatsTheDifferenceBlurb1_StyledContents;
    variables:        AboutWhatsTheDifferenceBlurb1_Variables;
}

export interface AboutWhatsTheDifferenceBlurb1_Args {
}

export interface AboutWhatsTheDifferenceBlurb1_ContentVariables {
}

export interface AboutWhatsTheDifferenceBlurb1_Interpolations {
}

export interface AboutWhatsTheDifferenceBlurb1_Links {
    "Longest Common Subsequence": Link;
    "YouTube Link":               Link;
}

export interface AboutWhatsTheDifferenceBlurb1_StyleClasses {
}

export interface AboutWhatsTheDifferenceBlurb1_StyledContents {
}

export interface AboutWhatsTheDifferenceBlurb1_Variables {
}

export interface AboutWhatsTheDifferenceBlurb2 {
    args:             AboutWhatsTheDifferenceBlurb2_Args;
    contentVariables: AboutWhatsTheDifferenceBlurb2_ContentVariables;
    interpolations:   AboutWhatsTheDifferenceBlurb2_Interpolations;
    links:            AboutWhatsTheDifferenceBlurb2_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutWhatsTheDifferenceBlurb2_StyleClasses;
    styledContents:   AboutWhatsTheDifferenceBlurb2_StyledContents;
    variables:        AboutWhatsTheDifferenceBlurb2_Variables;
}

export interface AboutWhatsTheDifferenceBlurb2_Args {
}

export interface AboutWhatsTheDifferenceBlurb2_ContentVariables {
}

export interface AboutWhatsTheDifferenceBlurb2_Interpolations {
}

export interface AboutWhatsTheDifferenceBlurb2_Links {
}

export interface AboutWhatsTheDifferenceBlurb2_StyleClasses {
}

export interface AboutWhatsTheDifferenceBlurb2_StyledContents {
}

export interface AboutWhatsTheDifferenceBlurb2_Variables {
}

export interface AboutWhatsTheDifferencePart4 {
    args:             AboutWhatsTheDifferencePart4_Args;
    contentVariables: AboutWhatsTheDifferencePart4_ContentVariables;
    interpolations:   AboutWhatsTheDifferencePart4_Interpolations;
    links:            AboutWhatsTheDifferencePart4_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutWhatsTheDifferencePart4_StyleClasses;
    styledContents:   AboutWhatsTheDifferencePart4_StyledContents;
    variables:        AboutWhatsTheDifferencePart4_Variables;
}

export interface AboutWhatsTheDifferencePart4_Args {
}

export interface AboutWhatsTheDifferencePart4_ContentVariables {
}

export interface AboutWhatsTheDifferencePart4_Interpolations {
}

export interface AboutWhatsTheDifferencePart4_Links {
}

export interface AboutWhatsTheDifferencePart4_StyleClasses {
}

export interface AboutWhatsTheDifferencePart4_StyledContents {
}

export interface AboutWhatsTheDifferencePart4_Variables {
}

export interface AboutWhatsTheDifferencePart5 {
    args:             AboutWhatsTheDifferencePart5_Args;
    contentVariables: AboutWhatsTheDifferencePart5_ContentVariables;
    interpolations:   AboutWhatsTheDifferencePart5_Interpolations;
    links:            AboutWhatsTheDifferencePart5_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutWhatsTheDifferencePart5_StyleClasses;
    styledContents:   AboutWhatsTheDifferencePart5_StyledContents;
    variables:        AboutWhatsTheDifferencePart5_Variables;
}

export interface AboutWhatsTheDifferencePart5_Args {
}

export interface AboutWhatsTheDifferencePart5_ContentVariables {
}

export interface AboutWhatsTheDifferencePart5_Interpolations {
}

export interface AboutWhatsTheDifferencePart5_Links {
}

export interface AboutWhatsTheDifferencePart5_StyleClasses {
}

export interface AboutWhatsTheDifferencePart5_StyledContents {
}

export interface AboutWhatsTheDifferencePart5_Variables {
}

export interface AboutWhatsTheDifferencePart6 {
    args:             AboutWhatsTheDifferencePart6_Args;
    contentVariables: AboutWhatsTheDifferencePart6_ContentVariables;
    interpolations:   AboutWhatsTheDifferencePart6_Interpolations;
    links:            AboutWhatsTheDifferencePart6_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutWhatsTheDifferencePart6_StyleClasses;
    styledContents:   AboutWhatsTheDifferencePart6_StyledContents;
    variables:        AboutWhatsTheDifferencePart6_Variables;
}

export interface AboutWhatsTheDifferencePart6_Args {
}

export interface AboutWhatsTheDifferencePart6_ContentVariables {
}

export interface AboutWhatsTheDifferencePart6_Interpolations {
}

export interface AboutWhatsTheDifferencePart6_Links {
}

export interface AboutWhatsTheDifferencePart6_StyleClasses {
}

export interface AboutWhatsTheDifferencePart6_StyledContents {
}

export interface AboutWhatsTheDifferencePart6_Variables {
}

export interface AboutWhatsTheDifferencePart7 {
    args:             AboutWhatsTheDifferencePart7_Args;
    contentVariables: AboutWhatsTheDifferencePart7_ContentVariables;
    interpolations:   AboutWhatsTheDifferencePart7_Interpolations;
    links:            AboutWhatsTheDifferencePart7_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutWhatsTheDifferencePart7_StyleClasses;
    styledContents:   AboutWhatsTheDifferencePart7_StyledContents;
    variables:        AboutWhatsTheDifferencePart7_Variables;
}

export interface AboutWhatsTheDifferencePart7_Args {
}

export interface AboutWhatsTheDifferencePart7_ContentVariables {
}

export interface AboutWhatsTheDifferencePart7_Interpolations {
}

export interface AboutWhatsTheDifferencePart7_Links {
}

export interface AboutWhatsTheDifferencePart7_StyleClasses {
}

export interface AboutWhatsTheDifferencePart7_StyledContents {
}

export interface AboutWhatsTheDifferencePart7_Variables {
}

export interface AboutWhatsTheDifferenceTitle {
    args:             AboutWhatsTheDifferenceTitleArgs;
    contentVariables: AboutWhatsTheDifferenceTitleContentVariables;
    interpolations:   AboutWhatsTheDifferenceTitleInterpolations;
    links:            AboutWhatsTheDifferenceTitleLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutWhatsTheDifferenceTitleStyleClasses;
    styledContents:   AboutWhatsTheDifferenceTitleStyledContents;
    variables:        AboutWhatsTheDifferenceTitleVariables;
}

export interface AboutWhatsTheDifferenceTitleArgs {
}

export interface AboutWhatsTheDifferenceTitleContentVariables {
}

export interface AboutWhatsTheDifferenceTitleInterpolations {
}

export interface AboutWhatsTheDifferenceTitleLinks {
}

export interface AboutWhatsTheDifferenceTitleStyleClasses {
}

export interface AboutWhatsTheDifferenceTitleStyledContents {
}

export interface AboutWhatsTheDifferenceTitleVariables {
}

export interface AboutWhatsTheDifferentPart3 {
    args:             AboutWhatsTheDifferentPart3_Args;
    contentVariables: AboutWhatsTheDifferentPart3_ContentVariables;
    interpolations:   AboutWhatsTheDifferentPart3_Interpolations;
    links:            AboutWhatsTheDifferentPart3_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     AboutWhatsTheDifferentPart3_StyleClasses;
    styledContents:   AboutWhatsTheDifferentPart3_StyledContents;
    variables:        AboutWhatsTheDifferentPart3_Variables;
}

export interface AboutWhatsTheDifferentPart3_Args {
}

export interface AboutWhatsTheDifferentPart3_ContentVariables {
}

export interface AboutWhatsTheDifferentPart3_Interpolations {
}

export interface AboutWhatsTheDifferentPart3_Links {
}

export interface AboutWhatsTheDifferentPart3_StyleClasses {
}

export interface AboutWhatsTheDifferentPart3_StyledContents {
}

export interface AboutWhatsTheDifferentPart3_Variables {
}

export interface ComponentsCopied {
    args:             ComponentsCopiedArgs;
    contentVariables: ComponentsCopiedContentVariables;
    interpolations:   ComponentsCopiedInterpolations;
    links:            ComponentsCopiedLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     ComponentsCopiedStyleClasses;
    styledContents:   ComponentsCopiedStyledContents;
    variables:        ComponentsCopiedVariables;
}

export interface ComponentsCopiedArgs {
}

export interface ComponentsCopiedContentVariables {
}

export interface ComponentsCopiedInterpolations {
}

export interface ComponentsCopiedLinks {
}

export interface ComponentsCopiedStyleClasses {
}

export interface ComponentsCopiedStyledContents {
}

export interface ComponentsCopiedVariables {
}

export interface ComponentsCopyright {
    args:             ComponentsCopyrightArgs;
    contentVariables: ComponentsCopyrightContentVariables;
    interpolations:   ComponentsCopyrightInterpolations;
    links:            ComponentsCopyrightLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     ComponentsCopyrightStyleClasses;
    styledContents:   ComponentsCopyrightStyledContents;
    variables:        ComponentsCopyrightVariables;
}

export interface ComponentsCopyrightArgs {
}

export interface ComponentsCopyrightContentVariables {
}

export interface ComponentsCopyrightInterpolations {
}

export interface ComponentsCopyrightLinks {
}

export interface ComponentsCopyrightStyleClasses {
}

export interface ComponentsCopyrightStyledContents {
}

export interface ComponentsCopyrightVariables {
}

export interface ComponentsPrivacyPolicy {
    args:             ComponentsPrivacyPolicyArgs;
    contentVariables: ComponentsPrivacyPolicyContentVariables;
    interpolations:   ComponentsPrivacyPolicyInterpolations;
    links:            ComponentsPrivacyPolicyLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     ComponentsPrivacyPolicyStyleClasses;
    styledContents:   ComponentsPrivacyPolicyStyledContents;
    variables:        ComponentsPrivacyPolicyVariables;
}

export interface ComponentsPrivacyPolicyArgs {
}

export interface ComponentsPrivacyPolicyContentVariables {
}

export interface ComponentsPrivacyPolicyInterpolations {
}

export interface ComponentsPrivacyPolicyLinks {
}

export interface ComponentsPrivacyPolicyStyleClasses {
}

export interface ComponentsPrivacyPolicyStyledContents {
}

export interface ComponentsPrivacyPolicyVariables {
}

export interface ComponentsReleasedUnderMIT {
    args:             ComponentsReleasedUnderMITArgs;
    contentVariables: ComponentsReleasedUnderMITContentVariables;
    interpolations:   ComponentsReleasedUnderMITInterpolations;
    links:            ComponentsReleasedUnderMITLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     ComponentsReleasedUnderMITStyleClasses;
    styledContents:   ComponentsReleasedUnderMITStyledContents;
    variables:        ComponentsReleasedUnderMITVariables;
}

export interface ComponentsReleasedUnderMITArgs {
}

export interface ComponentsReleasedUnderMITContentVariables {
}

export interface ComponentsReleasedUnderMITInterpolations {
}

export interface ComponentsReleasedUnderMITLinks {
}

export interface ComponentsReleasedUnderMITStyleClasses {
}

export interface ComponentsReleasedUnderMITStyledContents {
}

export interface ComponentsReleasedUnderMITVariables {
}

export interface ComponentsTermsOfService {
    args:             ComponentsTermsOfServiceArgs;
    contentVariables: ComponentsTermsOfServiceContentVariables;
    interpolations:   ComponentsTermsOfServiceInterpolations;
    links:            ComponentsTermsOfServiceLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     ComponentsTermsOfServiceStyleClasses;
    styledContents:   ComponentsTermsOfServiceStyledContents;
    variables:        ComponentsTermsOfServiceVariables;
}

export interface ComponentsTermsOfServiceArgs {
}

export interface ComponentsTermsOfServiceContentVariables {
}

export interface ComponentsTermsOfServiceInterpolations {
}

export interface ComponentsTermsOfServiceLinks {
}

export interface ComponentsTermsOfServiceStyleClasses {
}

export interface ComponentsTermsOfServiceStyledContents {
}

export interface ComponentsTermsOfServiceVariables {
}

export interface DocTitlesDocsPageTitle {
    args:             DocTitlesDocsPageTitleArgs;
    contentVariables: DocTitlesDocsPageTitleContentVariables;
    interpolations:   DocTitlesDocsPageTitleInterpolations;
    links:            DocTitlesDocsPageTitleLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     DocTitlesDocsPageTitleStyleClasses;
    styledContents:   DocTitlesDocsPageTitleStyledContents;
    variables:        DocTitlesDocsPageTitleVariables;
}

export interface DocTitlesDocsPageTitleArgs {
}

export interface DocTitlesDocsPageTitleContentVariables {
}

export interface DocTitlesDocsPageTitleInterpolations {
}

export interface DocTitlesDocsPageTitleLinks {
}

export interface DocTitlesDocsPageTitleStyleClasses {
}

export interface DocTitlesDocsPageTitleStyledContents {
}

export interface DocTitlesDocsPageTitleVariables {
}

export interface DocTitlesOrgPortalDocsPageTitle {
    args:             DocTitlesOrgPortalDocsPageTitleArgs;
    contentVariables: DocTitlesOrgPortalDocsPageTitleContentVariables;
    interpolations:   DocTitlesOrgPortalDocsPageTitleInterpolations;
    links:            DocTitlesOrgPortalDocsPageTitleLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     DocTitlesOrgPortalDocsPageTitleStyleClasses;
    styledContents:   DocTitlesOrgPortalDocsPageTitleStyledContents;
    variables:        DocTitlesOrgPortalDocsPageTitleVariables;
}

export interface DocTitlesOrgPortalDocsPageTitleArgs {
}

export interface DocTitlesOrgPortalDocsPageTitleContentVariables {
}

export interface DocTitlesOrgPortalDocsPageTitleInterpolations {
}

export interface DocTitlesOrgPortalDocsPageTitleLinks {
}

export interface DocTitlesOrgPortalDocsPageTitleStyleClasses {
}

export interface DocTitlesOrgPortalDocsPageTitleStyledContents {
}

export interface DocTitlesOrgPortalDocsPageTitleVariables {
}

export interface DocTitlesProductAndTerminologyDocsPageTitle {
    args:             DocTitlesProductAndTerminologyDocsPageTitleArgs;
    contentVariables: DocTitlesProductAndTerminologyDocsPageTitleContentVariables;
    interpolations:   DocTitlesProductAndTerminologyDocsPageTitleInterpolations;
    links:            DocTitlesProductAndTerminologyDocsPageTitleLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     DocTitlesProductAndTerminologyDocsPageTitleStyleClasses;
    styledContents:   DocTitlesProductAndTerminologyDocsPageTitleStyledContents;
    variables:        DocTitlesProductAndTerminologyDocsPageTitleVariables;
}

export interface DocTitlesProductAndTerminologyDocsPageTitleArgs {
}

export interface DocTitlesProductAndTerminologyDocsPageTitleContentVariables {
}

export interface DocTitlesProductAndTerminologyDocsPageTitleInterpolations {
}

export interface DocTitlesProductAndTerminologyDocsPageTitleLinks {
}

export interface DocTitlesProductAndTerminologyDocsPageTitleStyleClasses {
}

export interface DocTitlesProductAndTerminologyDocsPageTitleStyledContents {
}

export interface DocTitlesProductAndTerminologyDocsPageTitleVariables {
}

export interface DocTitlesProductDocsPageTitle {
    args:             DocTitlesProductDocsPageTitleArgs;
    contentVariables: DocTitlesProductDocsPageTitleContentVariables;
    interpolations:   DocTitlesProductDocsPageTitleInterpolations;
    links:            DocTitlesProductDocsPageTitleLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     DocTitlesProductDocsPageTitleStyleClasses;
    styledContents:   DocTitlesProductDocsPageTitleStyledContents;
    variables:        DocTitlesProductDocsPageTitleVariables;
}

export interface DocTitlesProductDocsPageTitleArgs {
}

export interface DocTitlesProductDocsPageTitleContentVariables {
}

export interface DocTitlesProductDocsPageTitleInterpolations {
}

export interface DocTitlesProductDocsPageTitleLinks {
}

export interface DocTitlesProductDocsPageTitleStyleClasses {
}

export interface DocTitlesProductDocsPageTitleStyledContents {
}

export interface DocTitlesProductDocsPageTitleVariables {
}

export interface DocTitlesUserPortalDocsPageTitle {
    args:             DocTitlesUserPortalDocsPageTitleArgs;
    contentVariables: DocTitlesUserPortalDocsPageTitleContentVariables;
    interpolations:   DocTitlesUserPortalDocsPageTitleInterpolations;
    links:            DocTitlesUserPortalDocsPageTitleLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     DocTitlesUserPortalDocsPageTitleStyleClasses;
    styledContents:   DocTitlesUserPortalDocsPageTitleStyledContents;
    variables:        DocTitlesUserPortalDocsPageTitleVariables;
}

export interface DocTitlesUserPortalDocsPageTitleArgs {
}

export interface DocTitlesUserPortalDocsPageTitleContentVariables {
}

export interface DocTitlesUserPortalDocsPageTitleInterpolations {
}

export interface DocTitlesUserPortalDocsPageTitleLinks {
}

export interface DocTitlesUserPortalDocsPageTitleStyleClasses {
}

export interface DocTitlesUserPortalDocsPageTitleStyledContents {
}

export interface DocTitlesUserPortalDocsPageTitleVariables {
}

export interface DocsDocsGeneral {
    args:             DocsDocsGeneralArgs;
    contentVariables: DocsDocsGeneralContentVariables;
    interpolations:   DocsDocsGeneralInterpolations;
    links:            DocsDocsGeneralLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     DocsDocsGeneralStyleClasses;
    styledContents:   DocsDocsGeneralStyledContents;
    variables:        DocsDocsGeneralVariables;
}

export interface DocsDocsGeneralArgs {
    mainTitle:        string;
    productDocsIndex: string;
    sectionTitle:     string;
}

export interface DocsDocsGeneralContentVariables {
    productDocsIndex: string;
}

export interface DocsDocsGeneralInterpolations {
}

export interface DocsDocsGeneralLinks {
    discord:              Link;
    "floro mono repo":    Link;
    "technical overview": Link;
}

export interface DocsDocsGeneralStyleClasses {
    mainTitle:    string;
    sectionTitle: string;
}

export interface DocsDocsGeneralStyledContents {
    "developer documentation": StyledContent;
    "main title":              StyledContent;
    "plugin documentation":    StyledContent;
    "product documentation":   StyledContent;
}

export interface StyledContent {
    displayValue: TextNode[];
    name:         string;
    styleClass:   string;
}

export interface DocsDocsGeneralVariables {
}

export interface DocsIconsPluginDescription {
    args:             DocsIconsPluginDescriptionArgs;
    contentVariables: DocsIconsPluginDescriptionContentVariables;
    interpolations:   DocsIconsPluginDescriptionInterpolations;
    links:            DocsIconsPluginDescriptionLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     DocsIconsPluginDescriptionStyleClasses;
    styledContents:   DocsIconsPluginDescriptionStyledContents;
    variables:        DocsIconsPluginDescriptionVariables;
}

export interface DocsIconsPluginDescriptionArgs {
}

export interface DocsIconsPluginDescriptionContentVariables {
}

export interface DocsIconsPluginDescriptionInterpolations {
}

export interface DocsIconsPluginDescriptionLinks {
}

export interface DocsIconsPluginDescriptionStyleClasses {
}

export interface DocsIconsPluginDescriptionStyledContents {
}

export interface DocsIconsPluginDescriptionVariables {
}

export interface DocsPalettePluginDescription {
    args:             DocsPalettePluginDescriptionArgs;
    contentVariables: DocsPalettePluginDescriptionContentVariables;
    interpolations:   DocsPalettePluginDescriptionInterpolations;
    links:            DocsPalettePluginDescriptionLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     DocsPalettePluginDescriptionStyleClasses;
    styledContents:   DocsPalettePluginDescriptionStyledContents;
    variables:        DocsPalettePluginDescriptionVariables;
}

export interface DocsPalettePluginDescriptionArgs {
}

export interface DocsPalettePluginDescriptionContentVariables {
}

export interface DocsPalettePluginDescriptionInterpolations {
}

export interface DocsPalettePluginDescriptionLinks {
}

export interface DocsPalettePluginDescriptionStyleClasses {
}

export interface DocsPalettePluginDescriptionStyledContents {
}

export interface DocsPalettePluginDescriptionVariables {
}

export interface DocsSearchDeveloperDocs {
    args:             DocsSearchDeveloperDocsArgs;
    contentVariables: DocsSearchDeveloperDocsContentVariables;
    interpolations:   DocsSearchDeveloperDocsInterpolations;
    links:            DocsSearchDeveloperDocsLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     DocsSearchDeveloperDocsStyleClasses;
    styledContents:   DocsSearchDeveloperDocsStyledContents;
    variables:        DocsSearchDeveloperDocsVariables;
}

export interface DocsSearchDeveloperDocsArgs {
}

export interface DocsSearchDeveloperDocsContentVariables {
}

export interface DocsSearchDeveloperDocsInterpolations {
}

export interface DocsSearchDeveloperDocsLinks {
}

export interface DocsSearchDeveloperDocsStyleClasses {
}

export interface DocsSearchDeveloperDocsStyledContents {
}

export interface DocsSearchDeveloperDocsVariables {
}

export interface DocsSearchProductDocs {
    args:             DocsSearchProductDocsArgs;
    contentVariables: DocsSearchProductDocsContentVariables;
    interpolations:   DocsSearchProductDocsInterpolations;
    links:            DocsSearchProductDocsLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     DocsSearchProductDocsStyleClasses;
    styledContents:   DocsSearchProductDocsStyledContents;
    variables:        DocsSearchProductDocsVariables;
}

export interface DocsSearchProductDocsArgs {
}

export interface DocsSearchProductDocsContentVariables {
}

export interface DocsSearchProductDocsInterpolations {
}

export interface DocsSearchProductDocsLinks {
}

export interface DocsSearchProductDocsStyleClasses {
}

export interface DocsSearchProductDocsStyledContents {
}

export interface DocsSearchProductDocsVariables {
}

export interface DocsSearchProductDocsPage {
    args:             DocsSearchProductDocsPageArgs;
    contentVariables: DocsSearchProductDocsPageContentVariables;
    interpolations:   DocsSearchProductDocsPageInterpolations;
    links:            DocsSearchProductDocsPageLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     DocsSearchProductDocsPageStyleClasses;
    styledContents:   DocsSearchProductDocsPageStyledContents;
    variables:        DocsSearchProductDocsPageVariables;
}

export interface DocsSearchProductDocsPageArgs {
}

export interface DocsSearchProductDocsPageContentVariables {
}

export interface DocsSearchProductDocsPageInterpolations {
}

export interface DocsSearchProductDocsPageLinks {
}

export interface DocsSearchProductDocsPageStyleClasses {
}

export interface DocsSearchProductDocsPageStyledContents {
}

export interface DocsSearchProductDocsPageVariables {
}

export interface DocsTextPluginDescription {
    args:             DocsTextPluginDescriptionArgs;
    contentVariables: DocsTextPluginDescriptionContentVariables;
    interpolations:   DocsTextPluginDescriptionInterpolations;
    links:            DocsTextPluginDescriptionLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     DocsTextPluginDescriptionStyleClasses;
    styledContents:   DocsTextPluginDescriptionStyledContents;
    variables:        DocsTextPluginDescriptionVariables;
}

export interface DocsTextPluginDescriptionArgs {
}

export interface DocsTextPluginDescriptionContentVariables {
}

export interface DocsTextPluginDescriptionInterpolations {
}

export interface DocsTextPluginDescriptionLinks {
}

export interface DocsTextPluginDescriptionStyleClasses {
}

export interface DocsTextPluginDescriptionStyledContents {
}

export interface DocsTextPluginDescriptionVariables {
}

export interface DocsThemePluginDescription {
    args:             DocsThemePluginDescriptionArgs;
    contentVariables: DocsThemePluginDescriptionContentVariables;
    interpolations:   DocsThemePluginDescriptionInterpolations;
    links:            DocsThemePluginDescriptionLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     DocsThemePluginDescriptionStyleClasses;
    styledContents:   DocsThemePluginDescriptionStyledContents;
    variables:        DocsThemePluginDescriptionVariables;
}

export interface DocsThemePluginDescriptionArgs {
}

export interface DocsThemePluginDescriptionContentVariables {
}

export interface DocsThemePluginDescriptionInterpolations {
}

export interface DocsThemePluginDescriptionLinks {
}

export interface DocsThemePluginDescriptionStyleClasses {
}

export interface DocsThemePluginDescriptionStyledContents {
}

export interface DocsThemePluginDescriptionVariables {
}

export interface FrontPageAppearance {
    args:             FrontPageAppearanceArgs;
    contentVariables: FrontPageAppearanceContentVariables;
    interpolations:   FrontPageAppearanceInterpolations;
    links:            FrontPageAppearanceLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     FrontPageAppearanceStyleClasses;
    styledContents:   FrontPageAppearanceStyledContents;
    variables:        FrontPageAppearanceVariables;
}

export interface FrontPageAppearanceArgs {
}

export interface FrontPageAppearanceContentVariables {
}

export interface FrontPageAppearanceInterpolations {
}

export interface FrontPageAppearanceLinks {
}

export interface FrontPageAppearanceStyleClasses {
}

export interface FrontPageAppearanceStyledContents {
}

export interface FrontPageAppearanceVariables {
}

export interface FrontPageDownloadDesktopClient {
    args:             FrontPageDownloadDesktopClientArgs;
    contentVariables: FrontPageDownloadDesktopClientContentVariables;
    interpolations:   FrontPageDownloadDesktopClientInterpolations;
    links:            FrontPageDownloadDesktopClientLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     FrontPageDownloadDesktopClientStyleClasses;
    styledContents:   FrontPageDownloadDesktopClientStyledContents;
    variables:        FrontPageDownloadDesktopClientVariables;
}

export interface FrontPageDownloadDesktopClientArgs {
}

export interface FrontPageDownloadDesktopClientContentVariables {
}

export interface FrontPageDownloadDesktopClientInterpolations {
}

export interface FrontPageDownloadDesktopClientLinks {
}

export interface FrontPageDownloadDesktopClientStyleClasses {
}

export interface FrontPageDownloadDesktopClientStyledContents {
}

export interface FrontPageDownloadDesktopClientVariables {
}

export interface FrontPageGetHelpAndContribute {
    args:             FrontPageGetHelpAndContributeArgs;
    contentVariables: FrontPageGetHelpAndContributeContentVariables;
    interpolations:   FrontPageGetHelpAndContributeInterpolations;
    links:            FrontPageGetHelpAndContributeLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     FrontPageGetHelpAndContributeStyleClasses;
    styledContents:   FrontPageGetHelpAndContributeStyledContents;
    variables:        FrontPageGetHelpAndContributeVariables;
}

export interface FrontPageGetHelpAndContributeArgs {
}

export interface FrontPageGetHelpAndContributeContentVariables {
}

export interface FrontPageGetHelpAndContributeInterpolations {
}

export interface FrontPageGetHelpAndContributeLinks {
}

export interface FrontPageGetHelpAndContributeStyleClasses {
}

export interface FrontPageGetHelpAndContributeStyledContents {
}

export interface FrontPageGetHelpAndContributeVariables {
}

export interface FrontPageInstallTheCLI {
    args:             FrontPageInstallTheCLIArgs;
    contentVariables: FrontPageInstallTheCLIContentVariables;
    interpolations:   FrontPageInstallTheCLIInterpolations;
    links:            FrontPageInstallTheCLILinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     FrontPageInstallTheCLIStyleClasses;
    styledContents:   FrontPageInstallTheCLIStyledContents;
    variables:        FrontPageInstallTheCLIVariables;
}

export interface FrontPageInstallTheCLIArgs {
}

export interface FrontPageInstallTheCLIContentVariables {
}

export interface FrontPageInstallTheCLIInterpolations {
}

export interface FrontPageInstallTheCLILinks {
}

export interface FrontPageInstallTheCLIStyleClasses {
}

export interface FrontPageInstallTheCLIStyledContents {
}

export interface FrontPageInstallTheCLIVariables {
}

export interface FrontPageNavAbout {
    args:             FrontPageNavAboutArgs;
    contentVariables: FrontPageNavAboutContentVariables;
    interpolations:   FrontPageNavAboutInterpolations;
    links:            FrontPageNavAboutLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     FrontPageNavAboutStyleClasses;
    styledContents:   FrontPageNavAboutStyledContents;
    variables:        FrontPageNavAboutVariables;
}

export interface FrontPageNavAboutArgs {
}

export interface FrontPageNavAboutContentVariables {
}

export interface FrontPageNavAboutInterpolations {
}

export interface FrontPageNavAboutLinks {
}

export interface FrontPageNavAboutStyleClasses {
}

export interface FrontPageNavAboutStyledContents {
}

export interface FrontPageNavAboutVariables {
}

export interface FrontPageNavConsulting {
    args:             FrontPageNavConsultingArgs;
    contentVariables: FrontPageNavConsultingContentVariables;
    interpolations:   FrontPageNavConsultingInterpolations;
    links:            FrontPageNavConsultingLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     FrontPageNavConsultingStyleClasses;
    styledContents:   FrontPageNavConsultingStyledContents;
    variables:        FrontPageNavConsultingVariables;
}

export interface FrontPageNavConsultingArgs {
}

export interface FrontPageNavConsultingContentVariables {
}

export interface FrontPageNavConsultingInterpolations {
}

export interface FrontPageNavConsultingLinks {
}

export interface FrontPageNavConsultingStyleClasses {
}

export interface FrontPageNavConsultingStyledContents {
}

export interface FrontPageNavConsultingVariables {
}

export interface FrontPageNavDocs {
    args:             FrontPageNavDocsArgs;
    contentVariables: FrontPageNavDocsContentVariables;
    interpolations:   FrontPageNavDocsInterpolations;
    links:            FrontPageNavDocsLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     FrontPageNavDocsStyleClasses;
    styledContents:   FrontPageNavDocsStyledContents;
    variables:        FrontPageNavDocsVariables;
}

export interface FrontPageNavDocsArgs {
}

export interface FrontPageNavDocsContentVariables {
}

export interface FrontPageNavDocsInterpolations {
}

export interface FrontPageNavDocsLinks {
}

export interface FrontPageNavDocsStyleClasses {
}

export interface FrontPageNavDocsStyledContents {
}

export interface FrontPageNavDocsVariables {
}

export interface FrontPageNavDownload {
    args:             FrontPageNavDownloadArgs;
    contentVariables: FrontPageNavDownloadContentVariables;
    interpolations:   FrontPageNavDownloadInterpolations;
    links:            FrontPageNavDownloadLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     FrontPageNavDownloadStyleClasses;
    styledContents:   FrontPageNavDownloadStyledContents;
    variables:        FrontPageNavDownloadVariables;
}

export interface FrontPageNavDownloadArgs {
}

export interface FrontPageNavDownloadContentVariables {
}

export interface FrontPageNavDownloadInterpolations {
}

export interface FrontPageNavDownloadLinks {
}

export interface FrontPageNavDownloadStyleClasses {
}

export interface FrontPageNavDownloadStyledContents {
}

export interface FrontPageNavDownloadVariables {
}

export interface FrontPageNavFOSS {
    args:             FrontPageNavFOSSArgs;
    contentVariables: FrontPageNavFOSSContentVariables;
    interpolations:   FrontPageNavFOSSInterpolations;
    links:            FrontPageNavFOSSLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     FrontPageNavFOSSStyleClasses;
    styledContents:   FrontPageNavFOSSStyledContents;
    variables:        FrontPageNavFOSSVariables;
}

export interface FrontPageNavFOSSArgs {
}

export interface FrontPageNavFOSSContentVariables {
}

export interface FrontPageNavFOSSInterpolations {
}

export interface FrontPageNavFOSSLinks {
}

export interface FrontPageNavFOSSStyleClasses {
}

export interface FrontPageNavFOSSStyledContents {
}

export interface FrontPageNavFOSSVariables {
}

export interface FrontPageNavPricing {
    args:             FrontPageNavPricingArgs;
    contentVariables: FrontPageNavPricingContentVariables;
    interpolations:   FrontPageNavPricingInterpolations;
    links:            FrontPageNavPricingLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     FrontPageNavPricingStyleClasses;
    styledContents:   FrontPageNavPricingStyledContents;
    variables:        FrontPageNavPricingVariables;
}

export interface FrontPageNavPricingArgs {
}

export interface FrontPageNavPricingContentVariables {
}

export interface FrontPageNavPricingInterpolations {
}

export interface FrontPageNavPricingLinks {
}

export interface FrontPageNavPricingStyleClasses {
}

export interface FrontPageNavPricingStyledContents {
}

export interface FrontPageNavPricingVariables {
}

export interface FrontPageReadTechnicalOverview {
    args:             FrontPageReadTechnicalOverviewArgs;
    contentVariables: FrontPageReadTechnicalOverviewContentVariables;
    interpolations:   FrontPageReadTechnicalOverviewInterpolations;
    links:            FrontPageReadTechnicalOverviewLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     FrontPageReadTechnicalOverviewStyleClasses;
    styledContents:   FrontPageReadTechnicalOverviewStyledContents;
    variables:        FrontPageReadTechnicalOverviewVariables;
}

export interface FrontPageReadTechnicalOverviewArgs {
}

export interface FrontPageReadTechnicalOverviewContentVariables {
}

export interface FrontPageReadTechnicalOverviewInterpolations {
}

export interface FrontPageReadTechnicalOverviewLinks {
}

export interface FrontPageReadTechnicalOverviewStyleClasses {
}

export interface FrontPageReadTechnicalOverviewStyledContents {
}

export interface FrontPageReadTechnicalOverviewVariables {
}

export interface FrontPageSeeADemo {
    args:             FrontPageSeeADemoArgs;
    contentVariables: FrontPageSeeADemoContentVariables;
    interpolations:   FrontPageSeeADemoInterpolations;
    links:            FrontPageSeeADemoLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     FrontPageSeeADemoStyleClasses;
    styledContents:   FrontPageSeeADemoStyledContents;
    variables:        FrontPageSeeADemoVariables;
}

export interface FrontPageSeeADemoArgs {
}

export interface FrontPageSeeADemoContentVariables {
}

export interface FrontPageSeeADemoInterpolations {
}

export interface FrontPageSeeADemoLinks {
}

export interface FrontPageSeeADemoStyleClasses {
}

export interface FrontPageSeeADemoStyledContents {
}

export interface FrontPageSeeADemoVariables {
}

export interface FrontPageSubtextOfTagLine {
    args:             FrontPageSubtextOfTagLineArgs;
    contentVariables: FrontPageSubtextOfTagLineContentVariables;
    interpolations:   FrontPageSubtextOfTagLineInterpolations;
    links:            FrontPageSubtextOfTagLineLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     FrontPageSubtextOfTagLineStyleClasses;
    styledContents:   FrontPageSubtextOfTagLineStyledContents;
    variables:        FrontPageSubtextOfTagLineVariables;
}

export interface FrontPageSubtextOfTagLineArgs {
}

export interface FrontPageSubtextOfTagLineContentVariables {
}

export interface FrontPageSubtextOfTagLineInterpolations {
}

export interface FrontPageSubtextOfTagLineLinks {
}

export interface FrontPageSubtextOfTagLineStyleClasses {
}

export interface FrontPageSubtextOfTagLineStyledContents {
}

export interface FrontPageSubtextOfTagLineVariables {
}

export interface FrontPageTagLine {
    args:             FrontPageTagLineArgs;
    contentVariables: FrontPageTagLineContentVariables;
    interpolations:   FrontPageTagLineInterpolations;
    links:            FrontPageTagLineLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     FrontPageTagLineStyleClasses;
    styledContents:   FrontPageTagLineStyledContents;
    variables:        FrontPageTagLineVariables;
}

export interface FrontPageTagLineArgs {
}

export interface FrontPageTagLineContentVariables {
}

export interface FrontPageTagLineInterpolations {
}

export interface FrontPageTagLineLinks {
}

export interface FrontPageTagLineStyleClasses {
}

export interface FrontPageTagLineStyledContents {
}

export interface FrontPageTagLineVariables {
}

export interface HowItWorksHowItWorksBlog {
    args:             HowItWorksHowItWorksBlogArgs;
    contentVariables: HowItWorksHowItWorksBlogContentVariables;
    interpolations:   HowItWorksHowItWorksBlogInterpolations;
    links:            HowItWorksHowItWorksBlogLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     HowItWorksHowItWorksBlogStyleClasses;
    styledContents:   HowItWorksHowItWorksBlogStyledContents;
    variables:        HowItWorksHowItWorksBlogVariables;
}

export interface HowItWorksHowItWorksBlogArgs {
    boundedCascading:            string;
    dependentTypesSchematic:     string;
    keyPathImage:                string;
    kvAnimation:                 string;
    kvStateTreeStateStaticImage: string;
    mainTitle:                   string;
    relationsSchema:             string;
    relationsSpreadsheet:        string;
    sectionTitle:                string;
    setUpdateImages:             string;
    titleContentImage:           string;
    versionUpdateImages:         string;
}

export interface HowItWorksHowItWorksBlogContentVariables {
    boundedCascading:            string;
    dependentTypesSchematic:     string;
    keyPathImage:                string;
    kvAnimation:                 string;
    kvStateTreeStateStaticImage: string;
    relationsSchema:             string;
    relationsSpreadsheet:        string;
    setUpdateImages:             string;
    titleContentImage:           string;
    versionUpdateImages:         string;
}

export interface HowItWorksHowItWorksBlogInterpolations {
}

export interface HowItWorksHowItWorksBlogLinks {
    "dependent types":              Link;
    "how diffing & merging work":   Link;
    "how diffing and merging work": Link;
    "Longest Common Subsequence":   Link;
    redux:                          Link;
    "skip to part 2":               Link;
    "unit test":                    Link;
    "YouTube Link":                 Link;
}

export interface HowItWorksHowItWorksBlogStyleClasses {
    mainTitle:    string;
    sectionTitle: string;
}

export interface HowItWorksHowItWorksBlogStyledContents {
    "blog title":               StyledContent;
    "its all related":          StyledContent;
    "whats the difference":     StyledContent;
    "when things change title": StyledContent;
}

export interface HowItWorksHowItWorksBlogVariables {
}

export interface HowItWorksHowItWorksBlogPart2 {
    args:             HowItWorksHowItWorksBlogPart2_Args;
    contentVariables: HowItWorksHowItWorksBlogPart2_ContentVariables;
    interpolations:   HowItWorksHowItWorksBlogPart2_Interpolations;
    links:            HowItWorksHowItWorksBlogPart2_Links;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     HowItWorksHowItWorksBlogPart2_StyleClasses;
    styledContents:   HowItWorksHowItWorksBlogPart2_StyledContents;
    variables:        HowItWorksHowItWorksBlogPart2_Variables;
}

export interface HowItWorksHowItWorksBlogPart2_Args {
    autoMerge:                    string;
    cascadedMerging:              string;
    conflictMerge:                string;
    diamondColor:                 string;
    diffCalculator:               string;
    diffImageBlackAndWhite:       string;
    diffKeys:                     string;
    lcsCalculator:                string;
    leftReconciledAutoMerge:      string;
    leftReconciledConflictMerge:  string;
    mainTitle:                    string;
    mergeCalculator:              string;
    orderMatters:                 string;
    rgbList:                      string;
    rightReconciledAutoMerge:     string;
    rightReconciledConflictMerge: string;
    sectionTitle:                 string;
    spreadsheetKeys:              string;
    threeWayAutoMerge:            string;
    threeWayConflictMerge:        string;
    visualDiff:                   string;
}

export interface HowItWorksHowItWorksBlogPart2_ContentVariables {
    autoMerge:                    string;
    cascadedMerging:              string;
    conflictMerge:                string;
    diamondColor:                 string;
    diffCalculator:               string;
    diffImageBlackAndWhite:       string;
    diffKeys:                     string;
    lcsCalculator:                string;
    leftReconciledAutoMerge:      string;
    leftReconciledConflictMerge:  string;
    mergeCalculator:              string;
    orderMatters:                 string;
    rgbList:                      string;
    rightReconciledAutoMerge:     string;
    rightReconciledConflictMerge: string;
    spreadsheetKeys:              string;
    threeWayAutoMerge:            string;
    threeWayConflictMerge:        string;
    visualDiff:                   string;
}

export interface HowItWorksHowItWorksBlogPart2_Interpolations {
}

export interface HowItWorksHowItWorksBlogPart2_Links {
    "back to part 1":             Link;
    "CQRS & Event Sourcing Link": Link;
    "CRDT Link":                  Link;
    "discord link":               Link;
    "Git Merge Link":             Link;
    "Longest Common Subsequence": Link;
    "Three Way Merge Link":       Link;
    "YouTube Link":               Link;
}

export interface HowItWorksHowItWorksBlogPart2_StyleClasses {
    mainTitle:    string;
    sectionTitle: string;
}

export interface HowItWorksHowItWorksBlogPart2_StyledContents {
    "bringing it all together title": StyledContent;
    "how it works part 2":            StyledContent;
    "local first":                    StyledContent;
    "merge granularity":              StyledContent;
    "order matters":                  StyledContent;
    "why not git":                    StyledContent;
}

export interface HowItWorksHowItWorksBlogPart2_Variables {
}

export interface MainHelloWorld {
    args:             MainHelloWorldArgs;
    contentVariables: MainHelloWorldContentVariables;
    interpolations:   MainHelloWorldInterpolations;
    links:            MainHelloWorldLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     MainHelloWorldStyleClasses;
    styledContents:   MainHelloWorldStyledContents;
    variables:        MainHelloWorldVariables;
}

export interface MainHelloWorldArgs {
}

export interface MainHelloWorldContentVariables {
}

export interface MainHelloWorldInterpolations {
}

export interface MainHelloWorldLinks {
}

export interface MainHelloWorldStyleClasses {
}

export interface MainHelloWorldStyledContents {
}

export interface MainHelloWorldVariables {
}

export interface MetaTagsAbout {
    args:             MetaTagsAboutArgs;
    contentVariables: MetaTagsAboutContentVariables;
    interpolations:   MetaTagsAboutInterpolations;
    links:            MetaTagsAboutLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     MetaTagsAboutStyleClasses;
    styledContents:   MetaTagsAboutStyledContents;
    variables:        MetaTagsAboutVariables;
}

export interface MetaTagsAboutArgs {
}

export interface MetaTagsAboutContentVariables {
}

export interface MetaTagsAboutInterpolations {
}

export interface MetaTagsAboutLinks {
}

export interface MetaTagsAboutStyleClasses {
}

export interface MetaTagsAboutStyledContents {
}

export interface MetaTagsAboutVariables {
}

export interface MetaTagsDocs {
    args:             MetaTagsDocsArgs;
    contentVariables: MetaTagsDocsContentVariables;
    interpolations:   MetaTagsDocsInterpolations;
    links:            MetaTagsDocsLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     MetaTagsDocsStyleClasses;
    styledContents:   MetaTagsDocsStyledContents;
    variables:        MetaTagsDocsVariables;
}

export interface MetaTagsDocsArgs {
}

export interface MetaTagsDocsContentVariables {
}

export interface MetaTagsDocsInterpolations {
}

export interface MetaTagsDocsLinks {
}

export interface MetaTagsDocsStyleClasses {
}

export interface MetaTagsDocsStyledContents {
}

export interface MetaTagsDocsVariables {
}

export interface MetaTagsHowItWorks {
    args:             MetaTagsHowItWorksArgs;
    contentVariables: MetaTagsHowItWorksContentVariables;
    interpolations:   MetaTagsHowItWorksInterpolations;
    links:            MetaTagsHowItWorksLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     MetaTagsHowItWorksStyleClasses;
    styledContents:   MetaTagsHowItWorksStyledContents;
    variables:        MetaTagsHowItWorksVariables;
}

export interface MetaTagsHowItWorksArgs {
}

export interface MetaTagsHowItWorksContentVariables {
}

export interface MetaTagsHowItWorksInterpolations {
}

export interface MetaTagsHowItWorksLinks {
}

export interface MetaTagsHowItWorksStyleClasses {
}

export interface MetaTagsHowItWorksStyledContents {
}

export interface MetaTagsHowItWorksVariables {
}

export interface MetaTagsOrgPortalDocs {
    args:             MetaTagsOrgPortalDocsArgs;
    contentVariables: MetaTagsOrgPortalDocsContentVariables;
    interpolations:   MetaTagsOrgPortalDocsInterpolations;
    links:            MetaTagsOrgPortalDocsLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     MetaTagsOrgPortalDocsStyleClasses;
    styledContents:   MetaTagsOrgPortalDocsStyledContents;
    variables:        MetaTagsOrgPortalDocsVariables;
}

export interface MetaTagsOrgPortalDocsArgs {
}

export interface MetaTagsOrgPortalDocsContentVariables {
}

export interface MetaTagsOrgPortalDocsInterpolations {
}

export interface MetaTagsOrgPortalDocsLinks {
}

export interface MetaTagsOrgPortalDocsStyleClasses {
}

export interface MetaTagsOrgPortalDocsStyledContents {
}

export interface MetaTagsOrgPortalDocsVariables {
}

export interface MetaTagsProductDocs {
    args:             MetaTagsProductDocsArgs;
    contentVariables: MetaTagsProductDocsContentVariables;
    interpolations:   MetaTagsProductDocsInterpolations;
    links:            MetaTagsProductDocsLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     MetaTagsProductDocsStyleClasses;
    styledContents:   MetaTagsProductDocsStyledContents;
    variables:        MetaTagsProductDocsVariables;
}

export interface MetaTagsProductDocsArgs {
}

export interface MetaTagsProductDocsContentVariables {
}

export interface MetaTagsProductDocsInterpolations {
}

export interface MetaTagsProductDocsLinks {
}

export interface MetaTagsProductDocsStyleClasses {
}

export interface MetaTagsProductDocsStyledContents {
}

export interface MetaTagsProductDocsVariables {
}

export interface MetaTagsProductDocsAndTerminology {
    args:             MetaTagsProductDocsAndTerminologyArgs;
    contentVariables: MetaTagsProductDocsAndTerminologyContentVariables;
    interpolations:   MetaTagsProductDocsAndTerminologyInterpolations;
    links:            MetaTagsProductDocsAndTerminologyLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     MetaTagsProductDocsAndTerminologyStyleClasses;
    styledContents:   MetaTagsProductDocsAndTerminologyStyledContents;
    variables:        MetaTagsProductDocsAndTerminologyVariables;
}

export interface MetaTagsProductDocsAndTerminologyArgs {
}

export interface MetaTagsProductDocsAndTerminologyContentVariables {
}

export interface MetaTagsProductDocsAndTerminologyInterpolations {
}

export interface MetaTagsProductDocsAndTerminologyLinks {
}

export interface MetaTagsProductDocsAndTerminologyStyleClasses {
}

export interface MetaTagsProductDocsAndTerminologyStyledContents {
}

export interface MetaTagsProductDocsAndTerminologyVariables {
}

export interface MetaTagsUserPortalDocs {
    args:             MetaTagsUserPortalDocsArgs;
    contentVariables: MetaTagsUserPortalDocsContentVariables;
    interpolations:   MetaTagsUserPortalDocsInterpolations;
    links:            MetaTagsUserPortalDocsLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     MetaTagsUserPortalDocsStyleClasses;
    styledContents:   MetaTagsUserPortalDocsStyledContents;
    variables:        MetaTagsUserPortalDocsVariables;
}

export interface MetaTagsUserPortalDocsArgs {
}

export interface MetaTagsUserPortalDocsContentVariables {
}

export interface MetaTagsUserPortalDocsInterpolations {
}

export interface MetaTagsUserPortalDocsLinks {
}

export interface MetaTagsUserPortalDocsStyleClasses {
}

export interface MetaTagsUserPortalDocsStyledContents {
}

export interface MetaTagsUserPortalDocsVariables {
}

export interface ProductDocsOrgPortalDocs {
    args:             ProductDocsOrgPortalDocsArgs;
    contentVariables: ProductDocsOrgPortalDocsContentVariables;
    interpolations:   ProductDocsOrgPortalDocsInterpolations;
    links:            ProductDocsOrgPortalDocsLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     ProductDocsOrgPortalDocsStyleClasses;
    styledContents:   ProductDocsOrgPortalDocsStyledContents;
    variables:        ProductDocsOrgPortalDocsVariables;
}

export interface ProductDocsOrgPortalDocsArgs {
    createOrgRepo: string;
    docSearch:     string;
    mainTitle:     string;
    orgMembersImg: string;
    orgPortalImg:  string;
    rolesImg:      string;
}

export interface ProductDocsOrgPortalDocsContentVariables {
    createOrgRepo: string;
    docSearch:     string;
    orgMembersImg: string;
    orgPortalImg:  string;
    rolesImg:      string;
}

export interface ProductDocsOrgPortalDocsInterpolations {
}

export interface ProductDocsOrgPortalDocsLinks {
    "navigating local repositories": Link;
}

export interface ProductDocsOrgPortalDocsStyleClasses {
    mainTitle: string;
}

export interface ProductDocsOrgPortalDocsStyledContents {
    "main title": StyledContent;
}

export interface ProductDocsOrgPortalDocsVariables {
}

export interface ProductDocsProductAndTerminologyOverview {
    args:             ProductDocsProductAndTerminologyOverviewArgs;
    contentVariables: ProductDocsProductAndTerminologyOverviewContentVariables;
    interpolations:   ProductDocsProductAndTerminologyOverviewInterpolations;
    links:            ProductDocsProductAndTerminologyOverviewLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     ProductDocsProductAndTerminologyOverviewStyleClasses;
    styledContents:   ProductDocsProductAndTerminologyOverviewStyledContents;
    variables:        ProductDocsProductAndTerminologyOverviewVariables;
}

export interface ProductDocsProductAndTerminologyOverviewArgs {
    createMRPromptImg:     string;
    defaultBranchImg:      string;
    diffCommitImg:         string;
    docSearch:             string;
    mainTitle:             string;
    mergeRequestImg:       string;
    pullingImg:            string;
    reviewCommentImg:      string;
    whatArePluginsTextImg: string;
    whatIsABranchImg:      string;
    whatIsACommitImg:      string;
    whatIsFloroImg:        string;
    whatIsPushing:         string;
}

export interface ProductDocsProductAndTerminologyOverviewContentVariables {
    createMRPromptImg:     string;
    defaultBranchImg:      string;
    diffCommitImg:         string;
    docSearch:             string;
    mergeRequestImg:       string;
    pullingImg:            string;
    reviewCommentImg:      string;
    whatArePluginsTextImg: string;
    whatIsABranchImg:      string;
    whatIsACommitImg:      string;
    whatIsFloroImg:        string;
    whatIsPushing:         string;
}

export interface ProductDocsProductAndTerminologyOverviewInterpolations {
}

export interface ProductDocsProductAndTerminologyOverviewLinks {
    "navigating the user portal": Link;
}

export interface ProductDocsProductAndTerminologyOverviewStyleClasses {
    mainTitle: string;
}

export interface ProductDocsProductAndTerminologyOverviewStyledContents {
    "main title": StyledContent;
}

export interface ProductDocsProductAndTerminologyOverviewVariables {
}

export interface ProductDocsProductDocsGeneral {
    args:             ProductDocsProductDocsGeneralArgs;
    contentVariables: ProductDocsProductDocsGeneralContentVariables;
    interpolations:   ProductDocsProductDocsGeneralInterpolations;
    links:            ProductDocsProductDocsGeneralLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     ProductDocsProductDocsGeneralStyleClasses;
    styledContents:   ProductDocsProductDocsGeneralStyledContents;
    variables:        ProductDocsProductDocsGeneralVariables;
}

export interface ProductDocsProductDocsGeneralArgs {
    docSearch:        string;
    mainTitle:        string;
    productDocsIndex: string;
}

export interface ProductDocsProductDocsGeneralContentVariables {
    docSearch:        string;
    productDocsIndex: string;
}

export interface ProductDocsProductDocsGeneralInterpolations {
}

export interface ProductDocsProductDocsGeneralLinks {
    "Navigating the user portal": Link;
}

export interface ProductDocsProductDocsGeneralStyleClasses {
    mainTitle: string;
}

export interface ProductDocsProductDocsGeneralStyledContents {
    "main title": StyledContent;
}

export interface ProductDocsProductDocsGeneralVariables {
}

export interface ProductDocsProductDocsIndex {
    args:             ProductDocsProductDocsIndexArgs;
    contentVariables: ProductDocsProductDocsIndexContentVariables;
    interpolations:   ProductDocsProductDocsIndexInterpolations;
    links:            ProductDocsProductDocsIndexLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     ProductDocsProductDocsIndexStyleClasses;
    styledContents:   ProductDocsProductDocsIndexStyledContents;
    variables:        ProductDocsProductDocsIndexVariables;
}

export interface ProductDocsProductDocsIndexArgs {
}

export interface ProductDocsProductDocsIndexContentVariables {
}

export interface ProductDocsProductDocsIndexInterpolations {
}

export interface ProductDocsProductDocsIndexLinks {
    "learn how local repositories work": Link;
    "navigating the org portal":         Link;
    "navigating the user portal":        Link;
    "product and terminology overview":  Link;
}

export interface ProductDocsProductDocsIndexStyleClasses {
}

export interface ProductDocsProductDocsIndexStyledContents {
}

export interface ProductDocsProductDocsIndexVariables {
}

export interface ProductDocsUserPortalDocs {
    args:             ProductDocsUserPortalDocsArgs;
    contentVariables: ProductDocsUserPortalDocsContentVariables;
    interpolations:   ProductDocsUserPortalDocsInterpolations;
    links:            ProductDocsUserPortalDocsLinks;
    phrase:           TextNode[];
    phraseKey:        string;
    styleClasses:     ProductDocsUserPortalDocsStyleClasses;
    styledContents:   ProductDocsUserPortalDocsStyledContents;
    variables:        ProductDocsUserPortalDocsVariables;
}

export interface ProductDocsUserPortalDocsArgs {
    createOrg:               string;
    createRepo:              string;
    developerSettingsImg:    string;
    docSearch:               string;
    leftPanelImg:            string;
    mainTitle:               string;
    notificationSettingsImg: string;
    privacySettingsImg:      string;
    userPortalImg:           string;
}

export interface ProductDocsUserPortalDocsContentVariables {
    createOrg:               string;
    createRepo:              string;
    developerSettingsImg:    string;
    docSearch:               string;
    leftPanelImg:            string;
    notificationSettingsImg: string;
    privacySettingsImg:      string;
    userPortalImg:           string;
}

export interface ProductDocsUserPortalDocsInterpolations {
}

export interface ProductDocsUserPortalDocsLinks {
    "navigating the organization portal": Link;
}

export interface ProductDocsUserPortalDocsStyleClasses {
    mainTitle: string;
}

export interface ProductDocsUserPortalDocsStyledContents {
    "main title": StyledContent;
}

export interface ProductDocsUserPortalDocsVariables {
}

export interface PhraseKeyDebugInfo {
    "about.bringing_it_all_together_part_1":              DebugInfo;
    "about.bringing_it_all_together_title":               DebugInfo;
    "about.how_floro_works_title":                        DebugInfo;
    "about.how_it's_all_related":                         DebugInfo;
    "about.how_it_is_all_related_blurb_1":                DebugInfo;
    "about.how_it_is_all_related_part_2":                 DebugInfo;
    "about.how_it_works_blurb":                           DebugInfo;
    "about.how_it_works_blurb_part_2":                    DebugInfo;
    "about.how_it_works_blurb_part_3":                    DebugInfo;
    "about.how_it_works_blurb_part_4":                    DebugInfo;
    "about.how_its_all_related_part_3":                   DebugInfo;
    "about.things_change_blurb_1":                        DebugInfo;
    "about.things_change_blurb_2":                        DebugInfo;
    "about.things_change_blurb_3":                        DebugInfo;
    "about.things_change_title":                          DebugInfo;
    "about.whats_the_difference_blurb_1":                 DebugInfo;
    "about.whats_the_difference_blurb_2":                 DebugInfo;
    "about.whats_the_difference_part_4":                  DebugInfo;
    "about.whats_the_difference_part_5":                  DebugInfo;
    "about.whats_the_difference_part_6":                  DebugInfo;
    "about.whats_the_difference_part_7":                  DebugInfo;
    "about.whats_the_difference_title":                   DebugInfo;
    "about.whats_the_different_part_3":                   DebugInfo;
    "components.copied":                                  DebugInfo;
    "components.copyright":                               DebugInfo;
    "components.privacy_policy":                          DebugInfo;
    "components.released_under_mit":                      DebugInfo;
    "components.terms_of_service":                        DebugInfo;
    "doc_titles.docs_page_title":                         DebugInfo;
    "doc_titles.org_portal_docs_page_title":              DebugInfo;
    "doc_titles.product_and_terminology_docs_page_title": DebugInfo;
    "doc_titles.product_docs_page_title":                 DebugInfo;
    "doc_titles.user_portal_docs_page_title":             DebugInfo;
    "docs.docs_general":                                  DebugInfo;
    "docs.icons_plugin_description":                      DebugInfo;
    "docs.palette_plugin_description":                    DebugInfo;
    "docs.search_developer_docs":                         DebugInfo;
    "docs.search_product_docs":                           DebugInfo;
    "docs.search_product_docs_page":                      DebugInfo;
    "docs.text_plugin_description":                       DebugInfo;
    "docs.theme_plugin_description":                      DebugInfo;
    "front_page.appearance":                              DebugInfo;
    "front_page.download_desktop_client":                 DebugInfo;
    "front_page.get_help_and_contribute":                 DebugInfo;
    "front_page.install_the_cli":                         DebugInfo;
    "front_page.nav_about":                               DebugInfo;
    "front_page.nav_consulting":                          DebugInfo;
    "front_page.nav_docs":                                DebugInfo;
    "front_page.nav_download":                            DebugInfo;
    "front_page.nav_foss":                                DebugInfo;
    "front_page.nav_pricing":                             DebugInfo;
    "front_page.read_technical_overview":                 DebugInfo;
    "front_page.see_a_demo":                              DebugInfo;
    "front_page.subtext_of_tag_line":                     DebugInfo;
    "front_page.tag_line":                                DebugInfo;
    "how_it_works.how_it_works_blog":                     DebugInfo;
    "how_it_works.how_it_works_blog_part_2":              DebugInfo;
    "main.hello_world":                                   DebugInfo;
    "meta_tags.about":                                    DebugInfo;
    "meta_tags.docs":                                     DebugInfo;
    "meta_tags.how_it_works":                             DebugInfo;
    "meta_tags.org_portal_docs":                          DebugInfo;
    "meta_tags.product_docs":                             DebugInfo;
    "meta_tags.product_docs_and_terminology":             DebugInfo;
    "meta_tags.user_portal_docs":                         DebugInfo;
    "product_docs.org_portal_docs":                       DebugInfo;
    "product_docs.product_and_terminology_overview":      DebugInfo;
    "product_docs.product_docs_general":                  DebugInfo;
    "product_docs.product_docs_index":                    DebugInfo;
    "product_docs.user_portal_docs":                      DebugInfo;
}

export interface DebugInfo {
    groupName: string;
    phraseKey: string;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toLocalizedPhrases(json: string): LocalizedPhrases {
        return JSON.parse(json);
    }

    public static localizedPhrasesToJson(value: LocalizedPhrases): string {
        return JSON.stringify(value);
    }
}

// START INLINE CODE

const isStatementTrue = <T>(
  value: T,
  comparisonValue: T,
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "is_fractional"
): boolean => {
  if (operator == "eq") {
    return value == comparisonValue;
  }
  if (operator == "neq") {
    return value != comparisonValue;
  }
  const numberValue: number = value as number ?? 0;
  const comparisonNumberValue: number = comparisonValue as number ?? 0;
  if (operator == "gt") {
    return numberValue > comparisonNumberValue;
  }
  if (operator == "gte") {
    return numberValue >= comparisonNumberValue;
  }
  if (operator == "lt") {
    return numberValue < comparisonNumberValue;
  }
  if (operator == "lte") {
    return numberValue <= comparisonNumberValue;
  }
  if (operator == "is_fractional" && typeof numberValue == "number") {
    return numberValue % 1 != 0;
  }
  return false;
};

export const getPhraseValue = <C, T extends keyof Locales, K extends keyof PhraseKeys>(
  localizedPhrases: LocalizedPhrases,
  localeKey: T,
  phraseKey: K,
  args: {
    [KV in keyof PhraseKeys[K]["variables"]]: PhraseKeys[K]["variables"][KV];
  } &
    {
      [KCV in keyof PhraseKeys[K]["contentVariables"]]: C;
    } &
    {
      [KSC in keyof PhraseKeys[K]["styleClasses"]]: (
        content: C,
        styledContentName: keyof PhraseKeys[K]["styledContents"] & string
      ) => C;
    }
): StaticNode<C>[] => {
  const locale = localizedPhrases.locales[localeKey];
  const phrase =
    localizedPhrases.localizedPhraseKeys[locale?.localeCode as string][
      phraseKey
    ];

  const interpolationMap = {} as {
    [k: string]: StaticNode<C>[];
  };
  for (const interpolationKey in phrase.interpolations) {
    const interpolation: Interpolation =
      phrase.interpolations[interpolationKey];
    interpolationMap[interpolationKey] = getInterpolationValue(
      interpolation,
      args
    ) as StaticNode<C>[];
  }
  const hrefMap = {} as {
    [key in keyof PhraseKeys[K]["links"] & string]: string;
  };
  for (const k in phrase.links) {
    const linkKey = k as keyof PhraseKeys[K]["links"] & string;
    const link: {
      linkName: string;
      href: PlainTextNode[];
      displayValue: TextNode[];
    } = phrase.links[linkKey];
    hrefMap[linkKey] = getStaticText(link.href, args);
  }
  const linkMap = {} as {
    [k: string]: StaticNode<C>[];
  };
  for (const linkKey in phrase.links) {
    const link: {
      linkName: string;
      href: PlainTextNode[];
      displayValue: TextNode[];
    } = phrase.links[linkKey];
    linkMap[linkKey] = getStaticNodes(
      link.displayValue,
      args,
      hrefMap,
      {},
      interpolationMap
    ) as StaticNode<C>[];
  }

  const styledContentMap = {} as {
    [k: string]: {
      styleClass: keyof PhraseKeys[K]["styleClasses"];
      nodes: StaticNode<C>[];
    };
  };
  for (const styledContentKey in phrase.styledContents) {
    const styledContent: StyledContent =
      phrase.styledContents[styledContentKey];
    styledContentMap[styledContentKey] = {
      styleClass:
        styledContent.styleClass as keyof PhraseKeys[K]["styleClasses"],
      nodes: getStaticNodes(
        styledContent.displayValue,
        args,
        hrefMap,
        {},
        interpolationMap
      ) as StaticNode<C>[],
    };
  }
  return getStaticNodes(
    phrase.phrase,
    args,
    hrefMap,
    linkMap,
    interpolationMap,
    styledContentMap
  ) as StaticNode<C>[];
};

export interface StaticTextNode<C> {
  type: "text";
  content: string;
  styles: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
  }
  children: StaticNode<C>[]
}

export interface StaticStyledTextNode<C, N extends string> {
  type: "styled-content";
  styleClass: string;
  styledContentName: N;
  styleClassFunction: (content: C, styledContentName: N) => C;
  content: string;
  styles: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
  }
  children: StaticNode<C>[]
}

export interface StaticLinkNode<C> {
  type: "link";
  linkName: string;
  href: string;
  styles: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
  }
  children: StaticNode<C>[]
}

export interface StaticUnOrderedListNode<C> {
  type: "ul";
  children: StaticListNode<C>[]
}

export interface StaticOrderedListNode<C> {
  type: "ol";
  children: StaticListNode<C>[]
}

export interface StaticListNode<C> {
  type: "li";
  children: StaticNode<C>[]
}

export interface StaticContentVariable<C> {
  type: "content";
  data: C,
}

export type StaticNode<C> = StaticTextNode<C> | StaticLinkNode<C> | StaticUnOrderedListNode<C> | StaticOrderedListNode<C> | StaticContentVariable<C>;

const getStaticNodes = <C, K extends keyof PhraseKeys>(
  textNodes: TextNode[],
  argMap: {
    [KV in keyof PhraseKeys[K]["variables"]]: PhraseKeys[K]["variables"][KV];
  } &
    {
      [KCV in keyof PhraseKeys[K]["contentVariables"]]: C;
    } &
    {
      [KSC in keyof PhraseKeys[K]["styleClasses"]]: (
        content: C,
        styledContentName: keyof PhraseKeys[K]["styledContents"] & string
      ) => C;
    },
  hrefMap: { [key in keyof PhraseKeys[K]["links"] as string]: string } = {} as {
    [key in keyof PhraseKeys[K]["links"] as string]: string;
  },
  linkMap: {
    [key in keyof PhraseKeys[K]["links"] as string]: StaticNode<C>[];
  } = {} as {
    [key in keyof PhraseKeys[K]["links"] as string]: StaticNode<C>[];
  },
  interpolationsMap: {
    [key in keyof PhraseKeys[K]["interpolations"] as string]: StaticNode<C>[];
  } = {} as {
    [key in keyof PhraseKeys[K]["interpolations"] as string]: StaticNode<C>[];
  },
  styledContentsMap: {
    [key in keyof PhraseKeys[K]["styledContents"] as string]: {
        nodes: StaticNode<C>[],
        styleClass: keyof PhraseKeys[K]["styleClasses"]
    };
  } = {} as {
    [key in keyof PhraseKeys[K]["styledContents"] as string]: {
        nodes: StaticNode<C>[],
        styleClass: keyof PhraseKeys[K]["styleClasses"]
    };
  }
): (StaticNode<C> | StaticListNode<C>|StaticContentVariable<C>|StaticStyledTextNode<C, keyof PhraseKeys[K]["styledContents"]&string>)[] => {
  return textNodes.map((textNode) => {
    const children = getStaticNodes(
      textNode.children,
      argMap,
      hrefMap,
      linkMap,
      interpolationsMap,
      styledContentsMap
    );
    if (textNode.type == PhraseType.Variable) {
      const variableName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["variables"] & string;
      const variableValue =
        argMap?.[variableName]?.toString?.() ?? ("" as string);
      return {
        type: "text",
        content: variableValue,
        styles: textNode.styles,
        children: [],
      } as StaticTextNode<C>;
    }
    if (textNode.type == PhraseType.ContentVariable) {
      const contentVariableName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["contentVariables"] & string;
      const contentVariableValue: C = argMap?.[contentVariableName];
      return {
        type: "content",
        data: contentVariableValue,
      } as StaticContentVariable<C>;
    }
    if (textNode.type == PhraseType.StyledContent) {
      const styledContentName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["styledContents"] & string;
      const styledContentChildren = styledContentsMap?.[styledContentName] as {
        nodes: StaticNode<C>[],
        styleClass: keyof PhraseKeys[K]["styleClasses"]&string
      };
      const styleClassFunction =
        argMap?.[
          styledContentChildren?.styleClass as keyof PhraseKeys[K]["styleClasses"] &
            string
        ];
      return {
        type: "styled-content",
        styleClass: styledContentChildren?.styleClass,
        styledContentName,
        styleClassFunction,
        content: "",
        styles: textNode.styles,
        children: styledContentChildren.nodes,
      } as StaticStyledTextNode<C, keyof PhraseKeys[K]["styledContents"] & string>;
    }

    if (textNode.type == PhraseType.Interpolation) {
      const interpolationName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["interpolations"] & string;
      const interpolationChildren = interpolationsMap[
        interpolationName
      ] as StaticNode<C>[];
      return {
        type: "text",
        content: "",
        styles: textNode.styles,
        children: interpolationChildren,
      } as StaticTextNode<C>;
    }
    if (textNode.type == PhraseType.Link) {
      const linkName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["links"] & string;
      const linkChildren = linkMap[linkName] as StaticNode<C>[];
      return {
        type: "link",
        linkName,
        href: hrefMap[linkName],
        styles: textNode.styles,
        children: linkChildren,
      } as StaticLinkNode<C>;
    }
    if (textNode.type == PhraseType.Li) {
      return {
        type: "li",
        children,
      } as StaticListNode<C>;
    }
    if (textNode.type == PhraseType.Ol) {
      const listChildren = children as unknown as StaticListNode<C>[];
      return {
        type: "ol",
        children: listChildren,
      } as StaticOrderedListNode<C>;
    }
    if (textNode.type == PhraseType.UL) {
      const listChildren = children as unknown as StaticListNode<C>[];
      return {
        type: "ul",
        children: listChildren,
      } as StaticUnOrderedListNode<C>;
    }
    return {
      type: "text",
      content: textNode.content,
      styles: textNode.styles,
      children,
    } as StaticTextNode<C>;
  });
};

const getInterpolationValue = <
C,
K extends keyof PhraseKeys,
> (
    interpolation: Interpolation,
    args: {
        [KV in keyof PhraseKeys[K]["variables"]]: PhraseKeys[K]["variables"][KV];
    }&{
        [KCV in keyof PhraseKeys[K]["contentVariables"]]: C;
    }&{
      [KSC in keyof PhraseKeys[K]["styleClasses"]]: (
        content: C,
        styledContentName: keyof PhraseKeys[K]["styledContents"] & string
      ) => C;
    }

     ) => {
  for (const caseStatement of interpolation.cases) {
    const argValue: PhraseKeys[K]["variables"][keyof PhraseKeys[K]["variables"]]|string|number|boolean = args[caseStatement.variable];
    const comparatorValue = caseStatement.value as PhraseKeys[K]["variables"][keyof PhraseKeys[K]["variables"]];
    const operator = caseStatement.operator as "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "is_fractional";
    if (!isStatementTrue(argValue, comparatorValue, operator)) {
      continue;
    }
    let allSubcasesAreTrue = true;
    for (const subcase of caseStatement.subcases) {
      const comparatorValue = subcase.value as PhraseKeys[K]["variables"][keyof PhraseKeys[K]["variables"]];
      if (!isStatementTrue(argValue, comparatorValue, operator)) {
        allSubcasesAreTrue = false;
        break;
      }
    }
    if (!allSubcasesAreTrue) {
      break;
    }
    return getStaticNodes(caseStatement.resultant, args);
  }
  return getStaticNodes(interpolation.default, args);
}

const getStaticText = <
  K extends keyof PhraseKeys,
  A extends PhraseKeys[K]["variables"]
>(
  plainTextNodes: PlainTextNode[],
  variableMap: A,
): string => {
  return plainTextNodes.map((textNode) => {
    if (textNode.type == "variable") {
      const variableName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["variables"]&string;
      const variableValue = variableMap?.[variableName]?.toString() ?? "" as string;
      return variableValue;
    }
    return textNode.content;
  }).join("");
};

export const getDebugInfo = <
  K extends keyof PhraseKeyDebugInfo,
>(
  phraseKeyDebugInfo: PhraseKeyDebugInfo,
  key: K,
): DebugInfo => {
  return phraseKeyDebugInfo[key];
};

export default textJSON as unknown as LocalizedPhrases;

interface Interpolation {
  cases: Array<{
    resultant: TextNode[];
    variable: string;
    value: string | number | boolean;
    operator: string;
    subcases: Array<{
      value: string | number | boolean;
    }>;
  }>;
  default: [];
}