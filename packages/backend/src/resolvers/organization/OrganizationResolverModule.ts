import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import SessionStore from "@floro/redis/src/sessions/SessionStore";
import OrganizationService from "../../services/organizations/OrganizationService";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import {
  CreateOrganizationResponse,
  MutationCreateOrganizationArgs,
} from "@floro/graphql-schemas/src/generated/main-graphql";
import { User } from "@floro/database/src/entities/User";

@injectable()
export default class OrganizationResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
    "Query",
  ];
  protected sessionStore!: SessionStore;
  protected organizaionService!: OrganizationService;

  protected loggedInUserGuard!: LoggedInUserGuard;

  constructor(
    @inject(SessionStore) sessionStore: SessionStore,
    @inject(OrganizationService) organizaionService: OrganizationService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard
  ) {
    super();
    this.sessionStore = sessionStore;
    this.organizaionService = organizaionService;
    this.loggedInUserGuard = loggedInUserGuard;
  }

  public Mutation: main.MutationResolvers = {
    createOrganization: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        {
          name,
          legalName,
          handle,
          contactEmail,
          agreedToCustomerServiceAgreement,
        }: MutationCreateOrganizationArgs,
        { currentUser }: { currentUser: User }
      ): Promise<CreateOrganizationResponse> => {
        try {
          const result = await this.organizaionService.createOrg(
            name,
            legalName,
            handle,
            contactEmail,
            agreedToCustomerServiceAgreement,
            currentUser
          );
          if (result.action == "ORGANIZATION_CREATED") {
            return {
              __typename: "CreateOrganizationSuccess",
              organization: result.organization,
            };
          }
          if (result.action == "LOG_ERROR") {
            console.error(
              result.error?.type,
              result?.error?.message,
              result?.error?.meta
            );
          }
          return {
            __typename: "CreateOrganizationError",
            message: result.error?.message ?? "Unknown Error",
            type: result.error?.type ?? "UNKNOWN_ERROR",
          };
        } catch (error: any) {
          console.error(error?.message);
          return {
            __typename: "CreateOrganizationError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
      }
    ),
  };

  public Query: main.QueryResolvers = {};
}
