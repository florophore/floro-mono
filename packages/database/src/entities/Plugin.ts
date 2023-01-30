import { IsBoolean, IsDefined, IsIn, IsString, IsUUID, ValidateIf } from "class-validator";
import { Entity, Column, OneToOne, Relation, JoinColumn, ManyToOne } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { Organization } from "./Organization";
import { User } from "./User";

@Entity("plugins")
export class Plugin extends BinaryPKBaseEntity {
  @Column("varchar")
  @IsString()
  @IsDefined()
  name!: string;

  @Column("uuid")
  @ValidateIf((_, value) => !!value)
  @IsDefined()
  @IsUUID()
  nameKey!: string;

  @Column("varchar")
  @IsIn(["user_plugin", "org_plugin"])
  @IsString()
  @IsDefined()
  ownerType!: string;

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  isPrivate!: boolean;

  @Column("uuid")
  createdByUserId!: string;

  @ManyToOne("User", "createdPlugins")
  @JoinColumn()
  createdByUser?: Relation<User>;

  @Column("uuid")
  userId!: string;

  @ManyToOne("User", "plugins")
  @JoinColumn()
  user?: Relation<User>;

  @Column("uuid")
  organizationId!: string;

  @ManyToOne("Organization", "plugins")
  @JoinColumn()
  organization?: Relation<Organization>;
}