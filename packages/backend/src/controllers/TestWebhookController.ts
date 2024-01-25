import { injectable } from "inversify";
import BaseController from "./BaseController";
import { Post } from "./annotations/HttpDecorators";
import { createHmac } from "crypto";

@injectable()
export default class TestWebhookController extends BaseController {
  constructor() {
    super();
    this.envs = ["development", "test"];
  }

  @Post("/webhook/test")
  public async(req, res) {
    try {
      const signature = req.headers["floro-signature-256"];
      const stringPayload = JSON.stringify(req.body);
      const hmac = createHmac(
        "sha256",
        // PUT in ENV VARS
        "iOWG3icy13lqO0xOGXD/O1YquZDAssDvytCIrOfDQPo="
      );
      const reproducedSignature =
        "sha256=" + hmac.update(stringPayload).digest("hex");
      if (signature == reproducedSignature) {
        res.sendStatus(204);
        return;
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
