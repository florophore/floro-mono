import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsIn,
  IsOptional,
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
  OneToOne,
  Binary
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
import { Plugin } from "./Plugin";
import { PluginVersion } from "./PluginVersion";
import { Branch } from "./Branch";
import { Commit } from "./Commit";
import { MergeRequest } from "./MergeRequest";
import { ApiKey } from "./ApiKey";
import { WebhookKey } from "./WebhookKey";
import { RepositoryEnabledWebhookKey } from "./RepositoryEnabledWebhookKey";
import { RepositoryEnabledApiKey } from "./RepositoryEnabledApiKey";
import { RepoAnnouncement } from "./RepoAnnouncement";

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

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  hasAcknowledgedBetaPricing?: boolean;

  @Column("varchar", { default: "free"})
  @IsDefined()
  @IsIn(["free", "paid"])
  @IsString()
  @ValidateIf((_options, value) => !!value)
  billingPlan?: string;

  @Column("varchar", { default: "none"})
  @IsDefined()
  @IsIn(["none", "okay", "delinquent"])
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

  @OneToMany("Plugin", "organization")
  plugins?: Relation<Plugin>[];

  @OneToMany("PluginVersion", "organization")
  versions?: Relation<PluginVersion>[];

  @Column("uuid")
  profilePhotoId?: string|null;

  @OneToOne("Photo", "organization")
  @JoinColumn()
  profilePhoto?: Relation<Photo>|null;

  @OneToMany("Binary", "organization")
  @JoinColumn()
  createdBinaries?: Relation<Binary>[];

  @OneToMany("Branch", "organization")
  @JoinColumn()
  branches?: Relation<Branch>[];

  @OneToMany("Commit", "organization")
  @JoinColumn()
  commits?: Relation<Commit>[];

  @OneToMany("MergeRequest", "organization")
  @JoinColumn()
  mergeRequests?: Relation<MergeRequest>[];

  @OneToMany("ApiKey", "organization")
  @JoinColumn()
  apiKeys?: Relation<ApiKey>[];

  @OneToMany("WebhookKey", "organization")
  @JoinColumn()
  webhookKeys?: Relation<WebhookKey>[];

  @OneToMany("RepositoryEnabledApiKey", "organization")
  @JoinColumn()
  repositoryEnabledApiKeys?: Relation<RepositoryEnabledApiKey>[];

  @OneToMany("RepositoryEnabledWebhookKey", "organization")
  @JoinColumn()
  repositoryEnabledWebhookKeys?: Relation<RepositoryEnabledWebhookKey>[];

  @OneToMany("RepoAnnouncement", "organization")
  @JoinColumn()
  repoAnnouncements?: Relation<RepoAnnouncement>[];
}