import { IsBoolean, IsOptional } from "class-validator";
import { Entity, Column, Relation, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { User } from "./User";
import { MergeRequest } from "./MergeRequest";
import { MergeRequestEvent } from "./MergeRequestEvent";

@Entity("reviewer_requests")
export class ReviewerRequest extends BinaryPKBaseEntity {

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isDeleted!: boolean;

  @Column("uuid")
  requestedReviewerUserId!: string;

  @ManyToOne("User", "receivedReviewRequests")
  @JoinColumn()
  requestedReviewerUser!: Relation<User>;

  @Column("uuid")
  requestedByUserId!: string;

  @ManyToOne("User", "sentReviewRequests")
  @JoinColumn()
  requestedByUser!: Relation<User>;

  @Column("uuid")
  mergeRequestId!: string;

  @ManyToOne("MergeRequest", "reviewerRequests")
  @JoinColumn()
  mergeRequest!: Relation<MergeRequest>;

  @OneToMany("MergeRequestEvent", "reviewerRequest")
  @JoinColumn()
  mergeRequestEvents?: Relation<MergeRequestEvent>[];
}