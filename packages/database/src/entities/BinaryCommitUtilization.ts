
import { IsDefined, IsString } from "class-validator";
import { Entity, Column } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";

@Entity("binary_commit_utilizations")
export class BinaryCommitUtilization extends BinaryPKBaseEntity {

  @Column("varchar")
  @IsDefined()
  @IsString()
  commitSha!: string;

  @Column("varchar")
  @IsString()
  @IsDefined()
  binaryFileName!: string;

  @Column("varchar")
  @IsString()
  @IsDefined()
  binaryHash!: string;

  @Column("uuid")
  binaryId!: string;

  @Column("uuid")
  commitId!: string;

  @Column("uuid")
  repositoryId!: string;

  @Column("uuid")
  userId!: string;

  @Column("uuid")
  organizationId!: string;
}