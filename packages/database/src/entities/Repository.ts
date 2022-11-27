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
  name!: string;

  @Column("varchar")
  @IsIn(["user_repo", "org_repo"])
  @IsString()
  @IsDefined()
  repoType!: string;

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  isPrivate!: boolean;

  @Column("varchar")
  @IsIn([
    "apache_2",
    "gnu_general_public_3",
    "mit",
    "bsd2_simplified",
    "bsd3_new_or_revised",
    "boost",
    "creative_commons_zero_1_0",
    "eclipse_2",
    "gnu_affero_3",
    "gnu_general_2",
    "gnu_lesser_2_1",
    "mozilla_2",
    "unlicense",
  ])
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