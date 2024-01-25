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

@Entity("api_events")
export class ApiEvent extends BinaryPKBaseEntity {
  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsString()
  apiTrackingId?: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsSemVer()
  apiVersion!: string;

  @Column("boolean")
  @IsOptional()
  @IsBoolean()
  didSucceed!: boolean;

  @Column("int")
  @IsOptional()
  @IsInt()
  statusCode!: number;

  @Column("varchar", { length: 255})
  @IsDefined()
  @IsString()
  requestPath!: string;

  @Column("varchar", { length: 255})
  @IsDefined()
  @IsString()
  httpVerb!: string;

  @Column("varchar", { length: 255})
  @IsOptional()
  @IsString()
  payloadHash!: string;

  @Column("uuid")
  repositoryId!: string;

  @ManyToOne("Repository", "apiEvents")
  @JoinColumn()
  repository?: Relation<Repository>;

  @Column("uuid")
  apiKeyId!: string;

  @ManyToOne("ApiKey", "apiEvents")
  @JoinColumn()
  apiKey?: Relation<ApiKey>;

  @Column("uuid")
  repositoryEnabledApiKeyId!: string;
}