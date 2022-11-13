import BaseResolverModule from "../BaseResolverModule";
import { main } from '@floro/graphql-schemas'; 
import { inject, injectable } from "inversify";
import { User } from "@floro/database/src/entities/User";
import { UsernameCheckResult } from "@floro/graphql-schemas/src/generated/main-graphql";
import UsersService from "../../services/users/UsersService";
import { USERNAME_REGEX } from '@floro/common-web/src/utils/validators';
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import RequestCache from "../../request/RequestCache";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import { OrganizationRole } from "@floro/database/src/entities/OrganizationRole";

@injectable()
export default class UsersResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this&keyof main.ResolversTypes> = ["Query", "User"];
  protected usersService!: UsersService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;


  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(UsersService) usersService: UsersService
  ) {
    super();
    this.contextFactory = contextFactory;
    this.usersService = usersService;
    this.requestCache = requestCache;
  }

  public Query: main.QueryResolvers = {
    user: async (_root, { id }) => {
      const usersContext = await this.contextFactory.createContext(UsersContext);
      return await usersContext.getById(id);
    },
    usernameCheck: async(_root, { username }): Promise<UsernameCheckResult> => {
      if (!username || username == "" || !USERNAME_REGEX.test(username)) {
        return {
          __typename: "UsernameCheckResult",
          exists: false,
          username: username ?? ""
        };
      }
      const exists = await this.usersService.checkUsernameIsTaken(username ?? "");
        return {
          __typename: "UsernameCheckResult",
          exists,
          username: username
        };
    }
  };

  public User: main.UserResolvers = {
    organizations: async (user, _, { currentUser, cacheKey }) => {
      if (user.id != currentUser.id) {
        return null;
      }
      const cachedOrganizations = this.requestCache.getUserOrganizations(cacheKey, user.id as string);
      if (cachedOrganizations) {
        return cachedOrganizations;
      }
      const organizationsContext = await this.contextFactory.createContext(OrganizationsContext);
      const organizations = await organizationsContext.getAllOrganizationsForUser(user.id as string);
      organizations.forEach((organization) => {
        this.requestCache.setOrganization(cacheKey, organization);
        this.requestCache.setOrganizationRoles(cacheKey, organization, organization.organizationRoles as OrganizationRole[]);
        this.requestCache.setOrganizationMembers(cacheKey, organization, organization.organizationMembers as OrganizationMember[]);
        const roles = organization.organizationMemberRoles?.map(memberRole => {
          this.requestCache.setOrganizationMembership(cacheKey, organization, user as User, memberRole.organizationMember as OrganizationMember);
          return memberRole.organizationRole;
        });
        const membership = this.requestCache.getOrganizationMembership(cacheKey, organization.id, user.id as string);
        this.requestCache.setMembershipRoles(cacheKey, membership, roles as OrganizationRole[]);
      });
      this.requestCache.setUserOrganizations(cacheKey, user as User, organizations);
      return organizations;
    }
  }
}