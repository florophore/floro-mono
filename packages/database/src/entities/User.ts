import { MaxLength, MinLength } from "class-validator";
import { Entity, Column, OneToMany, OneToOne, Relation } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Organization } from "./Organization";
import { OrganizationDailyActivatedMember } from "./OrganizationDailyActivatedMember";
import { OrganizationInvitation } from "./OrganizationInvitation";
import { OrganizationRole } from "./OrganizationRole";
import { UserAuthCredential } from "./UserAuthCredential";
import { UserServiceAgreement } from "./UserServiceAgreement";

@Entity("users")
export class User extends BinaryPKBaseEntity {
  @Column("varchar", { length: 255 })
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @Column("varchar", { length: 255 })
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @Column("varchar", { length: 255 })
  @MinLength(1)
  @MaxLength(30)
  username?: string;
 
  @OneToOne("UserServiceAgreement", "user")
  userServiceAgreement?: Relation<UserServiceAgreement>;

  @OneToMany("UserAuthCredential", "user")
  userAuthCrentials?: Relation<UserAuthCredential>[];

  @OneToMany("Organization", "createdByUser")
  createdOrganizations?: Relation<Organization>[];

  @OneToMany("OrganizationRole", "createdByUser")
  createdOrganizationRoles?: Relation<OrganizationRole>[];

  @OneToMany("OrganizationInvitation", "user")
  organizationInvitations?: Relation<OrganizationInvitation>[];

  @OneToMany("OrganizationInvitation", "invitedByUser")
  sentOrganizationInvitations?: Relation<OrganizationInvitation>[];
}