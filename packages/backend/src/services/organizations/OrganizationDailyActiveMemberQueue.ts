import { injectable, inject } from "inversify";
import {
  Job,
  Queue,
  Worker,
  QueueScheduler,
} from "bullmq";

import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RepoDataService from "../repositories/RepoDataService";
import RedisClient from "@floro/redis/src/RedisClient";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { QueueService } from "../QueueService";
import cron from 'node-cron';
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import OrganizationDailyActivatedMembersContext from "@floro/database/src/contexts/organizations/OrganizationDailyActivatedMembersContext";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";

@injectable()
export default class OrganizationDailyActiveMemberQueue implements QueueService {
  private contextFactory!: ContextFactory;

  public static QUEUE_NAME = "organization-daily-active-member-queue";

  public queue!: Queue;
  public worker!: Worker;
  public scheduler!: QueueScheduler;
  public pubsub!: RedisPubSub;
  public redisClient!: RedisClient;


  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoDataService) repoDataService: RepoDataService,
  ) {
    this.contextFactory = contextFactory;
  }

  public setRedisPubsub(pubsub: RedisPubSub): void {
    this.pubsub = pubsub;
  }

  public async addtoQueue(args: {
    jobId: string;
    organizationId: string;
  }): Promise<void> {
    this.queue.add(OrganizationDailyActiveMemberQueue.QUEUE_NAME, args);
  }

  public startQueueWorker(redisClient: RedisClient): void {

    this.queue = new Queue(OrganizationDailyActiveMemberQueue.QUEUE_NAME, {
      connection: redisClient.redis,
    });

    this.scheduler = new QueueScheduler(OrganizationDailyActiveMemberQueue.QUEUE_NAME, {
      connection: redisClient.redis
    });


    this.worker = new Worker(
      OrganizationDailyActiveMemberQueue.QUEUE_NAME,
      async (args: Job<{ jobId: string; organizationId: string;}>) => {
          const organizationId: string = args.data.organizationId;
          const organizationMembersContext =
            await this.contextFactory.createContext(
              OrganizationMembersContext
            );
          const organizationDailyActivatedMembersContext =
            await this.contextFactory.createContext(
              OrganizationDailyActivatedMembersContext
            );
          const date = new Date();
          const year = new Intl.DateTimeFormat("en", {
            year: "numeric",
          }).format(date);
          const month = new Intl.DateTimeFormat("en", {
            month: "2-digit",
          }).format(date);
          const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(
            date
          );
          const dateString = `${year}-${month}-${day}`;

          const members = await organizationMembersContext.getActiveMemebersForOrganization(organizationId);
          const existingDAMs =
            await organizationDailyActivatedMembersContext.getAllDailyActiveMembersForOrg(
              organizationId,
              dateString
            );
          const existingDAMMemberIds = new Set(existingDAMs.map(dam => dam.organizationMemberId));
          let addedMembers = 0;
          for (const member of members) {
            if (existingDAMMemberIds.has(member.id)) {
                continue;
            }
            try {
                const alreadyExist = await organizationDailyActivatedMembersContext.dailyActiveMemberAlreadyExists(
                    organizationId,
                    member.id,
                    dateString
                );
                if (alreadyExist) {
                    continue;
                }
                const insertedMember = await organizationDailyActivatedMembersContext.createOrganizationDailyActivatedMember({
                    organizationId,
                    organizationMemberId: member.id,
                    date: dateString
                })
                if (insertedMember) {
                    addedMembers++;
                }

            } catch(e) {

            }
          }
          if (addedMembers > 0) {
            // add to billing queue later
          }
      },
      { autorun: true, connection: redisClient.redis }
    );

    this.worker.on("error", (error: Error) => {
      console.error("Merge Request Push Queue Error", error);
    });

    //0 */6 * * *
    cron.schedule('0 */6 * * *', async () =>  {
    //cron.schedule('* * * * *', async () =>  {
        console.log('Running DAM cron!');
        const organizationsContext = await this.contextFactory.createContext(OrganizationsContext);
        const orgIds = await organizationsContext.getOrganizationIds();
        for (const organizationId of orgIds) {
            this.addtoQueue({
                jobId: organizationId,
                organizationId
            })
        }

    });
  }
}
