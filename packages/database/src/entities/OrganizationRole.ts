import { IsBoolean, IsDefined, MaxLength, MinLength } from "class-validator";
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Relation,
  OneToMany,
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Organization } from "./Organization";
import { OrganizationInvitationRole } from "./OrganizationInvitationRole";
import { OrganizationMember } from "./OrganizationMember";
import { OrganizationMemberRole } from "./OrganizationMemberRole";
import { User } from "./User";

@Entity("organization_roles")
export class OrganizationRole extends BinaryPKBaseEntity {
  @Column("varchar", { length: 255 })
  @IsDefined()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @Column("boolean", { default: false })
  @IsDefined()
  @IsBoolean()
  isMutable?: boolean;

  @Column("boolean", { default: false })
  @IsDefined()
  @IsBoolean()
  isDefault?: boolean;

  @Column("boolean", { default: false })
  @IsDefined()
  @IsBoolean()
  canCreateRepos?: boolean;

  @Column("boolean", { default: false })
  @IsDefined()
  @IsBoolean()
  canModifyOrganizationSettings?: boolean;

  @Column("boolean", { default: false })
  @IsDefined()
  @IsBoolean()
  canModifyOrganizationDeveloperSettings?: boolean;

  @Column("boolean", { default: false })
  @IsDefined()
  @IsBoolean()
  canInviteMembers?: boolean;

  @Column("boolean", { default: false })
  @IsDefined()
  @IsBoolean()
  canModifyInvites?: boolean;

  @Column("boolean", { default: false })
  @IsDefined()
  @IsBoolean()
  canModifyOwnInternalHandle?: boolean;

  @Column("boolean", { default: false })
  @IsDefined()
  @IsBoolean()
  canModifyBilling?: boolean;

  @Column("boolean", { default: false })
  @IsDefined()
  @IsBoolean()
  canModifyOrganizationRoles?: boolean;

  @Column("uuid")
  createdByOrganizationMemberId!: string;

  @ManyToOne("OrganizationMember", "createdOrganizationRoles")
  @JoinColumn({ name: "created_by_organization_member_id" })
  createdByOrganizationMember?: Relation<OrganizationMember>;

  @Column("uuid")
  createdByUserId!: string;

  @ManyToOne("User", "createdOrganizationRoles")
  @JoinColumn({ name: "created_by_user_id" })
  createdByUser?: Relation<User>;

  @Column("uuid")
  @IsDefined()
  organizationId!: string;

  @ManyToOne("Organization", "organizationRoles")
  @JoinColumn()
  organization?: Relation<Organization>;

  @OneToMany("OrganizationMemberRole", "organizationRole")
  organizationMemberRoles?: Relation<OrganizationMemberRole>[];

  @OneToMany("OrganizationInvitationRole", "organizationRole")
  organizationInvitationRoles?: Relation<OrganizationInvitationRole>[];
}
