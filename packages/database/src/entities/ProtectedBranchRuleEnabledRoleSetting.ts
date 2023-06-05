import { IsDefined, IsString } from "class-validator";
import {
  Entity,
  Column,
  Relation,
  ManyToOne,
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { OrganizationRole } from "./OrganizationRole";
import { ProtectedBranchRule } from "./ProtectedBranchRule";

@Entity("protected_branch_rule_enabled_role_settings")
export class ProtectedBranchRuleEnabledRoleSetting extends BinaryPKBaseEntity {
  @Column("varchar")
  @IsDefined()
  @IsString()
  settingName?: string;

  @Column("uuid")
  roleId!: string;

  @ManyToOne("OrganizationRole", "enabledBranchRoleSettings")
  role?: Relation<OrganizationRole>;

  @Column("uuid")
  protectedBranchRuleId!: string;

  @ManyToOne("ProtectedBranchRule", "enabledRoleSettings")
  protectedBranchRule?: Relation<ProtectedBranchRule>;
}