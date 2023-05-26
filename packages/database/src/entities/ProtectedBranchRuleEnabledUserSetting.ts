import { IsDefined, IsString } from "class-validator";
import {
  Entity,
  Column,
  Relation,
  ManyToOne,
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { ProtectedBranchRule } from "./ProtectedBranchRule";
import { User } from "./User";

@Entity("protected_branch_rule_enabled_user_settings")
export class ProtectedBranchRuleEnabledUserSetting extends BinaryPKBaseEntity {
  @Column("varchar")
  @IsDefined()
  @IsString()
  settingName?: string;

  @Column("uuid")
  uploadedByUserId!: string;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "enabledUserSettings")
  user?: Relation<User>;

  @Column("uuid")
  protectedBranchRuleId!: string;

  @ManyToOne("ProtectedBranchRule", "enabledRoleSettings")
  protectedBranchRule?: Relation<ProtectedBranchRule>;
}