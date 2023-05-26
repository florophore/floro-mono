import { IsBoolean, IsDefined, IsString } from "class-validator";
import {
  Entity,
  Column,
  Relation,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Repository } from "./Repository";
import { ProtectedBranchRuleEnabledRoleSetting } from "./ProtectedBranchRuleEnabledRoleSetting";
import { ProtectedBranchRuleEnabledUserSetting } from "./ProtectedBranchRuleEnabledUserSetting";

@Entity("protected_branch_rules")
export class ProtectedBranchRule extends BinaryPKBaseEntity {
  @Column("varchar")
  @IsDefined()
  @IsString()
  branchId?: string;

  @Column("varchar")
  @IsDefined()
  @IsString()
  branchName?: string;

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  disableDirectPushing?: boolean;

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  requireApprovalToMerge?: boolean;

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  automaticallDeleteMergedFeatureBranches?: boolean;

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  anyoneCanCreateMergeRequests?: boolean;

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  anyoneWithApprovalCanMerge?: boolean; // means any MR with approval can be merged

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  anyoneCanMergeMergeRequests?: boolean; // means any MR can be merged regardless of approval status

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  anyoneCanApproveMergeRequests?: boolean;

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  anyoneCanRevert?: boolean;

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  anyoneCanAutofix?: boolean;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "protectedBranchRules")
  repository?: Relation<Repository>;

  @OneToMany("ProtectedBranchRuleEnabledUserSetting", "protectedBranchRule")
  enabledRepoUserSettings?: Relation<ProtectedBranchRuleEnabledUserSetting>[];

  @OneToMany("ProtectedBranchRuleEnabledRoleSetting", "protectedBranchRule")
  enabledRepoRoleSettings?: Relation<ProtectedBranchRuleEnabledRoleSetting>[];
}