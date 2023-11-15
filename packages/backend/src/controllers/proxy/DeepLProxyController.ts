import { injectable } from "inversify";
import BaseController from "../BaseController";
import { Post } from "../annotations/HttpDecorators";
import { randomUUID } from "crypto";
import fetch from "node-fetch";

interface TranslationRequest {
  tsv_entries: string;
  deep_l_key: string;
  source_lang: string;
  target_lang: string;
  text: string;
  is_free_plan: boolean;
}

@injectable()
export default class DeepLProxyController extends BaseController {
  @Post("/proxy/deepL/translate/richText")
  public async deepLProxy(request, response): Promise<void> {
    response.header("Access-Control-Allow-Origin", "null, ");
    const body: TranslationRequest = request.body;
    const url = body?.is_free_plan ? "https://api-free.deepl.com" : "https://api.deepl.com";
    let hasResponded = false;
    try {
      if ((body?.tsv_entries ?? "") == "") {
        const translationRequest = await fetch(
          url + "/v2/translate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `DeepL-Auth-Key ${body.deep_l_key}`,
            },
            body: JSON.stringify({
              source_lang: body.source_lang,
              target_lang: body.target_lang,
              tag_handling: "xml",
              ignore_tags: ["x"],
              text: [body.text],
            }),
          }
        );

        const translationResponse = await translationRequest.json();
        const translation = translationResponse?.["translations"]?.[0]?.text;
        if (!translation) {
          throw new Error("missing translation");
        }
        response.send({ translation });

        return;
      }

      const glossaryName: string = "floro_glossary_" + randomUUID();

      const createGlossaryRequest = await fetch(
        url + "/v2/glossaries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `DeepL-Auth-Key ${body.deep_l_key}`,
          },
          body: JSON.stringify({
            source_lang: body.source_lang,
            target_lang: body.target_lang,
            entries: body.tsv_entries,
            entries_format: "tsv",
            name: glossaryName,
          }),
        }
      );
      const createGlossaryResponse = await createGlossaryRequest.json();
      const glossaryId = createGlossaryResponse?.["glossary_id"];
      if (!glossaryId) {
        throw new Error("missing glossary");
      }

      const translationRequest = await fetch(
        url + "/v2/translate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `DeepL-Auth-Key ${body.deep_l_key}`,
          },
          body: JSON.stringify({
            source_lang: body.source_lang,
            target_lang: body.target_lang,
            tag_handling: "xml",
            ignore_tags: ["x"],
            glossary_id: glossaryId,
            text: [body.text],
          }),
        }
      );

      const translationResponse = await translationRequest.json();
      const translation = translationResponse?.["translations"]?.[0]?.text;
      if (!translation) {
        throw new Error("missing translation");
      }
      response.send({ translation });
      hasResponded = true;
      await fetch(url + "/v2/glossaries/" + glossaryId, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `DeepL-Auth-Key ${body.deep_l_key}`,
        },
        body: JSON.stringify({})
      });
    } catch (e) {
      if (!hasResponded) {
        response.sendStatus(400);
      }
    }
  }
}