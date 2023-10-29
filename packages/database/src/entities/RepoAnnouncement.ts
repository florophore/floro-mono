import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Entity, Column, Relation, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Organization } from "./Organization";
import { User } from "./User";
import { Repository } from "./Repository";
import { RepoAnnouncementReply } from "./RepoAnnouncementReply";

@Entity("repo_announcements")
export class RepoAnnouncement extends BinaryPKBaseEntity {
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

  @ManyToOne("User", "repoAnnouncements")
  @JoinColumn()
  user!: Relation<User>;

  @Column("uuid")
  createdByUserId!: string;

  @ManyToOne("User", "createdRepoAnnouncements")
  @JoinColumn()
  createdByUser!: Relation<User>;

  @Column("uuid")
  organizationId!: string;

  @ManyToOne("Organization", "repoAnnouncements")
  @JoinColumn()
  organization!: Relation<Organization>;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "repoAnnouncements")
  @JoinColumn()
  repository!: Relation<Repository>;

  @OneToMany("RepoAnnouncementReply", "repoAnnouncement")
  @JoinColumn()
  replies?: Relation<RepoAnnouncementReply>[];
}
