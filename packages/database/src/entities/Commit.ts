import { IsBoolean, IsDefined, IsHash, IsInt, IsOptional, IsString, IsISO8601 } from "class-validator";
import {
  Entity,
  Column,
  Relation,
  JoinColumn,
  PrimaryColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";
import { Organization } from "./Organization";
import { validateOrReject } from 'class-validator';
import { Repository } from "./Repository";
import UUIDHelper from "../contexts/utils/UUIDHelper";

@Entity("commits")
export class Commit extends BaseEntity {

  @PrimaryColumn()
  id!: string;

  @BeforeInsert()
  addId() {
    if (!this.sha && !this.repository) {
        return;
    }
    this.id = UUIDHelper.getUUIDFromSha(this.sha + "" + this.repository) as string;
  }

  @CreateDateColumn({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  public insertedAt!: any;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  public updatedAt!: any;

  @BeforeInsert()
  @BeforeUpdate()
  public validate(): Promise<void> {
    return validateOrReject(this);
  }

  @Column("varchar")
  @IsHash("sha256")
  @IsDefined()
  sha?: string;

  @Column("varchar")
  @IsOptional()
  @IsString()
  parent!: string;

  @Column("uuid")
  parentId!: string;

  @Column("varchar")
  @IsOptional()
  @IsString()
  historicalParent!: string;

  @Column("integer")
  @IsInt()
  @IsDefined()
  idx?: number;

  @Column("varchar")
  @IsOptional()
  @IsString()
  mergeBase!: string;

  @Column("varchar")
  @IsOptional()
  @IsString()
  mergeRevertSha!: string;

  @Column("integer")
  @IsInt()
  @IsDefined()
  byteSize?: number;

  @Column("text")
  @IsString()
  @IsDefined()
  message?: string;

  @Column("varchar")
  @IsString()
  @IsDefined()
  username?: string;

  @Column("varchar")
  @IsString()
  @IsDefined()
  authorUsername?: string;

  @Column("varchar")
  @IsISO8601()
  @IsDefined()
  timestamp?: any;

  @Column("uuid")
  @IsOptional()
  authorUserId!: string;

  @ManyToOne("User", "authoredCommits")
  @JoinColumn()
  authorUser?: Relation<User>;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "commits")
  @JoinColumn()
  user?: Relation<User>;

  @Column("uuid")
  @IsOptional()
  organizationId?: string;

  @ManyToOne("Organization", "commits")
  @JoinColumn()
  organization?: Relation<Organization>;

  @Column("uuid")
  @IsDefined()
  repositoryId!: string;

  @ManyToOne("Repository", "commits")
  @JoinColumn()
  repository?: Relation<Repository>;
}