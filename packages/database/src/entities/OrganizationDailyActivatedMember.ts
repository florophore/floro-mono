import {
  IsDefined,
  IsString,
} from "class-validator";
import { Entity, Column, ManyToOne, JoinColumn, Relation } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Organization } from "./Organization";
import { OrganizationMember } from "./OrganizationMember";
import { User } from "./User";

@Entity("organization_daily_activated_members")
export class OrganizationDailyActivatedMember extends BinaryPKBaseEntity {
  @Column("varchar", { length: 255 })
  @IsString()
  @IsDefined()
  date?: string;

  @Column("uuid")
  organizationId!: string;

  @ManyToOne("Organization", "organizationDailyActivatedMembers")
  @JoinColumn()
  organization?: Relation<Organization>;

  @Column("uuid")
  organizationMemberId!: string;

  @ManyToOne("OrganizationMember", "organizationDailyActivatedMembers")
  @JoinColumn()
  organizationMember?: Relation<OrganizationMember>;
}

