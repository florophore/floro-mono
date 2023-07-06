
import { IsBoolean, IsDefined, IsOptional, IsString } from "class-validator";
import { Entity, Column, Relation, JoinColumn, ManyToOne } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { User } from "./User";
import { MergeRequest } from "./MergeRequest";
import { MergeRequestComment } from "./MergeRequestComment";
import { MergeRequestCommentReply } from "./MergeRequestCommentReply";
import { ReviewerRequest } from "./ReviewerRequest";
import { ReviewStatus } from "./ReviewStatus";

@Entity("merge_request_events")
export class MergeRequestEvent extends BinaryPKBaseEntity {

  @Column("varchar")
  @IsDefined()
  @IsString()
  eventName!: string;

  @Column("varchar")
  @IsOptional()
  @IsString()
  subeventName!: string;

  @Column("varchar")
  @IsOptional()
  @IsString()
  eventGroupingId!: string;

  @Column("varchar")
  @IsOptional()
  @IsString()
  branchHeadShaAtEvent!: string;

  @Column("varchar")
  @IsOptional()
  @IsString()
  baseBranchIdAtEvent!: string;

  @Column("uuid")
  performedByUserId!: string;

  @ManyToOne("User", "mergeRequestEvents")
  @JoinColumn()
  performedByUser!: Relation<User>;

  @Column("uuid")
  commentId!: string;

  @ManyToOne("MergeRequestComment", "mergeRequestEvents")
  @JoinColumn()
  comment!: Relation<MergeRequestComment>;

  @Column("uuid")
  commentReplyId!: string;

  @ManyToOne("MergeRequestCommentReply", "mergeRequestEvents")
  @JoinColumn()
  commentReply!: Relation<MergeRequestCommentReply>;

  @Column("uuid")
  reviewerRequestId!: string;

  @ManyToOne("ReviewerRequest", "mergeRequestEvents")
  @JoinColumn()
  reviewerRequest!: Relation<ReviewerRequest>;

  @Column("uuid")
  reviewStatusId!: string;

  @ManyToOne("ReviewStatus", "mergeRequestEvents")
  @JoinColumn()
  reviewStatus!: Relation<ReviewStatus>;

  @Column("uuid")
  mergeRequestId!: string;

  @ManyToOne("MergeRequest", "mergeRequestEvents")
  @JoinColumn()
  mergeRequest!: Relation<MergeRequest>;
}