import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsIn,
  MaxLength,
  MinLength,
} from "class-validator";
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Relation,
  OneToMany,
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { OrganizationDailyActivatedMember } from "./OrganizationDailyActivatedMember";
import { OrganizationInvitation } from "./OrganizationInvitation";
import { OrganizationInvitationRole } from "./OrganizationInvitationRole";
import { OrganizationMember } from "./OrganizationMember";
import { OrganizationMemberRole } from "./OrganizationMemberRole";
import { OrganizationRole } from "./OrganizationRole";
import { User } from "./User";

@Entity("organizations")
export class Organization extends BinaryPKBaseEntity {
  @Column("varchar", { length: 255 })
  @IsDefined()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  @MinLength(2)
  @MaxLength(50)
  legalName!: string;

  @Column("varchar", { length: 255 })
  @MinLength(1)
  @MaxLength(30)
  handle?: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsEmail()
  contactEmail!: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsEmail()
  normalizedContactEmail!: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  contactEmailHash!: string;

  @Column("boolean")
  @IsDefined()
  @IsIn([true])
  @IsBoolean()
  agreedToCustomerServiceAgreement?: boolean;

  @Column("uuid")
  createdByUserId!: string;

  @ManyToOne("User", "createdOrganizations")
  @JoinColumn({ name: "created_by_user_id" })
  createdByUser?: Relation<User>;

  @OneToMany("OrganizationMember", "organization")
  organizationMembers?: Relation<OrganizationMember>[];

  @OneToMany("OrganizationInvitation", "organization")
  organizationInvitations?: Relation<OrganizationInvitation>[];

  @OneToMany("OrganizationRole", "organization")
  organizationRoles?: Relation<OrganizationRole>[];

  @OneToMany("OrganizationMemberRole", "organization")
  organizationMemberRoles?: Relation<OrganizationMemberRole>[];

  @OneToMany("OrganizationInvitationRole", "organization")
  organizationInvitationRoles?: Relation<OrganizationInvitationRole>[];

  @OneToMany("OrganizationInvitationRole", "organization")
  organizationDailyActivatedMembers?: Relation<OrganizationDailyActivatedMember>[];
}