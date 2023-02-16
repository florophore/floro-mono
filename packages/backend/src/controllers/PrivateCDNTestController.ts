import { inject, injectable } from "inversify";
import BaseController from "./BaseController";
import { Get } from "./annotations/HttpDecorators";
import StorageAuthenticator from "@floro/storage/src/StorageAuthenticator";
import url from "url";
import StorageClient from "@floro/storage/src/StorageClient";
import path from "path";
import fs from "fs";
import mime from "mime-types";

@injectable()
export default class PrivateCDNTestController extends BaseController {
  private storageAuthenticator: StorageAuthenticator;
  private storageClient!: StorageClient;

  constructor(
    @inject(StorageAuthenticator) storageAuthenticator: StorageAuthenticator,
    @inject(StorageClient) storageClient: StorageClient
  ) {
    super();
    this.envs = ["development", "test"];
    this.storageAuthenticator = storageAuthenticator;
    this.storageClient = storageClient;
  }

  @Get("/private-cdn/*")
  public async getAsset(req, res) {
    try {
      const reqPath = req.path.split("&")[0];
      const reqRelativePath = reqPath.split("/private-cdn")[1]
      const isValid = this.storageAuthenticator.verifySignedURL(req.path, reqRelativePath);
      if (!isValid) {
        res.status(403).json({
          message: "Forbidden.",
        });
        return;
      }
      const pathParts = reqRelativePath.split("/").slice(1);
      const staticRoot = this.storageClient.getStaticRoot("private");
      const assetPath = path.join(staticRoot as string, ...pathParts);

      const file = await fs.promises.readFile(assetPath);
      if (!file) {
        res.status(404).json({
          message: "Not Found.",
        });
        return;
      }
      const contentType = mime.contentType(path.extname(assetPath));
      res.setHeader("content-type", contentType);
      res.send(file.toString());
    } catch (e) {
      res.status(404).json({
        message: "Not Found.",
      });
      return;
    }
  }
}