
import { injectable, inject } from "inversify";
import {
  Job,
  Queue,
  Worker,
  QueueScheduler
} from "bullmq";

import axios from "axios";
import { createHmac, randomUUID, createHash } from "crypto";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { Repository } from "@floro/database/src/entities/Repository";
import { User } from "@floro/database/src/entities/User";
import BranchPushHandler from "../events/BranchPushEventHandler";
import { Branch } from "@floro/database/src/entities/Branch";
import { Branch as FloroBranch } from "floro/dist/src/repo";
import RepoDataService from "../repositories/RepoDataService";
import RedisClient from "@floro/redis/src/RedisClient";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { QueueService } from "../QueueService";
import RepositoryEnabledWebhookKeysContext from "@floro/database/src/contexts/api_keys/RepositoryEnabledWebhookKeysContext";
import WebhookEventsContext from "@floro/database/src/contexts/api_keys/WebhookEventsContext";
import { RepositoryEnabledWebhookKey } from "@floro/database/src/entities/RepositoryEnabledWebhookKey";
import { url } from "inspector";

@injectable()
export default class BranchUpdateWebhookQueue implements BranchPushHandler, QueueService {
  private contextFactory!: ContextFactory;
  private repoDataService!: RepoDataService;

  public static QUEUE_NAME = "branch-update-webhook-queue";

  public queue!: Queue;
  public worker!: Worker;
  public scheduler!: QueueScheduler;
  public pubsub!: RedisPubSub;


  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoDataService) repoDataService: RepoDataService,
  ) {
    this.contextFactory = contextFactory;
    this.repoDataService = repoDataService;
  }

  public setRedisPubsub(pubsub: RedisPubSub): void {
    this.pubsub = pubsub;
  }

  public async onBranchChanged(
    repository: Repository,
    _byUser: User,
    dbBranch: Branch
  ): Promise<void> {
    if (!dbBranch?.branchId) {
      return;
    }
    const branches = await this.repoDataService.getBranches(
      repository.id,
    );
    const floroBranch = branches.find(b => b.id == dbBranch.branchId);

    if (floroBranch) {
        const repositoryEnabledWebhookKeysContext =
        await this.contextFactory.createContext(
            RepositoryEnabledWebhookKeysContext
        );

        const repositoryWebhooks =
        await repositoryEnabledWebhookKeysContext.getRepositoryWebhookKeys(
            repository.id
        );
        const enabledWebhooks = repositoryWebhooks.filter(enabledWebhook => {
            return (
            !enabledWebhook.webhookKey?.isDeleted &&
            enabledWebhook.webhookKey?.isVerified &&
            enabledWebhook.webhookKey?.isEnabled
            );
        });
      for (const enabledWebhook of enabledWebhooks) {
        const webhookTrackingId = randomUUID();
        this.addtoQueue({
            jobId: webhookTrackingId,
            webhookTrackingId,
            floroBranch: floroBranch,
            enabledWebhook,
            repositoryId: repository.id
        });
      }
    }
  }

  public async addtoQueue(args: {
    jobId: string;
    webhookTrackingId: string;
    floroBranch: FloroBranch & {dbId: string};
    enabledWebhook: RepositoryEnabledWebhookKey;
    repositoryId: string;
  }): Promise<void> {
    this.queue.add(BranchUpdateWebhookQueue.QUEUE_NAME, args, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        }
    });
  }

  public startQueueWorker(redisClient: RedisClient): void {
    this.queue = new Queue(BranchUpdateWebhookQueue.QUEUE_NAME, {
      connection: redisClient.redis,
    });
    // need scheduler for backoff
    this.scheduler = new QueueScheduler(BranchUpdateWebhookQueue.QUEUE_NAME, {
      connection: redisClient.redis,
    });
    this.worker = new Worker(
      BranchUpdateWebhookQueue.QUEUE_NAME,
      async (args: Job<{ jobId: string; webhookTrackingId: string; floroBranch: FloroBranch & {dbId: string}, enabledWebhook: RepositoryEnabledWebhookKey, repositoryId: string }>) => {
          const attempt = (args?.attemptsMade ?? 1);
          const queuedBranch: FloroBranch & {dbId: string} = args.data.floroBranch;
          const repositoryId: string = args.data.repositoryId;
          const webhookTrackingId: string = args.data.webhookTrackingId;
          if (!queuedBranch) {
            return;
          }
          const branches = await this.repoDataService.getBranches(
            repositoryId
          );
          const repository = await this.repoDataService.getRepository(
            repositoryId
          );
          if (!repository) {
            return;
          }

          const floroBranch: FloroBranch | undefined | null =
            !!queuedBranch?.id
              ? branches?.find((b) => b.id == queuedBranch?.id)
              : null;
          if (!floroBranch) {
            return;
          }
          let didSucceed = false;
          let statusCode: number = 0;
          const url = this.getWebhookUrl(args.data.enabledWebhook);
          const secret = args.data.enabledWebhook.webhookKey?.secret as string;
          const branch = {
            id: floroBranch.id as string,
            name: floroBranch.name as string,
            lastCommit: floroBranch.lastCommit as string,
            createdBy: floroBranch.createdBy as string,
            createdByUsername: floroBranch.createdByUsername as string,
            createdAt: floroBranch.createdAt as string,
            baseBranchId: floroBranch?.baseBranchId as string,
          };
          const jsonPayload = JSON.stringify({
            event: "branch.updated",
            repositoryId,
            payload: {
              branch
            },
          });

          const hash = createHash("sha256");
          hash.update(JSON.stringify(jsonPayload));
          const payloadHash = hash.digest("hex");
          try {
            const hmac = createHmac("sha256", secret);
            const signature =
              "sha256=" + hmac.update(jsonPayload).digest("hex");

            const result = await axios({
                method: "post",
                url,
                headers: {
                "Content-Type": "application/json",
                "Floro-Signature-256": signature,
                "webhook-attempt": attempt,
                "webhook-tracking-id": webhookTrackingId,
                },
                data: jsonPayload,
                timeout: 5000,
            });

            didSucceed = result.status >= 200 && result.status < 300;
            statusCode = result.status;

          } catch(e) {
            didSucceed = false;
          }
          const webhookEventsContext =
            await this.contextFactory.createContext(
              WebhookEventsContext
            );
          try {
            await webhookEventsContext.create({
                webhookVersion: "0.0.0",
                webhookTrackingId,
                didSucceed,
                attemptCount: attempt,
                hookUrl: url,
                statusCode,
                payloadHash,
                repositoryId: repositoryId,
                webhookKeyId: args?.data?.enabledWebhook?.webhookKey?.id,
                repositoryEnabledWebhookKeyId: args?.data?.enabledWebhook?.id,
            })

          } catch(e) {
            console.error("webhook insert failed for url: " + url + " repositoryEnabledApiKeyId: " + args?.data?.enabledWebhook?.id);
          }
          if (!didSucceed) {
            throw new Error("BranchUpdateWebhookQueue failed for webhook");
          }

      },
      { autorun: true, connection: redisClient.redis}
    );
  }

  private getWebhookUrl(webhook: RepositoryEnabledWebhookKey) {

    let str = `${webhook?.protocol ?? "http"}://`;
    if (webhook.subdomain) {
      str += webhook.subdomain + ".";
    }

    str += webhook?.webhookKey?.domain as string;
    if (webhook?.port) {
      str += ":" + webhook?.port;
    }
    return str + (webhook?.uri ?? "");
  }
}
