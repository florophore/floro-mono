import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { Organization } from "../../entities/Organization";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { OrganizationDailyActivatedMember } from "../../entities/OrganizationDailyActivatedMember";

export default class OrganizationDailyActivatedMembersContext extends BaseContext {
  private organizationDailyActivatedMemberRepo!: Repository<OrganizationDailyActivatedMember>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.organizationDailyActivatedMemberRepo =
      this.conn.datasource.getRepository(OrganizationDailyActivatedMember);
  }

  public async createOrganizationDailyActivatedMember(
    organizationDailyActivatedMemberArgs: DeepPartial<OrganizationDailyActivatedMember>
  ): Promise<OrganizationDailyActivatedMember> {
    const organizationDailyActivatedMemberEntity =
      this.organizationDailyActivatedMemberRepo.create(
        organizationDailyActivatedMemberArgs
      );
    return await this.queryRunner.manager.save(
      organizationDailyActivatedMemberEntity
    );
  }

  public async getById(id: string): Promise<OrganizationDailyActivatedMember | null> {
    return await this.queryRunner.manager.findOneBy(OrganizationDailyActivatedMember, { id });
  }

  public async getAllForOrg(organization: Organization) {
    return await this.queryRunner.manager.find(OrganizationDailyActivatedMember, {
      where: {
        organizationId: organization.id,
      },
    });
  }

  public async getAllDailyActiveMembersForOrg(organizationId: string, dateString: string): Promise<Array<OrganizationDailyActivatedMember>> {
    return await this.queryRunner.manager.find(OrganizationDailyActivatedMember, {
      where: {
        organizationId,
        date: dateString
      },
    });
  }

  public async dailyActiveMemberAlreadyExists(
    organizationId: string,
    organizationMemberId: string,
    dateString: string
  ): Promise<boolean> {
    const [, count] = await this.queryRunner.manager.findAndCountBy(
      OrganizationDailyActivatedMember,
      { organizationId, organizationMemberId, date: dateString }
    );
    return count > 0;
  }
}
