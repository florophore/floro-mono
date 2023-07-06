import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { Organization } from "../../entities/Organization";
import { OrganizationMember } from "../../entities/OrganizationMember";
import { User } from "../../entities/User";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class OrganizationMembersContext extends BaseContext {
  private organizationMemberRepo!: Repository<OrganizationMember>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.organizationMemberRepo =
      this.conn.datasource.getRepository(OrganizationMember);
  }

  public async createOrganizationMember(
    orgMemberArgs: DeepPartial<
      OrganizationMember
    > & { membershipState: "active" }
  ): Promise<OrganizationMember> {
    const orgMemberEntity = this.organizationMemberRepo.create(orgMemberArgs);
    return await this.queryRunner.manager.save(orgMemberEntity);
  }

  public async getById(id: string): Promise<OrganizationMember | null> {
    return await this.queryRunner.manager.findOne(OrganizationMember, { where: { id }, relations: { user: true} });
  }

  public async getByOrgIdAndUserId(
    organizationId: string,
    userId: string
  ): Promise<OrganizationMember | null> {
    return await this.queryRunner.manager.findOne(OrganizationMember, {
      where: {
        organizationId,
        userId,
      },
      relations: {
        user: {
          profilePhoto: true
        },
      }
    });
  }

  public async getByOrgAndUser(
    org: Organization,
    user: User
  ): Promise<OrganizationMember | null> {
    return this.getByOrgIdAndUserId(org.id, user.id);
  }

  public async getAllMembersForOrganization(organizationId: string): Promise<OrganizationMember[]> {
    return await this.queryRunner.manager.find(OrganizationMember, {
      where: {
        organizationId
      },
      relations: {
        user: {
          profilePhoto: true
        },
        organizationMemberRoles: {
          organizationRole: true
        }
      },
      order: {
        user: {
          firstName: 'ASC',
          lastName: 'ASC'
        },
        organizationMemberRoles: {
          organizationRole: {
            name: 'ASC'
          }
        }
      }
    });
  }

  public async getMemberCountForOrganization(
    organizationId: string
  ): Promise<number> {
    const [, count] = await this.queryRunner.manager.findAndCountBy(OrganizationMember, {
      organizationId,
    });
    return count ?? 0;
  }

  public async getActiveMemeberCountForOrganization(
    organizationId: string
  ): Promise<number> {
    const [, count] = await this.queryRunner.manager.findAndCountBy(OrganizationMember, {
      organizationId,
      membershipState: "active"
    });
    return count ?? 0;
  }

  public async userExistsInOrgMembers(
    org: Organization,
    user: User
  ): Promise<boolean> {
    const [, count] = await this.queryRunner.manager.findAndCountBy(
      OrganizationMember,
      { organizationId: org.id, userId: user.id }
    );
    return count > 0;
  }

  public async internalHandleAvailable(
    org: Organization,
    internalHandle: string
  ): Promise<boolean> {
    if (
      org.handle?.trim().toLowerCase() == internalHandle.trim().toLowerCase()
    ) {
      return false;
    }
    const qb = this.organizationMemberRepo.createQueryBuilder(
      "organization_member",
      this.queryRunner
    );
    const count = await qb
      .where("LOWER(organization_member.internal_handle) = :internal_handle")
      .where("organization_member.organization_id = :org_id")
      .setParameter("internal_handle", internalHandle.trim().toLowerCase())
      .setParameter("org_id", org.id)
      .getCount();
    return count > 0;
  }

  private async canUpdateInternalHandle(
    org: Organization,
    orgMember: OrganizationMember,
    internalHandle: string
  ): Promise<boolean> {
    if (
      org.handle?.trim().toLowerCase() == internalHandle.trim().toLowerCase()
    ) {
      return false;
    }
    const qb = this.organizationMemberRepo.createQueryBuilder(
      "organization_member",
      this.queryRunner
    );
    const count = await qb
      .where("LOWER(organization_member.internal_handle) = :internal_handle")
      .where("organization_member.organization_id = :org_id")
      .where("organization_member.id != :org_member_id")
      .setParameter("internal_handle", internalHandle.trim().toLowerCase())
      .setParameter("org_id", org.id)
      .setParameter("org_member_id", orgMember.id)
      .getCount();
    return count > 0;
  }

  public async updateInternalHandle(
    org: Organization,
    orgMember: OrganizationMember,
    internalHandle: string
  ): Promise<OrganizationMember | null> {
    if (!this.canUpdateInternalHandle(org, orgMember, internalHandle))
      return null;

    return this.updateOrganizationMemberById(orgMember.id, {
      internalHandle: internalHandle.trim(),
    });
  }
  public async unassignInternalHandle(
    orgMember: OrganizationMember
  ): Promise<OrganizationMember | null> {
    return this.updateOrganizationMemberById(orgMember.id, {
      internalHandle: undefined,
    });
  }

  public async deactivateMembership(
    orgMember: OrganizationMember
  ): Promise<OrganizationMember | null> {
    return this.updateOrganizationMemberById(orgMember.id, {
      membershipState: "inactive",
    });
  }

  public async reactivateMembership(
    orgMember: OrganizationMember
  ): Promise<OrganizationMember | null> {
    return this.updateOrganizationMemberById(orgMember.id, {
      membershipState: "active",
    });
  }

  private async updateOrganizationMemberById(
    id: string,
    orgMemberArgs: DeepPartial<OrganizationMember>
  ): Promise<OrganizationMember | null> {
    const orgMember = await this.getById(id);
    if (orgMember === null) {
      throw new Error("Invalid ID to update for OrganizationMember.id: " + id);
    }
    for (const prop in orgMemberArgs) {
      orgMember[prop] = orgMemberArgs[prop];
    }
    return await this.queryRunner.manager.save(OrganizationMember, orgMember);
  }
}
