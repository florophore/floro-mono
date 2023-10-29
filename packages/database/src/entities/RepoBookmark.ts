import { Entity, Column, Relation, JoinColumn, ManyToOne } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { User } from "./User";
import { Repository } from "./Repository";

@Entity("repo_bookmarks")
export class RepoBookmark extends BinaryPKBaseEntity {
  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "repoBookmarks")
  @JoinColumn()
  user!: Relation<User>;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "repoBookmarks")
  @JoinColumn()
  repository!: Relation<Repository>;
}
