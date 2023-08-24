import {
  IsIn,
  IsInt,
  IsOptional,
  IsSemVer,
  IsString,
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
import { ApiKey } from "./ApiKey";
import { ApiEvent } from "./ApiEvent";
import { Repository } from "./Repository";

@Entity("repository_enabled_api_keys")
export class RepositoryEnabledApiKey extends BinaryPKBaseEntity {

  @Column("varchar", { length: 255 })
  @IsOptional()
  @IsSemVer()
  apiVersion!: string;

  @Column("uuid")
  apiKeyId!: string;

  @ManyToOne("ApiKey", "repositoryEnabledApiKeys")
  @JoinColumn()
  apiKey?: Relation<ApiKey>;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "repositoryEnabledApiKeys")
  @JoinColumn()
  repository?: Relation<Repository>;

  @Column("uuid")
  organizationId!: string;

  @ManyToOne("Organization", "repositoryEnabledApiKeys")
  @JoinColumn()
  organization?: Relation<Organization>;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "repositoryEnabledApiKeys")
  @JoinColumn()
  user?: Relation<User>;

  @Column("uuid")
  createdByUserId!: string;

  @ManyToOne("User", "createdRepositoryEnabledApiKeys")
  @JoinColumn({ name: "created_by_user_id" })
  createdByUser?: Relation<User>;

  @OneToMany("ApiEvent", "repositoryEnabledApiKey")
  @JoinColumn()
  apiEvents?: Relation<ApiEvent>[];
}