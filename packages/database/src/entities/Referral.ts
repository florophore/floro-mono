import {
  IsDefined,
  IsEmail,
  IsIn,
  IsInt,
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
import { User } from "./User";

@Entity("referrals")
export class Referral extends BinaryPKBaseEntity {
  @Column("varchar", { length: 255 })
  @MinLength(2)
  @MaxLength(50)
  @ValidateIf((_object, value) => !!value)
  refereeFirstName?: string;

  @Column("varchar", { length: 255 })
  @MinLength(2)
  @MaxLength(50)
  @ValidateIf((_object, value) => !!value)
  refereeLastName?: string;

  @Column("varchar")
  @IsDefined()
  @IsString()
  referrerDeviceId?: string;

  @Column("varchar")
  @ValidateIf((_object, value) => !!value)
  @IsString()
  refereeDeviceId?: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsEmail()
  refereeEmail!: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsEmail()
  refereeNormalizedEmail!: string;

  @Column("varchar", { length: 255 })
  @IsDefined()
  refereeEmailHash!: string;

  @Column("varchar")
  @IsDefined()
  @IsIn(["sent", "invalid", "claimed"])
  @IsString()
  referralState?: string;

  @Column("int", { default: 7 })
  @IsInt()
  @IsDefined()
  ttlDays!: number;

  @Column("bigint", { default: 5368709120 })
  @IsInt()
  @IsDefined()
  referrerRewardBytes!: number;

  @Column("bigint", { default: 5368709120 })
  @IsInt()
  @IsDefined()
  refereeRewardBytes!: number;

  @Column({ name: "last_sent_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  public lastSentAt!: Date;

  @Column({ name: "expires_at", type: "timestamp" })
  public expiresAt!: Date;

  @Column("uuid")
  referrerUserId!: string;

  @ManyToOne("User", "referralsSent")
  @JoinColumn()
  referrerUser?: Relation<User>;

  @Column("uuid")
  refereeUserId!: string;

  @ManyToOne("User", "referralsReceived")
  @JoinColumn()
  refereeUser?: Relation<User>;
}

