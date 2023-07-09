
import { IsBoolean, IsDefined, IsIn, IsOptional, IsString } from "class-validator";
import { Entity, Column, Relation, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { User } from "./User";
import { MergeRequest } from "./MergeRequest";
import { MergeRequestEvent } from "./MergeRequestEvent";

@Entity("review_statuses")
export class ReviewStatus extends BinaryPKBaseEntity {

  @Column("varchar")
  @IsDefined()
  @IsString()
  @IsIn([
    "approved",
    "requested_changes",
    "blocked",
  ])
  approvalStatus!: string; // blocked and requested_changes are functionally the same thing

  @Column("varchar")
  @IsOptional()
  @IsString()
  branchHeadShaAtUpdate!: string;

  @Column("varchar")
  @IsOptional()
  @IsString()
  baseBranchIdAtCreate!: string;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isDeleted!: boolean;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "submittedReviewStatuses")
  @JoinColumn()
  user!: Relation<User>;

  @Column("uuid")
  mergeRequestId!: string;

  @ManyToOne("MergeRequest", "reviewStatuses")
  @JoinColumn()
  mergeRequest!: Relation<MergeRequest>;

  @OneToMany("MergeRequestEvent", "reviewStatus")
  @JoinColumn()
  mergeRequestEvents?: Relation<MergeRequestEvent>[];
}