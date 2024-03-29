import { DeepPartial, In, QueryRunner, Repository } from "typeorm";
import { Organization } from "../../entities/Organization";
import { OrganizationMember } from "../../entities/OrganizationMember";
import { OrganizationMemberRole } from "../../entities/OrganizationMemberRole";
import { OrganizationRole } from "../../entities/OrganizationRole";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class OrganizationMemberRolesContext extends BaseContext {
  private organizationMemberRoleRepo!: Repository<OrganizationMemberRole>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.organizationMemberRoleRepo = this.conn.datasource.getRepository(
      OrganizationMemberRole
    );
  }

  public async createOrganizationRole(
    orgMemberRoleArgs: DeepPartial<OrganizationMemberRole>
  ): Promise<OrganizationMemberRole> {
    const orgMemberRoleEntity =
      this.organizationMemberRoleRepo.create(orgMemberRoleArgs);
    return await this.queryRunner.manager.save(orgMemberRoleEntity);
  }

  public async getById(id: string): Promise<OrganizationMemberRole | null> {
    return await this.queryRunner.manager.findOneBy(OrganizationMemberRole, {
      id,
    });
  }

  public async getByRoleAndOrg(
    org: Organization,
    role: OrganizationRole
  ): Promise<OrganizationMemberRole | null> {
    return await this.queryRunner.manager.findOneBy(OrganizationMemberRole, {
      organizationId: org.id,
      organizationRoleId: role.id,
    });
  }
  public async getRolesForOrg(
    org: Organization,
  ): Promise<OrganizationMemberRole[]> {
    return await this.queryRunner.manager.findBy(OrganizationMemberRole, {
      organizationId: org.id
    });
  }

  public async getRolesByMember(
    organizationMember: OrganizationMember
  ): Promise<OrganizationRole[]> {
    return await this.getRolesByMemberId(organizationMember.id);
  }

  public async getRolesByMemberId(
    organizationMemberId: string
  ): Promise<OrganizationRole[]> {
    const joinResults = await this.queryRunner.manager.find(
      OrganizationMemberRole,
      {
        relations: {
          organizationRole: true,
        },
        where: {
          organizationMemberId,
        },
        order: {
          organizationRole: {
            name: "ASC"
          }
        }
      }
    );
    return joinResults
      ?.map(
        (organizationMemberRole) => organizationMemberRole.organizationRole
      )
      ?.filter((result) => result != undefined) as OrganizationRole[];
  }

  public async getEnabledOrganizationMembersForRoleIds(
    organizationId: string,
    roleIds: Array<string>
  ): Promise<OrganizationMember[]> {
    const joinResults = await this.queryRunner.manager.find(
      OrganizationMemberRole,
      {
        where: {
          organizationId,
          organizationRoleId: In(roleIds),
        },
        relations: {
          organizationMember: true,
        }
      }
    );
    return joinResults
      ?.map(
        (organizationMemberRole) => organizationMemberRole.organizationMember
      )
      ?.filter((member) => member?.membershipState == "active") as OrganizationMember[];
  }

  public async deleteRolesForMember(organizationMember: OrganizationMember): Promise<void> {
    await this.queryRunner.manager.delete(OrganizationMemberRole, {
        organizationMemberId: organizationMember.id
    });
  }

  public async deleteRolesByRole(organizationRole: OrganizationRole): Promise<void> {
    await this.queryRunner.manager.delete(OrganizationMemberRole, {
        organizationRoleId: organizationRole.id
    });
  }
}
