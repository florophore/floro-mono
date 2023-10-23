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
  public async getByHandle(handle: string): Promise<Organization | null> {
    const qb = this.organizationRepo.createQueryBuilder(
      "org",
      this.queryRunner
    );
    return await qb
      .where("LOWER(org.handle) = :handle")
      .setParameter("handle", handle.trim().toLowerCase())
      .getOne();
  }

  public async handleExists(handle: string): Promise<boolean> {
    const qb = this.organizationRepo.createQueryBuilder(
      "org",
      this.queryRunner
    );
    const count = await qb
      .where("LOWER(org.handle) = :handle")
      .setParameter("handle", handle.trim().toLowerCase())
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

  public async getAllOrganizationsForUser(
    userId: string
  ): Promise<Organization[]> {
    const userOrgs = await this.queryRunner.manager.find(Organization, {
      where: {
        organizationMembers: {
          userId,
          membershipState: "active",
        },
      },
    });
    const ids = userOrgs?.map((org) => org.id) ?? [];
    return await this.queryRunner.manager.find(Organization, {
      where: {
        id: In(ids),
      },
      relations: {
        profilePhoto: true,
        organizationInvitations: {
          user: {
            profilePhoto: true,
          },
          invitedByUser: true,
          invitedByOrganizationMember: true,
          organizationInvitationRoles: {
            organizationRole: true,
          },
        },
        organizationMembers: {
          user: {
            profilePhoto: true,
          },
        },
        organizationRoles: true,
        organizationMemberRoles: {
          organizationRole: true,
          organizationMember: {
            user: {
              profilePhoto: true,
            },
          },
        },
      },
      order: {
        name: "ASC",
        organizationMembers: {
          user: {
            firstName: "ASC",
            lastName: "DESC",
          },
        },
        organizationRoles: {
          name: "ASC",
        },
        organizationMemberRoles: {
          organizationRole: {
            name: "ASC",
          },
        },
        organizationInvitations: {
          createdAt: "DESC",
          organizationInvitationRoles: {
            organizationRole: {
              name: "ASC",
            },
          },
        },
      },
    });
  }

  public async searchOrganizations(
    query: string,
    limit = 5
  ): Promise<Organization[]> {
    try {
      const qb = this.organizationRepo.createQueryBuilder("organization", this.queryRunner);
      if (query.startsWith("@")) {
        if (query == "@") {
          return [];
        }
        const handleQuery = query.substring(1);
        return await qb
          .leftJoinAndSelect("organization.profilePhoto", "photo")
          .where("organization.handle ILIKE :query || '%'")
          .setParameter("query", handleQuery.trim().toLowerCase())
          .limit(limit)
          .orderBy("LENGTH(organization.handle)", "ASC")
          .getMany();
      }
      return await qb
        .leftJoinAndSelect("organization.profilePhoto", "photo")
        .where(
          `(organization.name ILIKE :query || '%') OR (organization.handle ILIKE :query || '%')`
        )
        .setParameter("query", query.trim().toLowerCase())
        .limit(limit)
        .orderBy(`LENGTH(organization.name)`, "ASC")
        .getMany();
    } catch (e) {
      return [];
    }
  }
}
