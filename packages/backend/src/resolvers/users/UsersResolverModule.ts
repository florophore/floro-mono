import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import { User } from "@floro/database/src/entities/User";
import { UsernameCheckResult } from "@floro/graphql-schemas/src/generated/main-graphql";
import UsersService from "../../services/users/UsersService";
import { USERNAME_REGEX } from "@floro/common-web/src/utils/validators";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import RequestCache from "../../request/RequestCache";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import { OrganizationRole } from "@floro/database/src/entities/OrganizationRole";
import { OrganizationInvitation } from "@floro/database/src/entities/OrganizationInvitation";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import OrganizationInvitationsContext from "@floro/database/src/contexts/organizations/OrganizationInvitationsContext";
import OrganizationInvitationService from "../../services/organizations/OrganizationInvitationService";

@injectable()
export default class UsersResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Query",
    "User",
    "Mutation",
  ];
  protected usersService!: UsersService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected organizationInvitationService!: OrganizationInvitationService;
  protected loggedInUserGuard!: LoggedInUserGuard;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(UsersService) usersService: UsersService,
    @inject(OrganizationInvitationService)
    organizationInvitationService: OrganizationInvitationService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard
  ) {
    super();
    this.contextFactory = contextFactory;
    this.usersService = usersService;
    this.requestCache = requestCache;

    this.organizationInvitationService = organizationInvitationService;
    this.loggedInUserGuard = loggedInUserGuard;
  }

  public Query: main.QueryResolvers = {
    user: async (_root, { id }) => {
      const usersContext = await this.contextFactory.createContext(
        UsersContext
      );
      return await usersContext.getById(id);
    },
    usernameCheck: async (
      _root,
      { username }
    ): Promise<UsernameCheckResult> => {
      if (!username || username == "" || !USERNAME_REGEX.test(username)) {
        return {
          __typename: "UsernameCheckResult",
          exists: false,
          username: username ?? "",
        };
      }
      const exists = await this.usersService.checkUsernameIsTaken(
        username ?? ""
      );
      return {
        __typename: "UsernameCheckResult",
        exists,
        username: username,
      };
    },
    searchUsers: async (_, { query }) => {
      if (
        ((query ?? "")?.length < 2 && query?.[0] != "@") ||
        (query?.[0] == "@" && (query ?? "")?.length < 3)
      ) {
        return [];
      }
      const usersContext = await this.contextFactory.createContext(
        UsersContext
      );
      return await usersContext.searchUsers(query ?? "");
    },
  };

  public Mutation: main.MutationResolvers = {
    acceptOrganizationInvitation: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        { invitationId }: main.MutationRejectOrganizationInvitationArgs,
        { currentUser }
      ) => {
        const organizationInvitationsContext =
          await this.contextFactory.createContext(
            OrganizationInvitationsContext
          );
        const organizationInvitation =
          await organizationInvitationsContext.getById(invitationId);
        if (!organizationInvitation) {
          return {
            __typename: "AcceptOrganizationInvitationError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const result =
          await this.organizationInvitationService.acceptInvitation(
            organizationInvitation,
            currentUser
          );

        if (result.action == "INVITATION_ACCEPTED") {
          return {
            __typename: "AcceptOrganizationInvitationSuccess",
            organizationInvitation: result.organizationInvitation,
          };
        }

        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "AcceptOrganizationInvitationError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "AcceptOrganizationInvitationError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    rejectOrganizationInvitation: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        { invitationId }: main.MutationAcceptOrganizationInvitationArgs,
        { currentUser }
      ) => {
        const organizationInvitationsContext =
          await this.contextFactory.createContext(
            OrganizationInvitationsContext
          );
        const organizationInvitation =
          await organizationInvitationsContext.getById(invitationId);
        if (!organizationInvitation) {
          return {
            __typename: "RejectOrganizationInvitationError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const result =
          await this.organizationInvitationService.rejectInvitation(
            organizationInvitation,
            currentUser
          );

        if (result.action == "INVITATION_REJECTED") {
          return {
            __typename: "RejectOrganizationInvitationSuccess",
            organizationInvitation: result.organizationInvitation,
          };
        }

        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "RejectOrganizationInvitationError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "RejectOrganizationInvitationError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
  };

  public User: main.UserResolvers = {
    freeDiskSpaceBytes: (user, _, { currentUser }) => {
      if (user.id == currentUser?.id) {
        return user?.freeDiskSpaceBytes ?? null;
      }
      return null;
    },
    diskSpaceLimitBytes: (user, _, { currentUser }) => {
      if (user.id == currentUser?.id) {
        return user?.diskSpaceLimitBytes ?? null;
      }
      return null;
    },
    utilizedDiskSpaceBytes: (user, _, { currentUser }) => {
      if (user.id == currentUser?.id) {
        return user?.utilizedDiskSpaceBytes ?? null;
      }
      return null;
    },
    organizations: async (user, _, { currentUser, cacheKey }) => {
      if (user.id != currentUser.id) {
        return null;
      }
      const cachedOrganizations = this.requestCache.getUserOrganizations(
        cacheKey,
        user.id as string
      );
      if (cachedOrganizations) {
        return cachedOrganizations;
      }
      const organizationsContext = await this.contextFactory.createContext(
        OrganizationsContext
      );
      const organizations =
        await organizationsContext.getAllOrganizationsForUser(
          user.id as string
        );
      organizations.forEach((organization) => {
        this.requestCache.setOrganization(cacheKey, organization);
        this.requestCache.setOrganizationRoles(
          cacheKey,
          organization,
          organization.organizationRoles as OrganizationRole[]
        );
        this.requestCache.setOrganizationMembers(
          cacheKey,
          organization,
          organization.organizationMembers as OrganizationMember[]
        );
        organization.organizationMembers?.forEach(member => {
          const roles = organization.organizationMemberRoles?.filter(memberRole => {
            return memberRole.organizationMemberId == member.id;
          }).map(
            (memberRole) => {
              this.requestCache.setOrganizationMembership(
                cacheKey,
                organization,
                member.user as User,
                memberRole.organizationMember as OrganizationMember
              );
              return memberRole.organizationRole;
            }
          );
          this.requestCache.setMembershipRoles(
            cacheKey,
            member,
            roles as OrganizationRole[]
          );
        });
        this.requestCache.setOrganizationActiveMemberCount(
          cacheKey,
          organization,
          organization?.organizationMembers?.filter(
            (member) => member?.membershipState == "active"
          )?.length ?? 0
        );

        const invitations = organization?.organizationInvitations;
        this.requestCache.setOrganizationInvitations(
          cacheKey,
          organization,
          invitations as OrganizationInvitation[]
        );
        invitations?.forEach?.((invitation) => {
          const roles =
            invitation?.organizationInvitationRoles
              ?.filter?.((invitationRole) => invitationRole.organizationInvitationId == invitation.id)
              ?.map?.((invitationRole) => invitationRole?.organizationRole)
              ?.filter?.((v) => v != undefined) ?? [];
          this.requestCache.setOrganizationInvitationRoles(
            cacheKey,
            invitation,
            roles as OrganizationRole[]
          );
        });
        this.requestCache.setOrganizationSentInvitationsCount(
          cacheKey,
          organization,
          invitations?.filter?.((invite) => invite?.invitationState == "sent")
            ?.length ?? 0
        );
      });
      this.requestCache.setUserOrganizations(
        cacheKey,
        user as User,
        organizations
      );
      return organizations;
    },
  };
}