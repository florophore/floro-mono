import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsIn,
  IsInt,
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
  OneToOne
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { OrganizationDailyActivatedMember } from "./OrganizationDailyActivatedMember";
import { OrganizationInvitation } from "./OrganizationInvitation";
import { OrganizationInvitationRole } from "./OrganizationInvitationRole";
import { OrganizationMember } from "./OrganizationMember";
import { OrganizationMemberRole } from "./OrganizationMemberRole";
import { OrganizationRole } from "./OrganizationRole";
import { User } from "./User";
import { Repository } from "./Repository";
import { Photo } from "./Photo";

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

  @Column("varchar", { default: "free"})
  @IsDefined()
  @IsIn(["free"])
  @IsString()
  @ValidateIf((_options, value) => !!value)
  billingPlan?: string;

  @Column("varchar", { default: "free"})
  @IsDefined()
  @IsIn(["none"])
  @IsString()
  @ValidateIf((_options, value) => !!value)
  billingStatus?: string;

  @Column("bigint", { default: 10737418240 })
  @IsDefined()
  @ValidateIf((_, value) => value != undefined)
  freeDiskSpaceBytes?: number;

  @Column("bigint", { default: 10737418240 })
  @IsDefined()
  @ValidateIf((_, value) => value != undefined)
  diskSpaceLimitBytes?: number;

  @Column("bigint", { default: 0 })
  @IsDefined()
  @ValidateIf((_, value) => value != undefined)
  utilizedDiskSpaceBytes?: number;

  @Column("int", { default: 0 })
  @IsDefined()
  @ValidateIf((_, value) => value != undefined)
  freeSeats?: number;

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
  
  @OneToMany("Repository", "organization")
  privateRepositories?: Relation<Repository>[];

  @OneToMany("Repository", "organization")
  publicRepositories?: Relation<Repository>[];

  @OneToMany("Repository", "organization")
  repositories?: Relation<Repository>[];

  @Column("uuid")
  profilePhotoId?: string|null;

  @OneToOne("Photo", "organization")
  @JoinColumn()
  profilePhoto?: Relation<Photo>|null;
}