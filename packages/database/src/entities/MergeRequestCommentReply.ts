import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Entity, Column, Relation, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { User } from "./User";
import { MergeRequest } from "./MergeRequest";
import { MergeRequestComment } from "./MergeRequestComment";
import { MergeRequestEvent } from "./MergeRequestEvent";

@Entity("merge_request_comment_replies")
export class MergeRequestCommentReply extends BinaryPKBaseEntity {

  @Column("text")
  @IsOptional()
  @IsString()
  text!: string;

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

  @ManyToOne("User", "mergeRequestComments")
  @JoinColumn()
  user!: Relation<User>;

  @Column("uuid")
  mergeRequestCommentId!: string;

  @ManyToOne("MergeRequestComment", "replies")
  @JoinColumn()
  mergeRequestComment!: Relation<MergeRequestComment>;

  @OneToMany("MergeRequestEvent", "commentReply")
  @JoinColumn()
  mergeRequestEvents?: Relation<MergeRequestEvent>[];
}