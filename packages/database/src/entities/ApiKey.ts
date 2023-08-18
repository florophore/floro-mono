import {
  IsDefined,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Relation,
  OneToMany,
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Organization } from "./Organization";
import { User } from "./User";
import { RepositoryEnabledApiKey } from "./RepositoryEnabledApiKey";
import { ApiEvent } from "./ApiEvent";

@Entity("api_keys")
export class ApiKey extends BinaryPKBaseEntity {
  @Column("varchar", { length: 255 })
  @MinLength(1)
  @MaxLength(255)
  @IsDefined()
  @IsString()
  keyName?: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsIn(["user_key", "org_key"])
  @IsString()
  keyType!: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsString()
  secret!: string;

  @Column("boolean")
  @IsOptional()
  isEnabled!: boolean;

  @Column("boolean")
  @IsOptional()
  isDeleted!: boolean;

  @Column("uuid")
  organizationId!: string;

  @ManyToOne("Organization", "apiKeys")
  @JoinColumn()
  organization?: Relation<Organization>;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "apiKeys")
  @JoinColumn()
  user?: Relation<User>;

  @Column("uuid")
  createByUserId!: string;

  @ManyToOne("User", "createdApiKeys")
  @JoinColumn({ name: "created_by_user_id" })
  createdByUser?: Relation<User>;

  @OneToMany("RepositoryEnabledApiKey", "apiKey")
  @JoinColumn()
  repositoryEnabledApiKeys?: Relation<RepositoryEnabledApiKey>[];

  @OneToMany("ApiEvent", "apiKey")
  @JoinColumn()
  apiEvents?: Relation<ApiEvent>[];
}