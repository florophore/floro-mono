import { IsBoolean, IsDefined, IsOptional, MaxLength, MinLength, ValidateIf } from "class-validator";
import { Entity, Column, OneToMany, OneToOne, Relation, JoinColumn } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Organization } from "./Organization";
import { OrganizationInvitation } from "./OrganizationInvitation";
import { OrganizationRole } from "./OrganizationRole";
import { Photo } from "./Photo";
import { Referral } from "./Referral";
import { Repository } from "./Repository";
import { Plugin } from "./Plugin";
import { UserAuthCredential } from "./UserAuthCredential";
import { UserServiceAgreement } from "./UserServiceAgreement";
import { PluginVersion } from "./PluginVersion";
import { Binary } from "./Binary";
import { Branch } from "./Branch";
import { Commit } from "./Commit";
import { MergeRequest } from "./MergeRequest";
import { ReviewerRequest } from "./ReviewerRequest";
import { MergeRequestComment } from "./MergeRequestComment";
import { ReviewStatus } from "./ReviewStatus";
import { MergeRequestEvent } from "./MergeRequestEvent";
import { IgnoredBranchNotification } from "./IgnoredBranchNotification";
import { ApiKey } from "./ApiKey";
import { WebhookKey } from "./WebhookKey";
import { RepositoryEnabledWebhookKey } from "./RepositoryEnabledWebhookKey";
import { RepositoryEnabledApiKey } from "./RepositoryEnabledApiKey";
import { RepoBookmark } from "./RepoBookmark";
import { RepoSubscription } from "./RepoSubscription";
import { RepoAnnouncement } from "./RepoAnnouncement";
import { RepoAnnouncementReply } from "./RepoAnnouncementReply";

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

  @Column("boolean", { default: false})
  @IsBoolean()
  @IsOptional()
  hideOrganizationsInProfile?: boolean;

  @Column("boolean", { default: false})
  @IsBoolean()
  @IsOptional()
  hideBookmarksInProfile?: boolean;

  /* STATE Email Mutes */
  @Column("boolean", { default: false})
  @IsBoolean()
  @IsOptional()
  muteRepoAnnouncementReplyAdded?: boolean;

  @Column("boolean", { default: false})
  @IsBoolean()
  @IsOptional()
  muteRepoWriteAccessGranted?: boolean;

  @Column("boolean", { default: false})
  @IsBoolean()
  @IsOptional()
  muteMergeRequestBranchUpdated?: boolean;

  @Column("boolean", { default: false})
  @IsBoolean()
  @IsOptional()
  muteMergeRequestMergedOrClosed?: boolean;

  @Column("boolean", { default: false})
  @IsBoolean()
  @IsOptional()
  muteMergeRequestReviewStatusChanged?: boolean;

  @Column("boolean", { default: false})
  @IsBoolean()
  @IsOptional()
  muteMergeRequestCommentAdded?: boolean;

  @Column("boolean", { default: false})
  @IsBoolean()
  @IsOptional()
  muteMergeRequestCommentReplyAdded?: boolean;
  /* END Email Mutes */


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

  @OneToMany("Referral", "referrerUser")
  referralsSent?: Relation<Referral>[];

  @OneToMany("Referral", "refereeUser")
  referralsReceived?: Relation<Referral>[];

  @OneToMany("Repository", "user")
  privateRepositories?: Relation<Repository>[];

  @OneToMany("Repository", "user")
  publicRepositories?: Relation<Repository>[];

  @OneToMany("Repository", "user")
  repositories?: Relation<Repository>[];

  @OneToMany("Plugin", "user")
  plugins?: Relation<Plugin>[];

  @OneToMany("PluginVersion", "user")
  versions?: Relation<PluginVersion>[];

  @OneToMany("Plugin", "user")
  createdPlugins?: Relation<Plugin>[];

  @Column("uuid")
  profilePhotoId?: string|null;

  @OneToOne("Photo", "user")
  @JoinColumn()
  profilePhoto?: Relation<Photo>|null;

  @OneToMany("Binary", "createdBy")
  @JoinColumn()
  createdBinaries?: Relation<Binary>[];

  @OneToMany("Branch", "createdBy")
  @JoinColumn()
  createdBranches?: Relation<Branch>[];

  @OneToMany("Commit", "user")
  @JoinColumn()
  commits?: Relation<Commit>[];

  @OneToMany("Commit", "authorUser")
  @JoinColumn()
  authoredCommits?: Relation<Commit>[];

  @OneToMany("MergeRequest", "user")
  @JoinColumn()
  mergeRequests?: Relation<MergeRequest>[];

  @OneToMany("MergeRequest", "openedByUser")
  @JoinColumn()
  openedMergeRequests?: Relation<MergeRequest>[];

  @OneToMany("ReviewerRequest", "requestedByUser")
  @JoinColumn()
  sentReviewRequests?: Relation<ReviewerRequest>[];

  @OneToMany("ReviewerRequest", "requestedReviewerUser")
  @JoinColumn()
  receivedReviewRequests?: Relation<ReviewerRequest>[];

  @OneToMany("MergeRequestComment", "user")
  @JoinColumn()
  mergeRequestComments?: Relation<MergeRequestComment>[];

  @OneToMany("ReviewStatus", "user")
  @JoinColumn()
  submittedReviewStatuses?: Relation<ReviewStatus>[];

  @OneToMany("MergeRequestEvent", "performedByUser")
  @JoinColumn()
  mergeRequestEvents?: Relation<MergeRequestEvent>[];

  @OneToMany("IgnoredBranchNotification", "user")
  @JoinColumn()
  ignoredBranchNotifications?: Relation<IgnoredBranchNotification>[];

  @OneToMany("ApiKey", "createdByUser")
  @JoinColumn()
  createdApiKeys?: Relation<ApiKey>[];

  @OneToMany("ApiKey", "user")
  @JoinColumn()
  apiKeys?: Relation<ApiKey>[];

  @OneToMany("WebhookKey", "createdByUser")
  @JoinColumn()
  createdWebhookKeys?: Relation<WebhookKey>[];

  @OneToMany("WebhookKey", "user")
  @JoinColumn()
  webhookKeys?: Relation<WebhookKey>[];

  @OneToMany("RepositoryEnabledApiKey", "createdByUser")
  @JoinColumn()
  createdRepositoryEnabledApiKeys?: Relation<RepositoryEnabledApiKey>[];

  @OneToMany("RepositoryEnabledApiKey", "user")
  @JoinColumn()
  repositoryEnabledApiKeys?: Relation<RepositoryEnabledApiKey>[];

  @OneToMany("RepositoryEnabledWebhookKey", "createdByUser")
  @JoinColumn()
  createdRepositoryEnabledWebhookKeys?: Relation<RepositoryEnabledWebhookKey>[];

  @OneToMany("RepositoryEnabledWebhookKey", "user")
  @JoinColumn()
  repositoryEnabledWebhookKeys?: Relation<RepositoryEnabledWebhookKey>[];

  @OneToMany("RepoBookmark", "user")
  @JoinColumn()
  repoBookmarks?: Relation<RepoBookmark>[];

  @OneToMany("RepoSubscription", "user")
  @JoinColumn()
  repoSubscriptions?: Relation<RepoSubscription>[];

  @OneToMany("RepoAnnouncement", "user")
  @JoinColumn()
  repoAnnouncements?: Relation<RepoAnnouncement>[];

  @OneToMany("RepoAnnouncement", "createdByUser")
  @JoinColumn()
  createdRepoAnnouncements?: Relation<RepoAnnouncement>[];

  @OneToMany("RepoAnnouncementReply", "user")
  @JoinColumn()
  repoAnnouncementReplies?: Relation<RepoAnnouncementReply>[];

  @OneToMany("Notification", "user")
  @JoinColumn()
  notifications?: Relation<Notification>[];

  @OneToMany("Notification", "performedByUser")
  @JoinColumn()
  performedNotifications?: Relation<Notification>[];
}
