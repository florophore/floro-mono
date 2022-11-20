import { injectable, inject } from "inversify";

import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { User } from "@floro/database/src/entities/User";
import { Referral } from "@floro/database/src/entities/Referral";
import CreateUserEventHandler from "../events/CreateUserEventHandler";
import { QueryRunner } from "typeorm";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import EmailQueue from "@floro/redis/src/queues/EmailQueue";
import EmailHelper from "@floro/database/src/contexts/utils/EmailHelper";
import EmailValidator from "email-validator";
import { NAME_REGEX } from "@floro/common-web/src/utils/validators";
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import UserAuthCredentialsContext from "@floro/database/src/contexts/authentication/UserAuthCredentialsContext";
import ReferralsContext from "@floro/database/src/contexts/referrals/ReferralsContext";
import EmailAuthStore from "@floro/redis/src/stores/EmailAuthStore";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";

const findFirstChar = (str: string) => {
  for (let i = 0; i < str.length; ++i) {
    if (/[A-z]/.test(str[i])) return str[i].toUpperCase();
  }
  return "";
};

const upcaseFirst = (str: string) => {
  const firstChar = findFirstChar(str);
  const pos = str.toLowerCase().indexOf(firstChar.toLowerCase());
  return firstChar + str.substring(pos + 1);
};

const EXPIRATION_SECONDS = 60 * 60 * 24 * 7;
const DELAY_LAST_SENT_SECONDS = 60 * 60 * 24;

export interface CreateReferralReponse {
  action:
    | "REFERRAL_CREATED"
    | "EMAIL_IN_USE_ALREADY_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "LOG_ERROR";
  referral?: Referral;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface ResendReferralReponse {
  action:
    | "REFERRAL_RESENT"
    | "FORBIDDEN_ACTION_ERROR"
    | "INVALID_STATE_ERROR"
    | "RATE_LIMIT_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "EXPIRED_REFERRAL_ERROR"
    | "LOG_ERROR";
  referral?: Referral;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface ClaimReferralReponse {
  action:
    | "REFERRAL_CLAIMED"
    | "FORBIDDEN_ACTION_ERROR"
    | "INVALID_STATE_ERROR"
    | "RATE_LIMIT_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "EXPIRED_REFERRAL_ERROR"
    | "LOG_ERROR";
  referral?: Referral;
  refereeUser?: User;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

@injectable()
export default class ReferralService implements CreateUserEventHandler {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private emailAuthStore!: EmailAuthStore;
  private emailQueue!: EmailQueue;

  constructor(
    @inject(DatabaseConnection)
    databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(EmailAuthStore) emailAuthStore: EmailAuthStore,
    @inject(EmailQueue) emailQueue: EmailQueue
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.emailAuthStore = emailAuthStore;
    this.emailQueue = emailQueue;
  }

  public async onUserCreated(
    queryRunner: QueryRunner,
    user: User,
    userAuthCredential: UserAuthCredential
  ): Promise<void> {
    const referralsContext = await this.contextFactory.createContext(
      ReferralsContext,
      queryRunner
    );
    const openReferral = await referralsContext.getOpenReferralByEmailHash(
      userAuthCredential.emailHash
    );
    if (openReferral) {
      await referralsContext.updateReferralById(openReferral.id, {
        refereeUserId: user.id,
      });
    }
  }

  public async createReferral(
    refereeEmail: string,
    refereeFirstName: string,
    refereeLastName: string,
    referrerDeviceId: string,
    currentUser: User
  ): Promise<CreateReferralReponse> {
    // 2) validate name params
    // 1) check if email hash exists already (in users & referrals)
    // 3) check if existing referral for email_hash that hasn't expired
    // 4) create referral

    if (!EmailValidator.validate(refereeEmail)) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Invalid email.",
        },
      };
    }

    if (!NAME_REGEX.test(refereeFirstName)) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Invalid first name",
        },
      };
    }

    if (!NAME_REGEX.test(refereeLastName)) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Invalid last name",
        },
      };
    }

    const isGmail = await EmailHelper.isGoogleEmail(refereeEmail);
    const refereeNormalizedEmail = EmailHelper.getUniqueEmail(
      refereeEmail,
      isGmail
    );
    const refereeEmailHash = EmailHelper.getEmailHash(refereeEmail, isGmail);

    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const userAuthCredentialsContext =
        await this.contextFactory.createContext(
          UserAuthCredentialsContext,
          queryRunner
        );
      const referralsContext = await this.contextFactory.createContext(
        ReferralsContext,
        queryRunner
      );

      const credentials =
        (await userAuthCredentialsContext.getCredentialsByEmailHash(
          refereeEmailHash
        )) ?? [];
      const userId =
        userAuthCredentialsContext.getUserIdFromCredentials(credentials);
      if (userId) {
        await queryRunner.rollbackTransaction();
        return {
          action: "EMAIL_IN_USE_ALREADY_ERROR",
          error: {
            type: "EMAIL_IN_USE_ALREADY_ERROR",
            message: "Email in use already",
          },
        };
      }
      const openReferral = await referralsContext.getOpenReferralByEmailHash(
        refereeEmailHash
      );
      if (openReferral) {
        await queryRunner.rollbackTransaction();
        return {
          action: "EMAIL_IN_USE_ALREADY_ERROR",
          error: {
            type: "EMAIL_IN_USE_ALREADY_ERROR",
            message: "Email in use already",
          },
        };
      }
      const existingCredential =
        userAuthCredentialsContext.getEmailCredential(credentials);
      if (!existingCredential) {
        await userAuthCredentialsContext.createEmailCredential(
          refereeEmail,
          true
        );
      }
      const now = new Date();
      const expiresAt = new Date(
        Math.floor(now.getTime() / 1000) * 1000 + 1000 * EXPIRATION_SECONDS
      );
      const referral = await referralsContext.createReferral({
        referrerDeviceId,
        refereeFirstName,
        refereeLastName,
        refereeEmail,
        refereeNormalizedEmail,
        refereeEmailHash,
        referralState: "sent",
        lastSentAt: now,
        expiresAt,
        referrerUserId: currentUser.id,
      });
      const authorization = await this.emailAuthStore.createEmailAuth(
        refereeEmail,
        refereeFirstName,
        refereeLastName
      );
      const link = this.emailAuthStore.link(authorization, "web");
      await this.emailQueue?.add({
        jobId: authorization.id,
        template: "PersonalReferralEmail",
        props: {
          link,
          firstName: refereeFirstName,
          referrerUserFirstName: currentUser.firstName,
          referrerUserLastName: currentUser.lastName,
          subsequentAttempt: false,
        },
        to: refereeEmail,
        from: "referrals@floro.io",
        subject: `${upcaseFirst(currentUser.firstName)} ${upcaseFirst(
          currentUser.lastName
        )} gave you 5GB of free storage on floro`,
      });

      await queryRunner.commitTransaction();
      return {
        action: "REFERRAL_CREATED",
        referral,
      };
      //
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_REFERRAL_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public async resendReferral(
    referral: Referral,
    currentUser: User
  ): Promise<ResendReferralReponse> {
    if (referral.referralState != "sent") {
      return {
        action: "INVALID_STATE_ERROR",
        error: {
          type: "INVALID_STATE_ERROR",
          message: "Email in use already",
        },
      };
    }
    if (referral.referrerUserId != currentUser.id) {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }
    const referralsContext = await this.contextFactory.createContext(
      ReferralsContext
    );

    const now = new Date();
    const currentExpiresAt = new Date(referral.expiresAt);
    if (now.getTime() > currentExpiresAt.getTime()) {
      return {
        action: "EXPIRED_REFERRAL_ERROR",
        error: {
          type: "EXPIRED_REFERRAL_ERROR",
          message: "Referral expired",
        },
      };
    }
    const lastSentAt = new Date(referral.lastSentAt);
    const delayExpiresAt = new Date(
      Math.floor(lastSentAt.getTime() / 1000) * 1000 +
        1000 * DELAY_LAST_SENT_SECONDS
    );
    if (now.getTime() < delayExpiresAt.getTime()) {
      return {
        action: "RATE_LIMIT_ERROR",
        error: {
          type: "RATE_LIMIT_ERROR",
          message: "Resend rate limited",
        },
      };
    }
    const expiresAt = new Date(
      Math.floor(now.getTime() / 1000) * 1000 + 1000 * EXPIRATION_SECONDS
    );
    const updatedReferral = await referralsContext.updateReferralById(
      referral.id,
      {
        lastSentAt: now,
        expiresAt,
      }
    );
    if (!updatedReferral) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_ERROR",
          message: "Referral not able to update.",
        },
      };
    }
    const authorization = await this.emailAuthStore.createEmailAuth(
      updatedReferral?.refereeEmail,
      updatedReferral?.refereeFirstName,
      updatedReferral?.refereeLastName
    );
    const link = this.emailAuthStore.link(authorization, "web");
    await this.emailQueue?.add({
      jobId: authorization.id,
      template: "PersonalReferralEmail",
      props: {
        link,
        firstName: updatedReferral.refereeFirstName,
        referrerUserFirstName: currentUser.firstName,
        referrerUserLastName: currentUser.lastName,
        subsequentAttempt: true,
      },
      to: updatedReferral.refereeEmail,
      from: "referrals@floro.io",
      subject: `Nudge. ${upcaseFirst(currentUser.firstName)} ${upcaseFirst(
        currentUser.lastName
      )} gave you 5GB of free storage on floro`,
    });
    return {
      action: "REFERRAL_RESENT",
      referral: updatedReferral,
    };
  }

  public async claimReferral(
    referral: Referral,
    refereeDeviceId: string,
    currentUser: User
  ): Promise<ClaimReferralReponse> {
    if (referral.referralState != "sent") {
      return {
        action: "INVALID_STATE_ERROR",
        error: {
          type: "INVALID_STATE_ERROR",
          message: "Email in use already",
        },
      };
    }
    if (referral.refereeUserId != currentUser.id) {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }

    if (referral.refereeDeviceId == refereeDeviceId) {
      return {
        action: "INVALID_STATE_ERROR",
        error: {
          type: "INVALID_STATE_ERROR",
          message: "Email in use already",
        },
      };
    }
    // reject if expired
    const now = new Date();
    const expiresAt = new Date(referral.expiresAt);
    if (now.getTime() > expiresAt.getTime()) {
      return {
        action: "EXPIRED_REFERRAL_ERROR",
        error: {
          type: "EXPIRED_REFERRAL_ERROR",
          message: "Referral expired",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();

      const usersContext = await this.contextFactory.createContext(
        UsersContext,
        queryRunner
      );
      const referralsContext = await this.contextFactory.createContext(
        ReferralsContext,
        queryRunner
      );
      const updatedReferral = await referralsContext.updateReferralById(
        referral.id,
        {
          referralState: "claimed",
          refereeDeviceId,
          refereeUserId: currentUser.id,
        }
      );

      if (!updatedReferral) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_ERROR",
            message: "Referral not able to update.",
          },
        };
      }
      const refereeUser = await usersContext.getById(
        updatedReferral?.refereeUserId as string
      );
      if (!refereeUser) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_ERROR",
            message: "Referral not able to update.",
          },
        };
      }

      const referrerUser = await usersContext.getById(
        updatedReferral?.referrerUserId as string
      );

      if (!referrerUser) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_ERROR",
            message: "Referral not able to update.",
          },
        };
      }

      // stupid typeorm bigint handling
      const refereeUserFreeDiskSpace = parseInt(
        refereeUser?.freeDiskSpaceBytes as unknown as string
      );
      const refereeReferrerRewardBytes = parseInt(
        referral?.refereeRewardBytes as unknown as string
      );
      const refereeUserDiskSpaceLimitBytes = parseInt(
        refereeUser?.diskSpaceLimitBytes as unknown as string
      );
      const updatedRefereeUser = await usersContext.updateUserById(
        refereeUser?.id as string,
        {
          freeDiskSpaceBytes:
            refereeUserFreeDiskSpace + refereeReferrerRewardBytes,
          diskSpaceLimitBytes:
            refereeUserDiskSpaceLimitBytes + refereeReferrerRewardBytes,
        }
      );

      // stupid typeorm bigint handling
      const referralReferrerRewardBytes = parseInt(
        referral?.referrerRewardBytes as unknown as string
      );
      const referrerUserFreeDiskSpace = parseInt(
        referrerUser?.freeDiskSpaceBytes as unknown as string
      );
      const referrerUserDiskSpaceLimitBytes = parseInt(
        referrerUser?.diskSpaceLimitBytes as unknown as string
      );
      await usersContext.updateUserById(referrerUser?.id as string, {
        freeDiskSpaceBytes:
          referrerUserFreeDiskSpace + referralReferrerRewardBytes,
        diskSpaceLimitBytes:
          referrerUserDiskSpaceLimitBytes + referralReferrerRewardBytes,
      });

      await queryRunner.commitTransaction();
      return {
        action: "REFERRAL_CLAIMED",
        referral: updatedReferral,
        refereeUser: updatedRefereeUser as User,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CLAIM_REFERRAL_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }
}
