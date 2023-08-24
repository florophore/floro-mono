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
import { WebhookKey } from "./WebhookKey";
import { Repository } from "./Repository";

@Entity("repository_enabled_webhook_keys")
export class RepositoryEnabledWebhookKey extends BinaryPKBaseEntity {

  @Column("varchar", { length: 255 })
  @IsOptional()
  @IsSemVer()
  webhookVersion!: string;

  @Column("varchar", { length: 255 })
  @IsOptional()
  @IsString()
  subdomain?: string|null;

  @Column("varchar", { length: 255 })
  @IsIn(["http", "https"])
  @IsOptional()
  @IsString()
  protocol?: string|null;

  @Column("int")
  @IsOptional()
  @IsInt()
  port?: number|null;

  @Column("varchar", { length: 255 })
  @IsOptional()
  @IsString()
  uri?: string|null;

  @Column("uuid")
  webhookKeyId!: string;

  @ManyToOne("WebhookKey", "repositoryEnabledWebhookKeys")
  @JoinColumn()
  webhookKey?: Relation<WebhookKey>;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "repositoryEnabledWebhookKeys")
  @JoinColumn()
  repository?: Relation<Repository>;

  @Column("uuid")
  organizationId!: string;

  @ManyToOne("Organization", "repositoryEnabledWebhookKeys")
  @JoinColumn()
  organization?: Relation<Organization>;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "repositoryEnabledWebhookKeys")
  @JoinColumn()
  user?: Relation<User>;

  @Column("uuid")
  createdByUserId!: string;

  @ManyToOne("User", "createdRepositoryEnabledWebhookKeys")
  @JoinColumn({ name: "created_by_user_id" })
  createdByUser?: Relation<User>;

  @OneToMany("WebhookEvent", "repositoryEnabledWebhookKey")
  @JoinColumn()
  webhookEvents?: Relation<WebhookKey>[];
}