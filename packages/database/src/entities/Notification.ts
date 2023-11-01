import {
  IsBoolean,
  IsDefined,
  IsOptional,
  IsString,
} from "class-validator";
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Relation,
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { OrganizationInvitation } from "./OrganizationInvitation";
import { User } from "./User";
import { Repository } from "./Repository";
import { MergeRequest } from "./MergeRequest";
import { RepoAnnouncement } from "./RepoAnnouncement";
import { RepoBookmark } from "./RepoBookmark";
import { RepoSubscription } from "./RepoSubscription";
import { Organization } from "./Organization";
import { MergeRequestComment } from "./MergeRequestComment";
import { ReviewStatus } from "./ReviewStatus";
import { RepoAnnouncementReply } from "./RepoAnnouncementReply";
import { MergeRequestCommentReply } from "./MergeRequestCommentReply";

@Entity("notifications")
export class Notification extends BinaryPKBaseEntity {

  @Column("varchar")
  @IsDefined()
  @IsString()
  eventName!: string;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  hasBeenChecked!: boolean;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isDeleted!: boolean;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "notifications")
  @JoinColumn()
  user?: Relation<User>;

  @Column("uuid")
  performedByUserId!: string;

  @ManyToOne("User", "performedNotifications")
  @JoinColumn({ name: "performed_by_user_id" })
  performedByUser?: Relation<User>;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "notifications")
  @JoinColumn()
  repository?: Relation<Repository>;

  @Column("uuid")
  organizationId!: string;

  @ManyToOne("Organization", "notifications")
  @JoinColumn()
  organization?: Relation<Organization>;

  @Column("uuid")
  repoBookmarkId!: string;

  @ManyToOne("RepoBookmark", "notifications")
  @JoinColumn()
  repoBookmark?: Relation<RepoBookmark>;

  @Column("uuid")
  repoSubscriptionId!: string;

  @ManyToOne("RepoSubscription", "notifications")
  @JoinColumn()
  repoSubscription?: Relation<RepoSubscription>;

  @Column("uuid")
  repoAnnouncementId!: string;

  @ManyToOne("RepoAnnouncement", "notifications")
  @JoinColumn()
  repoAnnouncement?: Relation<RepoAnnouncement>;

  @Column("uuid")
  repoAnnouncementReplyId!: string;

  @ManyToOne("RepoAnnouncementReply", "notifications")
  @JoinColumn()
  repoAnnouncementReply?: Relation<RepoAnnouncementReply>;

  @Column("uuid")
  mergeRequestId!: string;

  @ManyToOne("MergeRequest", "notifications")
  @JoinColumn()
  mergeRequest!: Relation<MergeRequest>;

  @Column("uuid")
  mergeRequestCommentId!: string;

  @ManyToOne("MergeRequestComment", "notifications")
  @JoinColumn()
  mergeRequestComment!: Relation<MergeRequestComment>;

  @Column("uuid")
  mergeRequestCommentReplyId!: string;

  @ManyToOne("MergeRequestCommentReply", "notifications")
  @JoinColumn()
  mergeRequestCommentReply!: Relation<MergeRequestCommentReply>;

  @Column("uuid")
  reviewStatusId!: string;

  @ManyToOne("ReviewStatus", "notifications")
  @JoinColumn()
  reviewStatus!: Relation<ReviewStatus>;

  @Column("uuid")
  organizationInvitationId!: string;

  @ManyToOne("OrganizationInvitation", "notifications")
  @JoinColumn()
  organizationInvitation!: Relation<OrganizationInvitation>;
}