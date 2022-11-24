import { IsBoolean, IsDefined, IsIn, IsString, ValidateIf } from "class-validator";
import { Entity, Column, OneToOne, Relation, JoinColumn } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Organization } from "./Organization";
import { User } from "./User";

@Entity("repositories")
export class Repository extends BinaryPKBaseEntity {
  @Column("varchar")
  @IsString()
  @IsDefined()
  name?: string;

  @Column("varchar")
  @IsIn(["user_repo", "org_repo"])
  @IsString()
  @IsDefined()
  repoType?: string;

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  isPrivate?: boolean;

  @Column("varchar")
  @IsIn(["mit"])
  @IsString()
  @ValidateIf((_, value) => !!value)
  licenseCode?: string;

  @Column("uuid")
  @IsDefined()
  createdByUserId!: string;

  @Column("uuid")
  userId!: string;

  @OneToOne("User", "repositories")
  @JoinColumn()
  user?: Relation<User>;

  @Column("uuid")
  organizationId!: string;

  @OneToOne("Organization", "repositories")
  @JoinColumn()
  organization?: Relation<Organization>;
}