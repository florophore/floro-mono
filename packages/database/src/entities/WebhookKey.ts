import {
  IsBoolean,
  IsDefined,
  IsIn,
  IsInt,
  IsOptional,
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
import { RepositoryEnabledWebhookKey } from "./RepositoryEnabledWebhookKey";

@Entity("webhook_keys")
export class WebhookKey extends BinaryPKBaseEntity {
  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsString()
  domain?: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsIn(["user_key", "org_key"])
  @IsString()
  keyType!: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsString()
  secret!: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsString()
  dnsVerificationCode!: string;

  @Column("varchar", { length: 255 })
  @IsOptional()
  @IsString()
  defaultSubdomain!: string;

  @Column("varchar", { length: 255 })
  @IsIn(["http", "https"])
  @IsOptional()
  @IsString()
  defaultProtocol!: string;

  @Column("int")
  @IsOptional()
  @IsInt()
  defaultPort!: number;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isEnabled!: boolean;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isVerified!: boolean;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  isDeleted!: boolean;

  @Column("uuid")
  organizationId!: string;

  @ManyToOne("Organization", "webhookKeys")
  @JoinColumn()
  organization?: Relation<Organization>;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "webhookKeys")
  @JoinColumn()
  user?: Relation<User>;

  @Column("uuid")
  createByUserId!: string;

  @ManyToOne("User", "createdWebhookKeys")
  @JoinColumn({ name: "created_by_user_id" })
  createdByUser?: Relation<User>;

  @OneToMany("RepositoryEnabledWebhookKey", "webhookKey")
  @JoinColumn()
  repositoryEnabledWebhookKeys?: Relation<RepositoryEnabledWebhookKey>[];

  @OneToMany("WebhookEvent", "webhookKey")
  @JoinColumn()
  webhookEvents?: Relation<WebhookKey>[];

}