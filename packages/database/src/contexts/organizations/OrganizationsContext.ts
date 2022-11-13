import { DeepPartial, QueryRunner, Raw, Repository } from "typeorm";
import { Organization } from "../../entities/Organization";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class OrganizationsContext extends BaseContext {
  private organizationRepo!: Repository<Organization>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.organizationRepo = this.conn.datasource.getRepository(Organization);
  }

  public async createOrganization(
    orgArgs: DeepPartial<Organization>
  ): Promise<Organization> {
    const orgEntity = this.organizationRepo.create(orgArgs);
    return await this.queryRunner.manager.save(orgEntity);
  }

  public async getById(id: string): Promise<Organization | null> {
    return await this.queryRunner.manager.findOneBy(Organization, { id });
  }

  public async handleExists(username: string): Promise<boolean> {
    const qb = this.organizationRepo.createQueryBuilder(
      "org",
      this.queryRunner
    );
    const count = await qb
      .where("LOWER(org.handle) = :handle")
      .setParameter("handle", username.trim().toLowerCase())
      .getCount();
    return count > 0;
  }

  public async updateOrganization(
    org: Organization,
    orgArgs: DeepPartial<Organization>
  ): Promise<Organization> {
    return (await this.updateOrganizationById(org.id, orgArgs)) ?? org;
  }

  public async updateOrganizationById(
    id: string,
    orgArgs: DeepPartial<Organization>
  ): Promise<Organization | null> {
    const org = await this.getById(id);
    if (org === null) {
      throw new Error("Invalid ID to update for Organization.id: " + id);
    }
    for (const prop in orgArgs) {
      org[prop] = orgArgs[prop];
    }
    return await this.queryRunner.manager.save(Organization, org);
  }

  public async getAllOrganizationsForUser(userId: string): Promise<Organization[]> {
    return await this.queryRunner.manager.find(Organization, {
      where: {
        organizationMembers: {
          userId,
          membershipState: "active",
        }
      },
      relations: {
        organizationMembers: {
          user: true
        },
        organizationRoles: true,
        organizationMemberRoles: {
          organizationRole: true,
          organizationMember: {
            user: true
          }
        }
      },
      order: {
        name: "ASC",
        organizationMembers: {
          user: {
            firstName: "ASC",
            lastName: "DESC"
          }
        },
        organizationRoles: {
          name: "ASC"
        },
        organizationMemberRoles: {
          organizationRole: {
            name: "ASC"
          }
        }
      }
    }); 
  }
}
