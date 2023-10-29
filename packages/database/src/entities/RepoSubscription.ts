import { Entity, Column, Relation, JoinColumn, ManyToOne } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { User } from "./User";
import { Repository } from "./Repository";

@Entity("repo_subscriptions")
export class RepoSubscription extends BinaryPKBaseEntity {
  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "repoSubscriptions")
  @JoinColumn()
  user!: Relation<User>;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "repoSubscriptions")
  @JoinColumn()
  repository!: Relation<Repository>;
}
