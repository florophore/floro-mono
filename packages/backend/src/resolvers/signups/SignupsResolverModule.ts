import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RequestCache from "../../request/RequestCache";
import PhotoUploadService from "../../services/photos/PhotoUploadService";
import MainConfig from "@floro/config/src/MainConfig";
import SignupEmailRemindersContext from "@floro/database/src/contexts/signups/SignupEmailRemindersContext";
import EmailQueue from "@floro/redis/src/queues/EmailQueue";
import { ReminderEmailAck } from "@floro/graphql-schemas/src/generated/main-client-graphql";

const fromEmail = process?.env?.DOMAIN ?? "floro.io";

@injectable()
export default class SignupsResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
  ];
  protected mainConfig!: MainConfig;
  protected photoUploadService!: PhotoUploadService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  private emailQueue?: EmailQueue;

  constructor(
    @inject(MainConfig) mainConfig: MainConfig,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(EmailQueue) emailQueue: EmailQueue
  ) {
    super();
    this.mainConfig = mainConfig;
    this.contextFactory = contextFactory;
    this.requestCache = requestCache;
    this.emailQueue = emailQueue;
  }

  public Mutation: main.MutationResolvers = {
    reminderToDownload: async (_, { email }): Promise<ReminderEmailAck> => {
      try {
        const signupEmailReminderContext =
          await this.contextFactory.createContext(SignupEmailRemindersContext);
        const result = await signupEmailReminderContext.createReminderRecord({
          email,
        });

        await this.emailQueue?.add({
          jobId: result.id,
          template: "ReminderToDownloadEmail",
          props: {
            link: "https://floro.io",
            action: "signup",
          },
          to: email?.trim() as string,
          from: `accounts@${fromEmail}`,
          subject: "Download Floro Reminder",
        });
        return {
          message: "sent",
          type: "SENT",
        };
      } catch (e: any) {
        console.log("E", e?.message);
        return {
          message: "error",
          type: "ERROR",
        };
      }
    },
  };
}
