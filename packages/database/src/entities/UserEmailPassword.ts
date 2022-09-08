import { IsBoolean, IsDefined, IsHash, IsUUID } from "class-validator";
import {
  Entity,
  Column,
  ManyToOne,
  Relation,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import PasswordHelper from "../contexts/utils/PasswordHelper";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { User } from "./User";
import { UserAuthCredential } from "./UserAuthCredential";

@Entity("user_email_passwords")
export class UserEmailPassword extends BinaryPKBaseEntity {
  password?: string;

  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  isCurrent!: boolean;

  @Column("varchar", { length: 255 })
  hash!: string;

  @Column("varchar", { length: 255 })
  lastHash?: string;

  @Column("uuid")
  userId!: string;

  @Column("uuid")
  userAuthCredentialId!: string;

  @ManyToOne("User", "userEmailPasswords")
  @JoinColumn()
  user!: Relation<User>;

  @ManyToOne("UserAuthCredential", "userEmailPasswords")
  @JoinColumn()
  userAuthCredential?: Relation<UserAuthCredential>;

  @BeforeInsert()
  @BeforeUpdate()
  public hashPassword() {
    if (this.password) {
      this.hash = PasswordHelper.hashPassword(
        this?.user?.id ?? this.userId,
        this.password
      );
    }
  }
}
