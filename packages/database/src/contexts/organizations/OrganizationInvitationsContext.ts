import { DeepPartial, QueryRunner, Repository } from "typeorm";
import { Organization } from "../../entities/Organization";
import { OrganizationInvitation } from "../../entities/OrganizationInvitation";
import { OrganizationMember } from "../../entities/OrganizationMember";
import { User } from "../../entities/User";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";

export default class OrganizationInvitationsContext extends BaseContext {
  private organizationInvitationRepo!: Repository<OrganizationInvitation>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.organizationInvitationRepo = this.conn.datasource.getRepository(
      OrganizationInvitation
    );
  }

  public async createOrganizationInvitation(
    orgInvitationArgs: DeepPartial<OrganizationInvitation> & {
      invitationState: "sent";
    }
  ): Promise<OrganizationInvitation> {
    const orgInvitationEntity =
      this.organizationInvitationRepo.create(orgInvitationArgs);
    return await this.queryRunner.manager.save(orgInvitationEntity);
  }

  public async getById(id: string): Promise<OrganizationInvitation | null> {
    return await this.queryRunner.manager.findOneBy(OrganizationInvitation, {
      id,
    });
  }

  public async getByOrgIdAndUserId(
    organizationId: string,
    userId: string
  ): Promise<OrganizationInvitation | null> {
    return await this.queryRunner.manager.findOneBy(OrganizationInvitation, {
      organizationId,
      userId,
    });
  }

  public async getByOrgAndUser(
    org: Organization,
    user: User
  ): Promise<OrganizationInvitation | null> {
    return this.getByOrgIdAndUserId(org.id, user.id);
  }

  public async inviteExistsForEmailWithOrg(
    organizationId: string,
    emailHash: string
  ): Promise<boolean> {
    const [, count] = await this.queryRunner.manager.findAndCountBy(
      OrganizationInvitation,
      {
        organizationId,
        emailHash,
      }
    );
    return count > 0;
  }

  public async acceptInvite(
    orgInvite: OrganizationInvitation
  ): Promise<OrganizationInvitation | null> {
    return this.updateOrganizationInvitationById(orgInvite.id, {
      invitationState: "accepted",
    });
  }

  public async rejectInvite(
    orgInvite: OrganizationInvitation
  ): Promise<OrganizationInvitation | null> {
    return this.updateOrganizationInvitationById(orgInvite.id, {
      invitationState: "rejected",
    });
  }

  public async cancelInvite(
    orgInvite: OrganizationInvitation
  ): Promise<OrganizationInvitation | null> {
    return this.updateOrganizationInvitationById(orgInvite.id, {
      invitationState: "canceled",
    });
  }

  public async updateOrganizationInvitationById(
    id: string,
    orgInvitationArgs: DeepPartial<OrganizationInvitation>
  ): Promise<OrganizationInvitation | null> {
    const orgInvitation = await this.getById(id);
    if (orgInvitation === null) {
      throw new Error(
        "Invalid ID to update for OrganizationInvitation.id: " + id
      );
    }
    for (const prop in orgInvitationArgs) {
      orgInvitation[prop] = orgInvitationArgs[prop];
    }
    return await this.queryRunner.manager.save(
      OrganizationInvitation,
      orgInvitation
    );
  }
  public async getAllInvitationsForOrganization(
    organizationId: string
  ): Promise<OrganizationInvitation[]> {
    return await this.queryRunner.manager.find(OrganizationInvitation, {
      where: {
        organizationId,
        invitationState: "sent",
      },
      relations: {
        user: true,
        invitedByUser: true,
        invitedByOrganizationMember: true,
        organizationInvitationRoles: {
          organizationRole: true,
        },
      },
      order: {
        createdAt: "DESC",
        organizationInvitationRoles: {
          organizationRole: {
            name: "ASC",
          },
        },
      },
    });
  }

  public async getSentInvitationCountForOrganization(
    organizationId: string
  ): Promise<number> {
    const [, count] = await this.queryRunner.manager.findAndCountBy(OrganizationInvitation, {
      organizationId,
      invitationState: "sent",
    });
    return count ?? 0;
  }

  public async getInvitationsForEmailHash(
    emailHash: string
  ): Promise<OrganizationInvitation[]> {
    return await this.queryRunner.manager.findBy(
      OrganizationInvitation,
      {
        emailHash,
      }
    );
  }
}
