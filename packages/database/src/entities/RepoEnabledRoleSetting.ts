import { IsDefined, IsString } from "class-validator";
import {
  Entity,
  Column,
  Relation,
  ManyToOne,
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Repository } from "./Repository";
import { OrganizationRole } from "./OrganizationRole";

@Entity("repo_enabled_role_settings")
export class RepoEnabledRoleSetting extends BinaryPKBaseEntity {
  @Column("varchar")
  @IsDefined()
  @IsString()
  settingName?: string;

  @Column("uuid")
  uploadedByUserId!: string;

  @Column("uuid")
  roleId!: string;

  @ManyToOne("User", "enabledRepoRoleSettings")
  role?: Relation<OrganizationRole>;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "enabledRepoRoleSettings")
  repository?: Relation<Repository>;
}