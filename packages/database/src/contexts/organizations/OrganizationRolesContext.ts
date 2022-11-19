import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { Organization } from "../../entities/Organization";
import { OrganizationRole } from "../../entities/OrganizationRole";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class OrganizationRolesContext extends BaseContext {
  private organizationRoleRepo!: Repository<OrganizationRole>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.organizationRoleRepo =
      this.conn.datasource.getRepository(OrganizationRole);
  }

  public async createOrganizationRole(
    orgRoleArgs: DeepPartial<OrganizationRole>
  ): Promise<OrganizationRole> {
    const orgRoleEntity = this.organizationRoleRepo.create(orgRoleArgs);
    return await this.queryRunner.manager.save(orgRoleEntity);
  }

  public async getById(id: string): Promise<OrganizationRole | null> {
    return await this.queryRunner.manager.findOneBy(OrganizationRole, { id });
  }

  public async getAllForOrg(organization: Organization) {
    return await this.queryRunner.manager.find(OrganizationRole, {
      where: {
        organizationId: organization.id,
      },
      order: {
        name: "ASC"
      }
    });
  }

  public async updateRole(
    orgRole: OrganizationRole,
    orgRoleArgs: DeepPartial<OrganizationRole>
  ): Promise<OrganizationRole> {
    return (
      (await this.updateOrganizationRoleById(orgRole.id, orgRoleArgs)) ??
      orgRole
    );
  }

  public async updateOrganizationRoleById(
    id: string,
    orgRoleArgs: DeepPartial<OrganizationRole>
  ): Promise<OrganizationRole | null> {
    const orgRole = await this.getById(id);
    if (!orgRole?.isMutable) {
      throw new Error(
        "Cannot update immutable role on OrganizationRole.id: " + id
      );
    }
    if (orgRole === null) {
      throw new Error("Invalid ID to update for OrganizationRole.id: " + id);
    }
    for (const prop in orgRoleArgs) {
      orgRole[prop] = orgRoleArgs[prop];
    }
    return await this.queryRunner.manager.save(OrganizationRole, orgRole);
  }

  public async deleteRole(organizationRole: OrganizationRole): Promise<void> {
    await this.queryRunner.manager.delete(OrganizationRole, {
        id: organizationRole.id
    });
  }
}
