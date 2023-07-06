import { IsBoolean, IsDefined, IsIn, IsInt, IsOptional, IsString, IsUUID, ValidateIf } from "class-validator";
import { Entity, Column, OneToOne, Relation, JoinColumn, OneToMany, ManyToOne } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Organization } from "./Organization";
import { User } from "./User";
import { Branch } from "./Branch";
import { ReviewerRequest } from "./ReviewerRequest";
import { MergeRequestComment } from "./MergeRequestComment";
import { ReviewStatus } from "./ReviewStatus";

@Entity("merge_requests")
export class MergeRequest extends BinaryPKBaseEntity {

  @Column("varchar")
  @IsString()
  @IsDefined()
  title?: string;

  @Column("text")
  @IsString()
  @IsDefined()
  description?: string;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isOpen!: boolean;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isConflictFree!: boolean;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isMerged!: boolean;

  @Column("varchar")
  @IsOptional()
  @IsString()
  branchHeadShaAtCreate!: string;

  @Column("varchar")
  @IsOptional()
  @IsString()
  branchHeadShaAtClose!: string;

  @Column("varchar")
  @IsOptional()
  @IsString()
  divergenceSha!: string;

  @Column("varchar")
  @IsString()
  @IsDefined()
  branchId?: string;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isDeleted!: boolean;

  @Column("integer")
  @IsOptional()
  @IsInt()
  mergeRequestCount!: number;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "mergeRequests")
  @JoinColumn()
  user!: Relation<User>;

  @Column("uuid")
  openedByUserId!: string;

  @ManyToOne("User", "openedMergeRequests")
  @JoinColumn()
  openedByUser!: Relation<User>;

  @Column("uuid")
  organizationId!: string;

  @ManyToOne("Organization", "mergeRequests")
  @JoinColumn()
  organization!: Relation<Organization>;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "mergeRequests")
  @JoinColumn()
  repository!: Relation<Organization>;

  @Column("uuid")
  dbBranchId!: string;

  @OneToOne("Branch", "mergeRequests")
  @JoinColumn()
  dbBranch!: Relation<Branch>;

  @OneToMany("ReviewerRequest", "mergeRequest")
  @JoinColumn()
  reviewerRequests?: Relation<ReviewerRequest>[];

  @OneToMany("MergeRequestComment", "mergeRequest")
  @JoinColumn()
  mergeRequestComments?: Relation<MergeRequestComment>[];

  @OneToMany("ReviewStatus", "mergeRequest")
  @JoinColumn()
  reviewStatuses?: Relation<ReviewStatus>[];
}