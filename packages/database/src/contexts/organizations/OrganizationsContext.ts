import { DeepPartial, In, QueryRunner, Raw, Repository } from "typeorm";
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
    return await this.queryRunner.manager.findOne(Organization, {
      where: { id },
      relations: { profilePhoto: true },
    });
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
    const userOrgs = await this.queryRunner.manager.find(Organization, {
      where: {
        organizationMembers: {
          userId,
          membershipState: "active",
        }
      }
    });
    const ids = userOrgs?.map(org => org.id) ?? [];
    return await this.queryRunner.manager.find(Organization, {
      where: {
        id: In(ids),
        privateRepositories: {
          isPrivate: true,
        },
        publicRepositories: {
          isPrivate: false,
        }
      },
      relations: {
        profilePhoto: true,
        publicRepositories: true,
        privateRepositories: true,
        organizationInvitations: {
          user: {
            profilePhoto: true
          },
          invitedByUser: true,
          invitedByOrganizationMember: true,
          organizationInvitationRoles: {
            organizationRole: true,
          },
        },
        organizationMembers: {
          user: {
            profilePhoto: true
          }
        },
        organizationRoles: true,
        organizationMemberRoles: {
          organizationRole: true,
          organizationMember: {
            user: {
              profilePhoto: true
            }
          }
        }
      },
      order: {
        name: "ASC",
        publicRepositories: {
          createdAt: 'DESC'
        },
        privateRepositories: {
          createdAt: 'DESC'
        },
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
        },
        organizationInvitations: {
          createdAt: "DESC",
          organizationInvitationRoles: {
            organizationRole: {
              name: "ASC",
            },
          },
        }
      }
    }); 
  }
}
