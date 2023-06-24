import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Entity, Column, Relation, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { User } from "./User";
import { Repository } from "./Repository";

@Entity("ignored_branch_notifications")
export class IgnoredBranchNotification extends BinaryPKBaseEntity {

  @Column("varchar")
  @IsOptional()
  @IsString()
  branchId!: string;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isDeleted!: boolean;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "ignoredBranchNotifications")
  @JoinColumn()
  user!: Relation<User>;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "ignoredBranchNotifications")
  @JoinColumn()
  repository!: Relation<Repository>;
}