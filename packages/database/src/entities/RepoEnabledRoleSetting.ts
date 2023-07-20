import { IsDefined, IsString } from "class-validator";
import {
  Entity,
  Column,
  Relation,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Repository } from "./Repository";
import { OrganizationRole } from "./OrganizationRole";
import { User } from "./User";

@Entity("repo_enabled_role_settings")
export class RepoEnabledRoleSetting extends BinaryPKBaseEntity {
  @Column("varchar")
  @IsDefined()
  @IsString()
  settingName?: string;

  @Column("uuid")
  roleId!: string;

  @ManyToOne("OrganizationRole", "enabledRepoRoleSettings")
  @JoinColumn()
  role?: Relation<OrganizationRole>;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "enabledRepoRoleSettings")
  @JoinColumn()
  repository?: Relation<Repository>;
}