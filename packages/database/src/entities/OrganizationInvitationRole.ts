
import {
  IsDefined,
} from "class-validator";
import { Entity, Column, ManyToOne, JoinColumn, Relation } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Organization } from "./Organization";
import { OrganizationInvitation } from "./OrganizationInvitation";
import { OrganizationRole } from "./OrganizationRole";
import { User } from "./User";

@Entity("organization_invitation_roles")
export class OrganizationInvitationRole extends BinaryPKBaseEntity {
  @Column("uuid")
  @IsDefined()
  organizationId!: string;

  @ManyToOne("Organization", "organizationInvitationRoles")
  @JoinColumn()
  organization?: Relation<Organization>;

  @Column("uuid")
  @IsDefined()
  userId!: string;

  @ManyToOne("User", "organizationInvitationRoles")
  @JoinColumn()
  user?: Relation<User>;

  @Column("uuid")
  @IsDefined()
  organizationInvitationId!: string;

  @ManyToOne("OrganizationInvitation", "organizationInvitationRoles")
  @JoinColumn()
  organizationInvitation?: Relation<OrganizationInvitation>;

  @Column("uuid")
  @IsDefined()
  organizationRoleId!: string;

  @ManyToOne("OrganizationRole", "organizationInvitationRoles")
  @JoinColumn()
  organizationRole?: Relation<OrganizationRole>;
}
