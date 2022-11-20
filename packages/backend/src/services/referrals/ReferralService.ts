import { injectable, inject } from "inversify";

import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import { User } from "@floro/database/src/entities/User";
import { Organization } from "@floro/database/src/entities/Organization";
import { OrganizationRole } from "@floro/database/src/entities/OrganizationRole";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import CreateUserEventHandler from "../events/CreateUserEventHandler";
import { UserAuthCredential } from "@floro/graphql-schemas/build/generated/main-graphql";
import { QueryRunner } from "typeorm";

@injectable()
export default class ReferralService implements CreateUserEventHandler {
  private contextFactory!: ContextFactory;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    this.contextFactory = contextFactory;
  }
  public async  onUserCreated(queryRunner: QueryRunner, user: User, userAuthCredential: UserAuthCredential): Promise<void> {
    //throw new Error("Method not implemented.");
  }

  public async createReferral() {
    return null;
  }

  public async resendReferral() {
    return null;
  }

  public async claimReferral() {
    return null;
  }
}