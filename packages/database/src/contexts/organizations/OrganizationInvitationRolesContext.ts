import { DeepPartial, QueryRunner, Raw, Repository } from "typeorm";
import { OrganizationInvitation } from "../../entities/OrganizationInvitation";
import { OrganizationInvitationRole } from "../../entities/OrganizationInvitationRole";
import { OrganizationRole } from "../../entities/OrganizationRole";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class OrganizationInvitationRolesContext extends BaseContext {
  private organizationInvitationRoleRepo!: Repository<OrganizationInvitationRole>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.organizationInvitationRoleRepo =
      this.conn.datasource.getRepository(OrganizationInvitationRole);
  }

  public async createOrganizationRole(
    orgInvitationRoleArgs: DeepPartial<OrganizationInvitationRole>
  ): Promise<OrganizationInvitationRole> {
    const orgInvitationRoleEntity = this.organizationInvitationRoleRepo.create(orgInvitationRoleArgs);
    return await this.queryRunner.manager.save(orgInvitationRoleEntity);
  }

  public async getById(id: string): Promise<OrganizationInvitationRole | null> {
    return await this.queryRunner.manager.findOneBy(OrganizationInvitationRole, { id });
  }

  public async getByInvitationId(organizationInvitationId: string) {
    return await this.queryRunner.manager.findBy(OrganizationInvitationRole, {
        organizationInvitationId
    });
  }

  public async getRolesByInvitation(organizationInvitation: OrganizationInvitation): Promise<OrganizationRole[]> {
    const results = await this.queryRunner.manager.find(OrganizationInvitationRole, {
      where: {
        organizationInvitationId: organizationInvitation.id
      },
      relations: {
        organizationRole: true
      }
    });
    return results.map(organizationInvitationRole => {
      return organizationInvitationRole.organizationRole as OrganizationRole;
    });
  }

  public async deleteRolesForInvitation(organizationInvitation: OrganizationInvitation): Promise<void> {
    await this.queryRunner.manager.delete(OrganizationInvitationRole, {
      organizationInvitationId: organizationInvitation.id
    });
  }
}