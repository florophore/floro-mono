
import { IsBoolean, IsDefined, IsIn, IsInt, IsSemVer, IsString, IsUUID, ValidateIf } from "class-validator";
import { Entity, Column, Relation, JoinColumn, ManyToOne } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";

@Entity("plugin_commit_utilizations")
export class PluginCommitUtilization extends BinaryPKBaseEntity {

  @Column("varchar")
  @IsDefined()
  @IsString()
  commitSha!: string;

  @Column("varchar")
  @IsDefined()
  @IsString()
  pluginName!: string;

  @Column("varchar")
  @IsSemVer()
  @IsDefined()
  pluginVersionNumber!: string;

  @Column("integer")
  @IsDefined()
  @IsInt()
  additions!: number;

  @Column("integer")
  @IsDefined()
  @IsInt()
  removals!: number;

  @Column("integer")
  @IsDefined()
  @IsInt()
  byteSize!: number;

  @Column("uuid")
  pluginId!: string;

  @Column("uuid")
  pluginVersionId!: string;

  @Column("uuid")
  commitId!: string;

  @Column("uuid")
  repositoryId!: string;

  @Column("uuid")
  userId!: string;

  @Column("uuid")
  organizationId!: string;
}