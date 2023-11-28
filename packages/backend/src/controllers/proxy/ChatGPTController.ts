import { injectable } from "inversify";
import BaseController from "../BaseController";
import { Post } from "../annotations/HttpDecorators";
import fetch from "node-fetch";

interface SourcePromptRequest {
  targetText: string;
  sourceText: string;
  prompt: string;
  openAIKey: string;
  targetLang: string;
  sourceLang: string;
  includeSource: string;
  termBase: string;
  messages: Array<{
    prompt: string
    includeSource: string
    promptResponse: string
  }>;
}

const TEXT_HELP_PROMPT = (lang: string) => `
The user will provide a prompt (denoted: User Prompt) as well as document (denoted: User Document) to be revised.
Respond only with the revised document.
The document language is html but uses a strict subset of rich text tags.
The response should be plain text if the document does not use any rich text tags.
If the document does contain rich text tags do your best to respect those tags in your revisions.
Do not use any html tags that are not standard rich text.
The usable tags are u, i, s, sup, sub, br, strike, ul, ol, li.
Do not replace any content wrapped in curly braces.
The curly braces are placeholders for injected content and should not be replaced.
The language of the document has the locale code ${lang}.
Respond in the language that has a locale code of ${lang}.
`.replaceAll("\n", " ").trim();

const TRANSLATION_TEXT_HELP_PROMPT = (targetLang: string, sourceLang: string) => `
The user will provide a prompt (denoted: User Prompt), as well as a document (denoted: User Target Lang Document) to be revised in the target language (${targetLang}).
The user will also provide term base (denoted: Term Base) that is a tab delimited list of relevant terms between the source language and the target language to help aid in the GPT response. The term base may be empty.
The user will also provide a source langauge document (denoted: User Source Lang Document) in the source language (${sourceLang}).
The user prompt may be in either the target language (${targetLang}) or the source document language ${sourceLang}.
The task of the user is to translate the User Source Document into the target language.
Respond only with the revised target language document (User Target Lang Document).
Both the source document and the target document are in html but use a strict subset of rich text tags.
The response should be plain text if neither the source document nor the target document use any rich text tags.
If the document does contain rich text tags do your best to respect those tags in your revisions.
Do not use any html tags that are not standard rich text.
The usable tags are u, i, s, sup, sub, br, strike, ul, ol, li.
Do not replace any content wrapped in curly braces.
The curly braces are placeholders for injected content and should not be replaced.
The language of the target document has the locale code ${targetLang}. Make sure your revisions are in this language, unless the prompt specifies otherwise.
The language of the source document has the locale code ${sourceLang}.
`.replaceAll("\n", " ").trim();


interface TermRequest {
  localeCode: string;
  plainText: string;
  openAIKey: string;
}

const TERM_SEARCH_PROMPT = (lang: string) =>`
Search this text for phrases that should be added to a term base of a Translation Managment System.
For example, search for industry specific terminology, domain specific terminology, domain specific idioms, technical terms or made up terminology such as company names, product names, or terms that are not standard, etc.
If you see a product name or company name, try to isolate it and if possible try to separate product names, and company names from technical or industry specific terminoloy.
Return your results as an array of strings in json format. If you do not find any terms, return an empty array.
Make sure none of the terms in the response include phrases or words enclosed in curly braces.
Ignore all words and phrases that say [do not include placeholder].
The language of the text has the locale code ${lang}.
`.replaceAll("\n", " ").trim();

@injectable()
export default class ChatGPTController extends BaseController {
  @Post("/proxy/chatgpt/prompt")
  public async promptProxy(request, response): Promise<void> {
    response.header("Access-Control-Allow-Origin", "null");
    const body: SourcePromptRequest = request.body;
    const url = "https://api.openai.com/v1/chat/completions";
    try {

      const requestBody = {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: body.includeSource
              ? TRANSLATION_TEXT_HELP_PROMPT(body.targetLang, body.sourceLang)
              : TEXT_HELP_PROMPT(body.targetLang),
          },
          ...body?.messages?.flatMap((message) => {
            return [
              {
                role: "system",
                content: message.includeSource
                  ? TRANSLATION_TEXT_HELP_PROMPT(
                      body.targetLang,
                      body.sourceLang
                    )
                  : TEXT_HELP_PROMPT(body.targetLang),
              },
              {
                role: "user",
                content: message.includeSource
                  ? `User Prompt: ${message.prompt}\nUser Source Lang Document: ${body.sourceLang}\nTerm Base: ${body.termBase}\nUser Target Lang Document: ${body.targetText}`
                  : `User Prompt: ${message.prompt}\nUser Document: ${body.targetText}`,
              },
              { role: "assistant", content: message.promptResponse },
            ];
          }),
          {
            role: "user",
            content: body.includeSource
              ? `User Prompt: ${body.prompt}\nUser Source Lang Document: ${body.sourceLang}\nTerm Base: ${body.termBase}\nUser Target Lang Document: ${body.targetText}`
              : `User Prompt: ${body.prompt}\nUser Document: ${body.targetText}`,
          },
        ],
      };

      const promptRequest = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${body.openAIKey}`,
        },
        body: JSON.stringify(requestBody),
      });
      const promptResponse = await promptRequest.json();
      response.send({
          prompt: body.prompt,
          includeSource: !!body?.includeSource,
          promptResponse: promptResponse?.["choices"]?.[0]?.["message"]?.["content"] ?? ""
       });
    } catch (e) {
        response.sendStatus(400);
    }
  }

  @Post("/proxy/chatgpt/terms")
  public async findTerms(request, response): Promise<void> {
    response.header("Access-Control-Allow-Origin", "null");
    const body: TermRequest = request.body;
    const url = "https://api.openai.com/v1/chat/completions";
    try {

      const requestBody = {
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: TERM_SEARCH_PROMPT(body.localeCode),
          },
          {
            role: "user",
            content: body.plainText,
          },
        ],
      };

      const promptRequest = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${body.openAIKey}`,
        },
        body: JSON.stringify(requestBody),
      });
      const promptResponse = await promptRequest.json();
      let foundTerms: Array<string> = [];
      try {
        foundTerms = JSON.parse(promptResponse?.["choices"]?.[0]?.["message"]?.["content"] ?? "[]") as Array<string>;
        if (Array.isArray(foundTerms)) {
          response.send(foundTerms);
        } else {
          response.sendStatus(400);
        }
      } catch(e) {
        response.sendStatus(400);
      }
    } catch (e) {
        response.sendStatus(400);
    }
  }
}