import { injectable, inject } from "inversify";
import RedisClient from "../RedisClient";
import MainConfig from "@floro/config/src/MainConfig";
import metaFile from "@floro/common-generators/meta.floro.json" assert { type: "json" };
import { LocalizedPhrases } from "@floro/common-generators/floro_modules/text-generator";
import initText from "@floro/common-generators/floro_modules/text-generator/text.json" assert { type: "json" };

const FLORO_TEXT_PREFIX = "floro_text_repo";

@injectable()
export default class FloroTextStore {
    public redisClient!: RedisClient;
    public mainConfig!: MainConfig;
    public buildText: LocalizedPhrases = initText as unknown as LocalizedPhrases;
    public currentText: LocalizedPhrases = initText as unknown as LocalizedPhrases;
    public currentTextString: string = JSON.stringify(initText);
    public buildSha: string = metaFile.sha;
    public currentSha: string = metaFile.sha;
    public buildRepoId: string = metaFile.repositoryId;
    public buildBranch: string = "main";

    constructor(
        @inject(RedisClient) redisClient: RedisClient,
        @inject(MainConfig) mainConfig: MainConfig
        ) {
        this.redisClient = redisClient;
        this.mainConfig = mainConfig;
    }

    public async onReady() {
        const subscriber = this.redisClient.redis?.duplicate();
        subscriber?.subscribe(
          `${FLORO_TEXT_PREFIX}:current_sha_changed:${metaFile.repositoryId}:${this.buildSha}`,
          (err) => {
            if (err) {
              console.error("Failed to subscribe: %s", err.message);
            } else {
              console.log(
                `Subscribed successfully! This client is currently subscribed to floro text channel.`
              );
            }
          }
        );

        subscriber?.on(
          "message",
          async (channel, sha) => {
            if (channel != `${FLORO_TEXT_PREFIX}:current_sha_changed:${metaFile.repositoryId}:${this.buildSha}`) {
              return;
            }
            if (sha && this.currentSha != sha) {
              const textString = await this.redisClient.redis?.get(
                `${FLORO_TEXT_PREFIX}:text:${metaFile.repositoryId}:${this.buildSha}`
              );
              if (textString) {
                const text = JSON.parse(textString) as LocalizedPhrases;
                this.currentText = text;
                this.currentSha = sha;
                this.currentTextString = JSON.stringify(text);
              }
            }
          }
        );
        const sha = await this.redisClient.redis?.get(`${FLORO_TEXT_PREFIX}:current_sha:${metaFile.repositoryId}:${this.buildSha}`);
        if (sha && this.currentSha != sha) {
            const textString = await this.redisClient.redis?.get(`${FLORO_TEXT_PREFIX}:text:${metaFile.repositoryId}:${this.buildSha}`)
            if (textString) {
                const text = JSON.parse(textString) as LocalizedPhrases;
                this.currentText = text;
                this.currentSha = sha;
                this.currentTextString = textString;
            }
        }
    }

    public async setText(newSha: string, text: LocalizedPhrases) {
        await this.redisClient.redis?.set(`${FLORO_TEXT_PREFIX}:current_sha:${metaFile.repositoryId}:${this.buildSha}`, newSha);
        await this.redisClient.redis?.set(`${FLORO_TEXT_PREFIX}:text:${metaFile.repositoryId}:${this.buildSha}`, JSON.stringify(text));
        await this.redisClient.redis?.publish(`${FLORO_TEXT_PREFIX}:current_sha_changed:${metaFile.repositoryId}:${this.buildSha}`, newSha);
    }

    public getText(): LocalizedPhrases {
        return this.currentText;
    }
    public getTextString(): string {
        return this.currentTextString;
    }
}