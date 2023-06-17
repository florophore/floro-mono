
import { IsBoolean, IsDefined, IsOptional, IsString } from "class-validator";
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
  approvalStatus!: string;

  @Column("varchar")
  @IsOptional()
  @IsString()
  branchHeadShaAtCreate!: string;

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