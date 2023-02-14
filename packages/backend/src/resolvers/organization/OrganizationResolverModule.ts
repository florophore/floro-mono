import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import OrganizationService from "../../services/organizations/OrganizationService";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import {
  CreateOrganizationResponse,
  MutationCreateOrganizationArgs,
  Repository,
} from "@floro/graphql-schemas/src/generated/main-graphql";
import { User } from "@floro/database/src/entities/User";
import RequestCache from "../../request/RequestCache";
import OrganizationMemberLoader from "../hooks/loaders/Organization/OrganizationMemberLoader";
import { Organization } from "@floro/database/src/entities/Organization";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationMemberPermissionsLoader from "../hooks/loaders/Organization/OrganizationMemberPermissionsLoader";
import OrganizationMemberRolesLoader from "../hooks/loaders/Organization/OrganizationMemberRolesLoader";
import OrganizationRolesLoader from "../hooks/loaders/Organization/OrganizationRolesLoader";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import { OrganizationRole } from "@floro/database/src/entities/OrganizationRole";
import OrganizationInvitationsContext from "@floro/database/src/contexts/organizations/OrganizationInvitationsContext";
import OrganizationSentInvitationsCountLoader from "../hooks/loaders/Organization/OrganizationSentInvitationsCountLoader";
import OrganizationActiveMemberCountLoader from "../hooks/loaders/Organization/OrganizationActiveMemberCountLoader";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import PhotosContext from "@floro/database/src/contexts/photos/PhotosContext";
import { Photo } from "@floro/database/src/entities/Photo";
import RootOrganizationMemberPermissionsLoader from "../hooks/loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader";
import PluginsContext from "@floro/database/src/contexts/plugins/PluginsContext";

@injectable()
export default class OrganizationResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
    "Query",
    "Organization",
  ];
  protected contextFactory!: ContextFactory;
  protected organizaionService!: OrganizationService;
  protected requestCache!: RequestCache;

  protected loggedInUserGuard!: LoggedInUserGuard;

  protected organizationMemberLoader!: OrganizationMemberLoader;
  protected organizationMemberRolesLoader!: OrganizationMemberRolesLoader;
  protected organizationMemberPermissionsLoader!: OrganizationMemberPermissionsLoader;
  protected organizationRolesLoader!: OrganizationRolesLoader;

  protected organizationSentInvitationsCountLoader!: OrganizationSentInvitationsCountLoader;
  protected organizationActiveMemberCountLoader!: OrganizationActiveMemberCountLoader;
  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(OrganizationService) organizaionService: OrganizationService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(OrganizationMemberLoader)
    organizationMemberLoader: OrganizationMemberLoader,
    @inject(OrganizationMemberRolesLoader)
    organizationMemberRolesLoader: OrganizationMemberRolesLoader,
    @inject(OrganizationRolesLoader)
    organizationRolesLoader: OrganizationRolesLoader,
    @inject(OrganizationMemberPermissionsLoader)
    organizationMemberPermissionsLoader: OrganizationMemberPermissionsLoader,
    @inject(OrganizationSentInvitationsCountLoader)
    organizationSentInvitationsCountLoader: OrganizationSentInvitationsCountLoader,
    @inject(OrganizationActiveMemberCountLoader)
    organizationActiveMemberCountLoader: OrganizationActiveMemberCountLoader,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader
  ) {
    super();
    this.contextFactory = contextFactory;
    this.organizaionService = organizaionService;
    this.requestCache = requestCache;

    // guards
    this.loggedInUserGuard = loggedInUserGuard;
    // loaders
    this.organizationMemberLoader = organizationMemberLoader;
    this.organizationMemberRolesLoader = organizationMemberRolesLoader;
    this.organizationMemberPermissionsLoader =
      organizationMemberPermissionsLoader;
    this.organizationRolesLoader = organizationRolesLoader;
    this.organizationSentInvitationsCountLoader =
      organizationSentInvitationsCountLoader;
    this.organizationActiveMemberCountLoader =
      organizationActiveMemberCountLoader;
    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;
  }

  public Organization: main.OrganizationResolvers = {
    profilePhoto: async (organization) => {
      if (organization?.profilePhoto) return organization?.profilePhoto;
      if (!(organization as Organization)?.profilePhotoId) return null;
      const photosContext = await this.contextFactory.createContext(
        PhotosContext
      );
      const photo = await photosContext.getById(
        (organization as Organization)?.profilePhotoId ?? ""
      );
      return (photo as Photo) ?? null;
    },
    billingPlan: runWithHooks(
      () => [this.organizationMemberPermissionsLoader],
      async (organization, _, { cacheKey, currentUser }) => {
        if (!currentUser) {
          return null;
        }
        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id as string,
            currentUser.id
          );
        if (organizationMembership?.membershipState != "active") {
          return null;
        }
        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          organizationMembership.id
        );
        if (permissions.canModifyBilling) {
          return organization.billingPlan ?? null;
        }
        return null;
      }
    ),
    billingStatus: runWithHooks(
      () => [this.organizationMemberLoader],
      async (organization, _, { cacheKey, currentUser }) => {
        if (!currentUser) {
          return null;
        }
        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id,
            currentUser.id
          );
        return organizationMembership?.membershipState == "active"
          ? organization.billingStatus
          : null;
      }
    ),
    freeDiskSpaceBytes: runWithHooks(
      () => [this.organizationMemberLoader],
      async (organization, _, { cacheKey, currentUser }) => {
        if (!currentUser) {
          return null;
        }
        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id,
            currentUser.id
          );
        return organizationMembership?.membershipState == "active"
          ? organization?.freeDiskSpaceBytes ?? null
          : null;
      }
    ),
    diskSpaceLimitBytes: runWithHooks(
      () => [this.organizationMemberLoader],
      async (organization, _, { cacheKey, currentUser }) => {
        if (!currentUser) {
          return null;
        }
        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id,
            currentUser.id
          );
        return organizationMembership?.membershipState == "active"
          ? organization?.diskSpaceLimitBytes ?? null
          : null;
      }
    ),
    utilizedDiskSpaceBytes: runWithHooks(
      () => [this.organizationMemberLoader],
      async (organization, _, { cacheKey, currentUser }) => {
        if (!currentUser) {
          return null;
        }
        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id,
            currentUser.id
          );
        return organizationMembership?.membershipState == "active"
          ? organization?.utilizedDiskSpaceBytes ?? null
          : null;
      }
    ),
    invitationsSentCount: runWithHooks(
      () => [
        this.organizationMemberPermissionsLoader,
        this.organizationSentInvitationsCountLoader,
      ],
      async (organization, _, { currentUser, cacheKey }) => {
        if (!currentUser) {
          return null;
        }
        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id as string,
            currentUser.id
          );
        if (organizationMembership?.membershipState != "active") {
          return null;
        }
        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          organizationMembership.id
        );
        if (!permissions.canModifyInvites && !permissions.canInviteMembers) {
          return null;
        }
        const invitationCount =
          this.requestCache.getOrganizationSentInvitationsCount(
            cacheKey,
            organization.id as string
          );
        return invitationCount ?? null;
      }
    ),
    membersActiveCount: runWithHooks(
      () => [
        this.organizationMemberPermissionsLoader,
        this.organizationActiveMemberCountLoader,
      ],
      async (organization, _, { currentUser, cacheKey }) => {
        if (!currentUser) {
          return null;
        }
        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id as string,
            currentUser.id
          );
        if (organizationMembership?.membershipState != "active") {
          return null;
        }
        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          organizationMembership.id
        );
        if (!permissions.canModifyOrganizationMembers) {
          return null;
        }
        const activeMemberCount =
          this.requestCache.getOrganizationActiveMemberCount(
            cacheKey,
            organization.id as string
          );
        return activeMemberCount ?? null;
      }
    ),
    remainingSeats: runWithHooks(
      () => [
        this.organizationMemberPermissionsLoader,
        this.organizationActiveMemberCountLoader,
        this.organizationSentInvitationsCountLoader,
      ],
      async (organization, _, { currentUser, cacheKey }) => {
        if (!currentUser) {
          return null;
        }
        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id as string,
            currentUser.id
          );
        if (organizationMembership?.membershipState != "active") {
          return null;
        }
        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          organizationMembership.id
        );

        if (
          !permissions.canModifyInvites &&
          !permissions.canInviteMembers &&
          !permissions.canModifyOrganizationMembers
        ) {
          return null;
        }
        const invitationCount =
          this.requestCache.getOrganizationSentInvitationsCount(
            cacheKey,
            organization.id as string
          );
        if (invitationCount === null) {
          return null;
        }
        const activeMemberCount =
          this.requestCache.getOrganizationActiveMemberCount(
            cacheKey,
            organization.id as string
          );
        if (activeMemberCount === null) {
          return null;
        }
        return Math.max(
          ((organization as Organization).freeSeats ?? 0) -
            (activeMemberCount + invitationCount),
          0
        ) as number;
      }
    ),
    legalName: runWithHooks(
      () => [this.organizationMemberLoader],
      async (organization, _, { currentUser, cacheKey }) => {
        if (!currentUser) {
          return null;
        }
        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id,
            currentUser.id
          );
        return organizationMembership?.membershipState == "active"
          ? organization.legalName
          : null;
      }
    ),
    contactEmail: runWithHooks(
      () => [this.organizationMemberLoader],
      async (organization, _, { currentUser, cacheKey }) => {
        if (!currentUser) {
          return null;
        }
        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id,
            currentUser.id
          );
        return organizationMembership?.membershipState == "active"
          ? organization.contactEmail
          : null;
      }
    ),
    membership: runWithHooks(
      () => [this.organizationMemberLoader],
      async (organization, _, { currentUser, cacheKey }) => {
        if (!currentUser) {
          return null;
        }
        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id,
            currentUser.id
          );
        return organizationMembership?.membershipState == "active"
          ? organizationMembership
          : null;
      }
    ),
    roles: runWithHooks(
      () => [this.organizationRolesLoader],
      async (organization, _, { cacheKey }) => {
        return (
          this.requestCache.getOrganizationRoles(
            cacheKey,
            organization.id as string
          ) ?? null
        );
      }
    ),
    members: runWithHooks(
      () => [this.organizationMemberLoader],
      async (organization, _, { cacheKey, currentUser }) => {
        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id,
            currentUser.id
          );
        if (organizationMembership?.membershipState != "active") {
          return null;
        }
        const cachedMembers = this.requestCache.getOrganizationMembers(
          cacheKey,
          organization.id as string
        );
        if (cachedMembers) {
          return cachedMembers;
        }
        const organanizationMembersContext =
          await this.contextFactory.createContext(OrganizationMembersContext);
        const members =
          await organanizationMembersContext.getAllMembersForOrganization(
            organization.id as string
          );
        members.forEach((member: OrganizationMember) => {
          const roles = member.organizationMemberRoles
            ?.filter((memberRole) => {
              return memberRole.organizationMemberId == member.id;
            })
            ?.map((memberRole) => {
              return memberRole?.organizationRole;
            });
          this.requestCache.setOrganizationMembership(
            cacheKey,
            organization as Organization,
            member.user as User,
            member
          );
          this.requestCache.setMembershipRoles(
            cacheKey,
            member,
            roles as OrganizationRole[]
          );
        });
        this.requestCache.setOrganizationMembers(
          cacheKey,
          organization,
          members
        );
        return members;
      }
    ),
    invitations: runWithHooks(
      () => [this.organizationMemberPermissionsLoader],
      async (organization, _, { currentUser, cacheKey }) => {
        if (!currentUser) {
          return null;
        }
        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id as string,
            currentUser.id
          );
        if (organizationMembership?.membershipState != "active") {
          return null;
        }
        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          organizationMembership.id
        );
        if (!permissions.canModifyInvites) {
          return null;
        }
        const cachedInvitations = this.requestCache.getOrganizationInvitations(
          cacheKey,
          organization.id as string
        );
        if (cachedInvitations) {
          return cachedInvitations;
        }
        const organanizationInvitationsContext =
          await this.contextFactory.createContext(
            OrganizationInvitationsContext
          );
        const invitations =
          await organanizationInvitationsContext.getAllInvitationsForOrganization(
            organization.id as string
          );
        this.requestCache.setOrganizationInvitations(
          cacheKey,
          organization as Organization,
          invitations
        );
        invitations.forEach((invitation) => {
          const roles =
            invitation?.organizationInvitationRoles
              ?.filter(
                (invitationRole) =>
                  invitationRole?.organizationInvitationId == invitation.id
              )
              ?.map?.((invitationRole) => invitationRole?.organizationRole)
              ?.filter((v) => v != undefined) ?? [];
          this.requestCache.setOrganizationInvitationRoles(
            cacheKey,
            invitation,
            roles as OrganizationRole[]
          );
        });
        return invitations;
      }
    ),
    publicRepositories: async (organization, _, { cacheKey }) => {
      const cachedPublicRepos = this.requestCache.getOrganizationPublicRepos(
        cacheKey,
        organization.id as string
      );
      if (cachedPublicRepos) {
        return cachedPublicRepos as Repository[];
      }
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const publicRepos = await repositoriesContext.getOrgReposByType(
        organization.id as string,
        false
      );
      this.requestCache.setOrganizationPublicRepos(
        cacheKey,
        organization as Organization,
        publicRepos
      );
      return publicRepos as Repository[];
    },
    privateRepositories: runWithHooks(
      () => [this.organizationMemberLoader],
      async (organization, _, { cacheKey, currentUser }) => {
        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id,
            currentUser.id
          );
        if (organizationMembership?.membershipState != "active") {
          return null;
        }
        const cachedPrivateRepos =
          this.requestCache.getOrganizationPrivateRepos(
            cacheKey,
            organization.id as string
          );
        if (cachedPrivateRepos) {
          return cachedPrivateRepos as Repository[];
        }
        const repositoriesContext = await this.contextFactory.createContext(
          RepositoriesContext
        );
        const privateRepos = await repositoriesContext.getOrgReposByType(
          organization.id as string,
          true
        );
        this.requestCache.setOrganizationPrivateRepos(
          cacheKey,
          organization as Organization,
          privateRepos
        );
        return privateRepos as Repository[];
      }
    ),
    publicPlugins: runWithHooks(
      () => [this.organizationMemberLoader],
      async (organization, _, { cacheKey, currentUser }) => {
        const cachedPublicPlugins = this.requestCache.getOrgPublicPlugins(
          cacheKey,
          organization.id as string
        );
        if (cachedPublicPlugins) {
          return cachedPublicPlugins;
        }

        const pluginsContext = await this.contextFactory.createContext(
          PluginsContext
        );
        const publicPlugins = await pluginsContext.getOrgPluginsByType(
          organization?.id as string,
          false
        );
        this.requestCache.setOrgPublicPlugins(
          cacheKey,
          organization as Organization,
          publicPlugins
        );
        return publicPlugins;
      }
    ),
    privatePlugins: runWithHooks(
      () => [this.organizationMemberLoader],
      async (organization, _, { cacheKey, currentUser }) => {
        const cachedPrivatePlugins = this.requestCache.getOrgPrivatePlugins(
          cacheKey,
          organization.id as string
        );
        if (cachedPrivatePlugins) {
          return cachedPrivatePlugins;
        }

        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id,
            currentUser.id
          );
        if (organizationMembership?.membershipState != "active") {
          return null;
        }

        const pluginsContext = await this.contextFactory.createContext(
          PluginsContext
        );
        const privatePlugins = await pluginsContext.getOrgPluginsByType(
          organization?.id as string,
          true
        );
        this.requestCache.setOrgPrivatePlugins(
          cacheKey,
          organization as Organization,
          privatePlugins
        );
        return privatePlugins;
      }
    ),
    pluginCount: runWithHooks(
      () => [this.organizationMemberLoader],
      async (organization, _, { cacheKey, currentUser }) => {
        const cachedPluginCount = this.requestCache.getOrgPluginCount(
          cacheKey,
          organization.id as string
        );
        if (cachedPluginCount !== undefined) {
          return cachedPluginCount;
        }
        const pluginsContext = await this.contextFactory.createContext(
          PluginsContext
        );
        const publicCount = await pluginsContext.getOrgPluginCountType(
          organization?.id as string,
          false
        );

        const organizationMembership =
          this.requestCache.getOrganizationMembership(
            cacheKey,
            organization.id,
            currentUser.id
          );
        if (organizationMembership?.membershipState != "active") {
          this.requestCache.setOrgPluginCount(
            cacheKey,
            organization,
            publicCount
          );
          return publicCount;
        }
        const privateCount = await pluginsContext.getOrgPluginCountType(
          organization?.id as string,
          true
        );
        this.requestCache.setOrgPluginCount(
          cacheKey,
          organization,
          privateCount + publicCount
        );
        return privateCount + publicCount;
      }
    ),
  };

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
        { currentUser, cacheKey }: { currentUser: User; cacheKey: string }
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
            this.requestCache.setOrganization(
              cacheKey,
              result.organization as Organization
            );
            return {
              __typename: "CreateOrganizationSuccess",
              organization: result.organization,
              user: currentUser,
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
    updateOrganizationName: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _,
        {
          organizationId,
          name,
          legalName,
        }: main.MutationUpdateOrganizationNameArgs,
        { cacheKey, currentUser }
      ) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          organizationId
        );
        if (!organization) {
          return {
            __typename: "UpdateOrganizationNameError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const currentMember = this.requestCache.getOrganizationMembership(
          cacheKey,
          organizationId,
          currentUser.id
        );
        if (!currentMember?.id) {
          return {
            __typename: "UpdateOrganizationNameError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          currentMember.id
        );
        if (!permissions) {
          return {
            __typename: "UpdateOrganizationNameError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result = await this.organizaionService.updateOrgName(
          organization,
          name,
          legalName
        );
        if (result.action == "UPDATE_ORGANIZATION_NAME_SUCCEEDED") {
          this.requestCache.setOrganization(
            cacheKey,
            result.organization as Organization
          );
          return {
            __typename: "UpdateOrganizationNameSuccess",
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
          __typename: "UpdateOrganizationNameError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
  };

  public Query: main.QueryResolvers = {
    organization: async (_, { id }, { cacheKey }) => {
      const organization = await this.organizaionService.fetchOrganization(id);
      if (organization) {
        this.requestCache.setOrganization(cacheKey, organization);
      }
      return organization;
    },
    organizationByHandle: async (_, { handle }, { cacheKey }) => {
      const organization =
        await this.organizaionService.fetchOrganizationByHandle(handle);
      if (organization) {
        this.requestCache.setOrganization(cacheKey, organization);
      }
      return organization;
    },
  };
}
