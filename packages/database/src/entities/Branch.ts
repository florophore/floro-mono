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
  OneToOne,
} from "typeorm";
import { User } from "./User";
import { Organization } from "./Organization";
import { validateOrReject } from 'class-validator';
import { Repository } from "./Repository";
import { v4 as uuidv4 } from 'uuid';
import { MergeRequest } from "./MergeRequest";

@Entity("branches")
export class Branch extends BaseEntity {

  @PrimaryColumn()
  id!: string;

  @BeforeInsert()
  addId() {
    this.id = uuidv4();
  }

  @CreateDateColumn({ name: "inserted_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  public insertedAt!: any;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  public updatedAt!: any;

  @BeforeInsert()
  @BeforeUpdate()
  public validate(): Promise<void> {
    return validateOrReject(this);
  }

  @Column("varchar")
  @IsDefined()
  @IsString()
  name?: string;

  @Column("varchar")
  @IsDefined()
  @IsString()
  branchId!: string;

  @Column("varchar")
  @IsOptional()
  @IsString()
  baseBranchId?: string;

  @Column("varchar")
  @IsHash("sha256")
  @IsOptional()
  lastCommit?: string;

  @Column("varchar")
  @IsString()
  @IsDefined()
  createdByUsername?: string;

  @Column("varchar")
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @Column("varchar")
  @IsISO8601()
  @IsDefined()
  createdAt?: any;

  @Column("uuid")
  createdById!: string;

  @ManyToOne("User", "createdBranches")
  @JoinColumn()
  createdBy?: Relation<User>;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isConflictFree!: boolean;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isMerged!: boolean;

  @Column("uuid")
  @IsOptional()
  organizationId?: string;

  @ManyToOne("Organization", "createdBinaries")
  @JoinColumn()
  organization?: Relation<Organization>;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "branches")
  @JoinColumn()
  repository?: Relation<Repository>;

  @OneToOne("MergeRequest", "dbBranch")
  mergeRequests?: Relation<MergeRequest>[];
}