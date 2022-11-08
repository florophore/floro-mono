import { IsDefined } from "class-validator";
import { Entity, Column, ManyToOne, JoinColumn, Relation } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Organization } from "./Organization";
import { OrganizationMember } from "./OrganizationMember";
import { OrganizationRole } from "./OrganizationRole";

@Entity("organization_member_roles")
export class OrganizationMemberRole extends BinaryPKBaseEntity {
  @Column("uuid")
  @IsDefined()
  organizationId!: string;

  @ManyToOne("Organization", "organizationMemberRoles")
  @JoinColumn()
  organization?: Relation<Organization>;

  @Column("uuid")
  @IsDefined()
  organizationMemberId!: string;

  @ManyToOne("OrganizationMember", "organizationMemberRoles")
  @JoinColumn()
  organizationMember?: Relation<OrganizationMember>;

  @Column("uuid")
  @IsDefined()
  organizationRoleId!: string;

  @ManyToOne("OrganizationRole", "organizationMemberRoles")
  @JoinColumn()
  organizationRole?: Relation<OrganizationRole>;
}
