import { IsDefined, IsHash, IsString } from "class-validator";
import {
  Entity,
  Column,
  Relation,
  ManyToOne,
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { User } from "./User";
import { Repository } from "./Repository";

@Entity("repo_enabled_user_settings")
export class RepoEnabledUserSetting extends BinaryPKBaseEntity {
  @Column("varchar")
  @IsDefined()
  @IsString()
  settingName?: string;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "enabledRepoSettings")
  user?: Relation<User>;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "enabledUserSettings")
  repository?: Relation<Repository>;
}