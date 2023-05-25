import { IsDefined, IsHash, IsInt, IsString } from "class-validator";
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
import UUIDHelper from "../contexts/utils/UUIDHelper";
import { Repository } from "./Repository";

@Entity("binaries")
export class Binary extends BaseEntity {

  @PrimaryColumn()
  id!: string;

  @BeforeInsert()
  addId() {
    this.id = UUIDHelper.getUUIDFromString(this.repositoryId + ":" + this.sha) as string;
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
  @IsDefined()
  @IsHash("sha256")
  sha?: string;

  @Column("varchar")
  @IsDefined()
  @IsString()
  fileName?: string;

  @Column("varchar")
  @IsDefined()
  @IsString()
  mimeType?: string;

  @Column("varchar")
  @IsDefined()
  @IsString()
  fileExtension?: string;

  @Column("varchar")
  @IsDefined()
  @IsInt()
  byteSize?: number;

  @Column("uuid")
  createdById!: string;

  @ManyToOne("User", "createdBinaries")
  @JoinColumn()
  createdBy?: Relation<User>;

  @Column("uuid")
  organizationId!: string;

  @ManyToOne("Organization", "createdBinaries")
  @JoinColumn()
  organization?: Relation<Organization>;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "binaries")
  @JoinColumn()
  repository?: Relation<Repository>;
}