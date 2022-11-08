import {
  IsDefined,
  IsEmail,
  IsIn,
  IsString,
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
import { Organization } from "./Organization";
import { OrganizationInvitationRole } from "./OrganizationInvitationRole";
import { OrganizationMember } from "./OrganizationMember";
import { User } from "./User";

@Entity("organization_invitations")
export class OrganizationInvitation extends BinaryPKBaseEntity {
  @Column("varchar", { length: 255 })
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @Column("varchar", { length: 255 })
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsEmail()
  email!: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsEmail()
  normalizedEmail!: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  emailHash!: string;

  @Column("varchar")
  @IsDefined()
  @IsIn(["sent", "accepted", "rejected", "cancelled"])
  @IsString()
  invitationState?: boolean;

  @Column("uuid")
  @IsDefined()
  organizationId!: string;

  @ManyToOne("Organization", "organizationInvitations")
  @JoinColumn()
  organization?: Relation<Organization>;

  @Column("uuid")
  @IsDefined()
  userId!: string;

  @ManyToOne("User", "organizationInvitations")
  @JoinColumn()
  user?: Relation<User>;

  @Column("uuid")
  @IsDefined()
  invitedByUserId!: string;

  @ManyToOne("User", "sentOrganizationInvitations")
  @JoinColumn({ name: "invited_by_user_id" })
  invitedByUser?: Relation<User>;

  @Column("uuid")
  @IsDefined()
  invitedByOrganizationMemberId!: string;

  @ManyToOne("OrganizationMember", "sentOrganizationInvitations")
  @JoinColumn({ name: "invited_by_organization_member_id" })
  invitedByOrganizationMember?: Relation<OrganizationMember>;

  @OneToMany("OrganizationInvitationRole", "organizationInvitation")
  organizationInvitationRoles?: Relation<OrganizationInvitationRole>[];
}
