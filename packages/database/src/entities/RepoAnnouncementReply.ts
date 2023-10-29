import { IsOptional, IsString, IsBoolean } from "class-validator";
import { Entity, Column, Relation, JoinColumn, ManyToOne } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { User } from "./User";
import { RepoAnnouncement } from "./RepoAnnouncement";

@Entity("repo_announcement_replies")
export class RepoAnnouncementReply extends BinaryPKBaseEntity {
  @Column("text")
  @IsOptional()
  @IsString()
  text!: string;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isDeleted!: boolean;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "repoAnnouncementReplies")
  @JoinColumn()
  user!: Relation<User>;

  @Column("uuid")
  repoAnnouncementId!: string;

  @ManyToOne("RepoAnnouncement", "replies")
  @JoinColumn()
  repoAnnouncement!: Relation<RepoAnnouncement>;
}
