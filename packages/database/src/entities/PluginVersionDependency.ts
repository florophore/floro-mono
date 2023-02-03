
import { IsBoolean, IsDefined, IsIn, IsSemVer, IsString, IsUUID, ValidateIf } from "class-validator";
import { Entity, Column, Relation, JoinColumn, ManyToOne } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Plugin } from "./Plugin";
import { PluginVersion } from "./PluginVersion";

@Entity("plugin_version_dependencies")
export class PluginVersionDependency extends BinaryPKBaseEntity {

  @Column("varchar")
  @IsBoolean()
  @IsDefined()
  isPrimaryDependency!: boolean;

  @Column("varchar")
  @IsString()
  @IsDefined()
  name!: string;

  @Column("uuid")
  @IsDefined()
  @IsUUID()
  nameKey!: string;

  @Column("varchar")
  @IsSemVer()
  @IsDefined()
  version!: string;

  @Column("varchar")
  @IsString()
  @IsDefined()
  dependencyName!: string;

  @Column("uuid")
  @IsDefined()
  @IsUUID()
  dependencyNameKey!: string;

  @Column("varchar")
  @IsSemVer()
  @IsDefined()
  dependencyVersion!: string;

  @Column("uuid")
  pluginId!: string;

  @ManyToOne("Plugin", "versions")
  @JoinColumn()
  plugin?: Relation<Plugin>;

  @Column("uuid")
  pluginVersionId!: string;

  @ManyToOne("PluginVersion", "dependencies")
  @JoinColumn()
  pluginVersion?: Relation<PluginVersion>;

  @Column("uuid")
  dependencyPluginId!: string;

  @JoinColumn()
  dependencyPlugin?: Relation<Plugin>;

  @Column("uuid")
  dependencyPluginVersionId!: string;

  @ManyToOne("PluginVersion", "dependents")
  @JoinColumn()
  dependencyPluginVersion?: Relation<PluginVersion>;
}