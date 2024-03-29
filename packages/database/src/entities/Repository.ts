import { IsBoolean, IsDefined, IsIn, IsOptional, IsString, IsUUID, ValidateIf } from "class-validator";
import { Entity, Column, OneToOne, Relation, JoinColumn, OneToMany, ManyToOne } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Organization } from "./Organization";
import { User } from "./User";
import { Branch } from "./Branch";
import { Binary } from "./Binary";
import { Commit } from "./Commit";
import { RepoEnabledRoleSetting } from "./RepoEnabledRoleSetting";
import { RepoEnabledUserSetting } from "./RepoEnabledUserSetting";
import { MergeRequest } from "./MergeRequest";
import { IgnoredBranchNotification } from "./IgnoredBranchNotification";
import { RepositoryEnabledApiKey } from "./RepositoryEnabledApiKey";
import { RepositoryEnabledWebhookKey } from "./RepositoryEnabledWebhookKey";
import { ApiEvent } from "./ApiEvent";
import { WebhookEvent } from "./WebhookEvent";
import { RepoBookmark } from "./RepoBookmark";
import { RepoSubscription } from "./RepoSubscription";
import { RepoAnnouncement } from "./RepoAnnouncement";

@Entity("repositories")
export class Repository extends BinaryPKBaseEntity {
  @Column("uuid")
  @ValidateIf((_, value) => !!value)
  @IsDefined()
  @IsUUID()
  hashKey!: string;

  @Column("varchar")
  @IsString()
  @IsDefined()
  name!: string;

  @Column("varchar")
  @IsIn(["user_repo", "org_repo"])
  @IsString()
  @IsDefined()
  repoType!: string;

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  isPrivate!: boolean;

  @Column("varchar")
  @IsIn([
    "apache_2",
    "gnu_general_public_3",
    "mit",
    "bsd2_simplified",
    "bsd3_new_or_revised",
    "boost",
    "creative_commons_zero_1_0",
    "eclipse_2",
    "gnu_affero_3",
    "gnu_general_2",
    "gnu_lesser_2_1",
    "mozilla_2",
    "unlicense",
  ])
  @IsString()
  @ValidateIf((_, value) => !!value)
  licenseCode?: string;

  @Column({
    name: "last_repo_update_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  lastRepoUpdateAt!: any;

  @Column("varchar")
  @IsOptional()
  @IsString()
  defaultBranchId!: any;

  @Column("uuid")
  @IsDefined()
  createdByUserId!: string;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  anyoneCanRead!: boolean;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  allowExternalUsersToPush!: boolean;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  anyoneCanPushBranches!: boolean;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  anyoneCanChangeSettings!: boolean;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  anyoneCanWriteAnnouncements!: boolean;

  @Column("integer", { default: 0 })
  @IsDefined()
  @ValidateIf((_, value) => value != undefined)
  bookmarkCount?: number;

  @Column("integer", { default: 0 })
  @IsDefined()
  @ValidateIf((_, value) => value != undefined)
  subscriptionCount?: number;

  @Column("integer", { default: 0 })
  @IsDefined()
  @ValidateIf((_, value) => value != undefined)
  announcementCount?: number;

  @Column("uuid")
  userId!: string;

  @OneToOne("User", "repositories")
  @JoinColumn()
  user!: Relation<User>;

  @Column("uuid")
  organizationId!: string;

  @ManyToOne("Organization", "repositories")
  @JoinColumn()
  organization!: Relation<Organization>;

  @OneToMany("Binary", "repository")
  @JoinColumn()
  binaries?: Relation<Binary>[];

  @OneToMany("Branch", "repository")
  @JoinColumn()
  branches?: Relation<Branch>[];

  @OneToMany("Commit", "repository")
  @JoinColumn()
  commits?: Relation<Commit>[];

  @OneToMany("RepoEnabledUserSetting", "user")
  enabledRepoUserSettings?: Relation<RepoEnabledUserSetting>[];

  @OneToMany("RepoEnabledRoleSetting", "role")
  enabledRepoRoleSettings?: Relation<RepoEnabledRoleSetting>[];

  @OneToMany("MergeRequest", "repository")
  @JoinColumn()
  mergeRequests?: Relation<MergeRequest>[];

  @OneToMany("IgnoredBranchNotification", "repository")
  @JoinColumn()
  ignoredBranchNotifications?: Relation<IgnoredBranchNotification>[];

  @OneToMany("ApiEvent", "repository")
  @JoinColumn()
  apiEvents?: Relation<ApiEvent>[];

  @OneToMany("RepositoryEnabledApiKey", "repository")
  @JoinColumn()
  repositoryEnabledApiKeys?: Relation<RepositoryEnabledApiKey>[];

  @OneToMany("RepositoryEnabledWebhookKey", "repository")
  @JoinColumn()
  repositoryEnabledWebhookKeys?: Relation<RepositoryEnabledWebhookKey>[];

  @OneToMany("WebhookEvent", "repository")
  @JoinColumn()
  webhookEvents?: Relation<WebhookEvent>[];

  @OneToMany("RepoBookmark", "repository")
  @JoinColumn()
  repoBookmarks?: Relation<RepoBookmark>[];

  @OneToMany("RepoSubscription", "repository")
  @JoinColumn()
  repoSubscriptions?: Relation<RepoSubscription>[];

  @OneToMany("RepoAnnouncement", "repository")
  @JoinColumn()
  repoAnnouncements?: Relation<RepoAnnouncement>[];
}