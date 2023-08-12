
import { IsBoolean, IsDefined, IsIn, IsOptional, IsSemVer, IsString, IsUrl, IsUUID, ValidateIf } from "class-validator";
import { Entity, Column, Relation, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Organization } from "./Organization";
import { User } from "./User";
import { Plugin } from "./Plugin";
import { PluginVersionDependency } from "./PluginVersionDependency";
import { MergeRequestComment } from "./MergeRequestComment";

@Entity("plugin_versions")
export class PluginVersion extends BinaryPKBaseEntity {
  @Column("varchar")
  @IsString()
  @IsDefined()
  name!: string;

  @Column("uuid")
  @ValidateIf((_, value) => !!value)
  @IsDefined()
  @IsUUID()
  nameKey!: string;

  @Column("uuid")
  @ValidateIf((_, value) => !!value)
  @IsDefined()
  @IsUUID()
  uploadHash!: string;

  @Column("varchar")
  @IsSemVer()
  @IsDefined()
  version!: string;

  @Column("varchar")
  @IsString()
  @IsDefined()
  displayName!: string;

  @Column("boolean")
  @IsBoolean()
  @IsOptional()
  managedCopy!: boolean;

  @Column("varchar")
  @IsIn(["user_plugin", "org_plugin"])
  @IsString()
  @IsDefined()
  ownerType!: string;

  @Column("varchar")
  @IsDefined()
  @IsString()
  lightIcon!: string;

  @Column("varchar")
  @IsDefined()
  @IsString()
  darkIcon!: string;

  @Column("varchar")
  @IsDefined()
  @IsString()
  selectedLightIcon!: string;

  @Column("varchar")
  @IsDefined()
  @IsString()
  selectedDarkIcon!: string;

  @Column("text")
  @IsDefined()
  @IsString()
  description!: string;

  @Column("varchar")
  @ValidateIf((_, value) => !!value)
  @IsUrl()
  codeRepoUrl!: string;

  @Column("varchar")
  @ValidateIf((_, value) => !!value)
  @IsUrl()
  codeDocsUrl!: string;

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  isPrivate!: boolean;

  @Column("varchar")
  @IsIn(["unreleased", "released", "cancelled"])
  @IsString()
  @IsDefined()
  state!: string;

  @Column("boolean")
  @IsBoolean()
  isBackwardsCompatible!: boolean;

  @Column("varchar")
  @ValidateIf((_, value) => !!value)
  @IsSemVer()
  previousReleaseVersion!: string;

  @Column("text")
  @IsString()
  @IsDefined()
  manifest!: string;

  @Column("text")
  @IsString()
  @IsDefined()
  indexHtml!: string;

  @Column("uuid")
  pluginId!: string;

  @ManyToOne("Plugin", "versions")
  @JoinColumn()
  plugin?: Relation<Plugin>;

  @Column("uuid")
  uploadedByUserId!: string;

  @JoinColumn()
  uploadedByUser?: Relation<User>;

  @Column("uuid")
  releasedByUserId!: string;

  @JoinColumn()
  releasedByUser?: Relation<User>;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "versions")
  @JoinColumn()
  user?: Relation<User>;

  @Column("uuid")
  organizationId!: string;

  @ManyToOne("Organization", "versions")
  @JoinColumn()
  organization?: Relation<Organization>;

  @OneToMany("PluginVersionDependency", "pluginVersion")
  dependencies?: Relation<PluginVersionDependency>[];

  @OneToMany("PluginVersionDependency", "dependencyPluginVersion")
  dependents?: Relation<PluginVersionDependency>[];

  @OneToMany("MergeRequestComment", "pluginVersion")
  mergeRequestComments?: Relation<MergeRequestComment>[];
}