import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RequestCache from "../../request/RequestCache";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import ReferralService from "../../services/referrals/ReferralService";

@injectable()
export default class ReferralResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Referral",
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
        }: main.MutationCreatePersonalReferralArgs,
        { currentUser, cacheKey }
      ) => {
        return null;
      }
    ),
    resendReferral: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        { referralId }: main.MutationResendReferralArgs,
        { currentUser, cacheKey }
      ) => {
        return null;
      }
    ),
    claimReferral: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        { referralId }: main.MutationClaimReferralArgs,
        { currentUser, cacheKey }
      ) => {
        return null;
      }
    ),
  };

  public Referral: main.ReferralResolvers = {
    referralState: (referral, _, { currentUser }) => {
      if (!currentUser) {
        return null;
      }
      if (
        currentUser.id == referral.referrerUserId &&
        referral.referralState == "invalid"
      ) {
        return "sent";
      }

      return null;
    },
  };
}
