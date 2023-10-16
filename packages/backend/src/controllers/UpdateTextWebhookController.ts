import { injectable, inject } from "inversify";
import BaseController from "./BaseController";
import { Post } from "./annotations/HttpDecorators";
import { createHmac } from "crypto";
import FloroTextStore from "@floro/redis/src/stores/FloroTextStore";
import MainConfig from "@floro/config/src/MainConfig";
import metaFile from "@floro/common-generators/meta.floro.json" assert {type: "json"};
import fetch from "node-fetch";
import { getJSON } from "@floro/generators/text-generator/dist/cjs/src";
import {  LocalizedPhrases } from "@floro/common-generators/floro_modules/text-generator";

const FLORO_WEBHOOK_KEY = "iOWG3icy13lqO0xOGXD/O1YquZDAssDvytCIrOfDQPo=";
const FLORO_API_KEY = "3V8JGwztge9Nij5BRsEstEZxBjCtPpUNiat6CNj9v7g=";

@injectable()
export default class UpdateTextWebhookController extends BaseController {
  public floroTextStore: FloroTextStore;
  public mainConfig: MainConfig;
  constructor(
    @inject(FloroTextStore) floroTextStore: FloroTextStore,
    @inject(MainConfig) mainConfig: MainConfig
  ) {
    super();
    this.mainConfig = mainConfig;
    this.floroTextStore = floroTextStore;
  }

  @Post("/webhook/floro/update_text")
  public async updateText(req, res) {
    try {
      const signature = req.headers["floro-signature-256"];
      const stringPayload = JSON.stringify(req.body);
      const hmac = createHmac(
        "sha256",
        FLORO_WEBHOOK_KEY
      );
      const reproducedSignature =
        "sha256=" + hmac.update(stringPayload).digest("hex");
      if (signature == reproducedSignature) {
        res.sendStatus(204);
        if (req.body?.repositoryId != metaFile.repositoryId) {
          return;
        }
        const payload = req.body?.payload;
        if (!payload?.branch?.lastCommit) {
          return;
        }
        if (payload?.branch?.id != "main") {
          return
        }
        try {
          const isValidTopologicalSubsetRequest = await fetch(
            `${this.mainConfig.floroApiServer()}/public/api/v0/repository/${metaFile.repositoryId}/commit/${metaFile.sha}/isTopologicalSubsetValid/${payload.branch.lastCommit}/text`,{
              headers: {
                'floro-api-key': FLORO_API_KEY
              }
          })
          if (isValidTopologicalSubsetRequest.status != 200) {
            return;
          }
          const isValidTopologicalSubsetJSON = await isValidTopologicalSubsetRequest.json();
          if (!isValidTopologicalSubsetJSON.isTopologicalSubsetValid) {
            return;
          }
          const stateRequest = await fetch(
            `${this.mainConfig.floroApiServer()}/public/api/v0/repository/${metaFile.repositoryId}/commit/${payload.branch.lastCommit}/state`,{
              headers: {
                'floro-api-key': FLORO_API_KEY
              }
          })
          const { state } = await stateRequest.json();
          if (!state?.store?.text) {
            return;
          }
          const textUpdate: LocalizedPhrases = await getJSON(state.store);
          this.floroTextStore.setText(payload.branch.lastCommit, textUpdate);
        } catch(e) {
          console.log("Text update failed", e);
        }
      } else {
        res.sendStatus(403);
        return;
      }
    } catch (e) {
      res.sendStatus(500);
      return;
    }
  }
}
