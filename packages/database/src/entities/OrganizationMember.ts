import {
  IsDefined,
  IsIn,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Relation,
  OneToMany,
  ManyToMany,
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Organization } from "./Organization";
import { OrganizationDailyActivatedMember } from "./OrganizationDailyActivatedMember";
import { OrganizationInvitation } from "./OrganizationInvitation";
import { OrganizationMemberRole } from "./OrganizationMemberRole";
import { OrganizationRole } from "./OrganizationRole";
import { User } from "./User";

@Entity("organization_members")
export class OrganizationMember extends BinaryPKBaseEntity {
  @Column("varchar", { length: 255, nullable: true })
  @MinLength(1)
  @MaxLength(30)
  @ValidateIf((_object, value) => !!value)
  internalHandle?: string;

  @Column("varchar")
  @IsDefined()
  @IsIn(["active", "inactive"])
  @IsString()
  membershipState?: string;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "user")
  @JoinColumn()
  user?: Relation<User>;

  @Column("uuid")
  organizationId!: string;

  @ManyToOne("Organization", "organizationMembers")
  @JoinColumn()
  organization?: Relation<Organization>;

  @OneToMany("OrganizationRole", "createdByOrganizationMember")
  createdOrganizationRoles?: Relation<OrganizationRole>[];

  @OneToMany("OrganizationRole", "invitedByOrganizationMember")
  sentOrganizationInvitations?: Relation<OrganizationInvitation>[];

  @OneToMany("OrganizationMemberRole", "organizationMember")
  organizationMemberRoles?: Relation<OrganizationMemberRole>[];

  @OneToMany("OrganizationInvitationRole", "organizationMember")
  organizationDailyActivatedMembers?: Relation<OrganizationDailyActivatedMember>[];
}