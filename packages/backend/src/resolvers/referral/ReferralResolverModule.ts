import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RequestCache from "../../request/RequestCache";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import ReferralService from "../../services/referrals/ReferralService";
import ReferralsContext from "@floro/database/src/contexts/referrals/ReferralsContext";

@injectable()
export default class ReferralResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
  ];
  protected referralService!: ReferralService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected loggedInUserGuard!: LoggedInUserGuard;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ReferralService) referralService: ReferralService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard
  ) {
    super();
    this.contextFactory = contextFactory;
    this.referralService = referralService;
    this.requestCache = requestCache;

    this.loggedInUserGuard = loggedInUserGuard;
  }

  public Mutation: main.MutationResolvers = {
    createPersonalReferral: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        {
          refereeEmail,
          refereeFirstName,
          refereeLastName,
          referrerDeviceId
        }: main.MutationCreatePersonalReferralArgs,
        { currentUser }
      ) => {
        if (!currentUser) {
          return {
            __typename: "CreatePersonalReferralError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result = await this.referralService.createReferral(
          refereeEmail,
          refereeFirstName,
          refereeLastName,
          referrerDeviceId,
          currentUser
        );
        if (result.action == "REFERRAL_CREATED") {
          return {
            __typename: "CreatePersonalReferralSuccess",
            referral: result.referral,
            referrer: currentUser
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CreatePersonalReferralError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreatePersonalReferralError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    resendReferral: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        { referralId }: main.MutationResendReferralArgs,
        { currentUser }
      ) => {
        if (!currentUser) {
          return {
            __typename: "ResendPersonalReferralError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const referralsContext = await this.contextFactory.createContext(
          ReferralsContext
        );
        const referral = await referralsContext.getById(referralId);
        if (!referral) {
          return {
            __typename: "ResendPersonalReferralError",
            message: "Invalid referral id",
            type: "INVALID_REFERRAL_ID_ERROR",
          };
        }
        const result = await this.referralService.resendReferral(
          referral,
          currentUser
        );
        if (result.action == "REFERRAL_RESENT") {
          return {
            __typename: "ResendPersonalReferralSuccess",
            referral: result.referral,
            referrer: currentUser
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "ResendPersonalReferralError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "ResendPersonalReferralError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    claimPersonalReferral: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        { referralId, refereeDeviceId }: main.MutationClaimPersonalReferralArgs,
        { currentUser }
      ) => {
        if (!currentUser) {
          return {
            __typename: "ClaimPersonalReferralError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const referralsContext = await this.contextFactory.createContext(
          ReferralsContext
        );
        const referral = await referralsContext.getById(referralId);
        if (!referral) {
          return {
            __typename: "ClaimPersonalReferralError",
            message: "Invalid referral id",
            type: "INVALID_REFERRAL_ID_ERROR",
          };
        }
        const result = await this.referralService.claimReferral(
          referral,
          refereeDeviceId,
          currentUser
        );
        if (result.action == "REFERRAL_CLAIMED") {
          return {
            __typename: "ClaimPersonalReferralSuccess",
            referral: result.referral,
            referee: result.refereeUser
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "ClaimPersonalReferralError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "ClaimPersonalReferralError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
  };
}