import {
    IsBoolean,
  IsDefined,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsSemVer,
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
import { OrganizationInvitationRole } from "./OrganizationInvitationRole";
import { OrganizationMember } from "./OrganizationMember";
import { User } from "./User";
import { RepositoryEnabledApiKey } from "./RepositoryEnabledApiKey";
import { RepositoryEnabledWebhookKey } from "./RepositoryEnabledWebhookKey";
import { ApiKey } from "./ApiKey";
import { Repository } from "./Repository";
import { WebhookKey } from "./WebhookKey";

@Entity("webhook_events")
export class WebhookEvent extends BinaryPKBaseEntity {

  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsString()
  webhookTrackingId?: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsSemVer()
  webhookVersion!: string;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  didSucceed!: boolean;

  @Column("int")
  @IsOptional()
  @IsInt()
  attemptCount!: number;

  @Column("varchar", { length: 255})
  @IsDefined()
  @IsString()
  hookUrl!: string;

  @Column("varchar", { length: 255})
  @IsOptional()
  @IsString()
  payloadHash!: string;

  @Column("integer")
  @IsOptional()
  @IsInt()
  statusCode!: number;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "webhookEvents")
  @JoinColumn()
  repository?: Relation<Repository>;

  @Column("uuid")
  webhookKeyId!: string;

  @ManyToOne("WebhookKey", "webhookEvents")
  @JoinColumn()
  webhookKey?: Relation<WebhookKey>;

  @Column("uuid")
  repositoryEnabledWebhookKeyId!: string;
}