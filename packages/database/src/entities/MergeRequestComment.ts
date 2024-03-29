
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Entity, Column, Relation, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { User } from "./User";
import { MergeRequest } from "./MergeRequest";
import { MergeRequestCommentReply } from "./MergeRequestCommentReply";
import { MergeRequestEvent } from "./MergeRequestEvent";
import { PluginVersion } from "./PluginVersion";

@Entity("merge_request_comments")
export class MergeRequestComment extends BinaryPKBaseEntity {

  @Column("text")
  @IsOptional()
  @IsString()
  text!: string;

  @Column("varchar")
  @IsOptional()
  @IsString()
  branchHeadShaAtCreate!: string;

  @Column("varchar")
  @IsOptional()
  @IsString()
  pluginName!: string;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isDeleted!: boolean;

  @Column("uuid")
  userId!: string;

  @Column("uuid")
  @IsOptional()
  pluginVersionId?: string;

  @ManyToOne("PluginVersion", "mergeRequestComments")
  @JoinColumn()
  pluginVersion!: Relation<PluginVersion>;

  @ManyToOne("User", "mergeRequestComments")
  @JoinColumn()
  user!: Relation<User>;

  @Column("uuid")
  mergeRequestId!: string;

  @ManyToOne("MergeRequest", "mergeRequestComments")
  @JoinColumn()
  mergeRequest!: Relation<MergeRequest>;

  @OneToMany("MergeRequestCommentReply", "mergeRequestComment")
  @JoinColumn()
  replies!: Relation<MergeRequestCommentReply>[];

  @OneToMany("MergeRequestEvent", "comment")
  @JoinColumn()
  mergeRequestEvents?: Relation<MergeRequestEvent>[];
}