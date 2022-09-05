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
  @IsDefined()
  @IsHash("sha256")
  hash!: string;

  @Column("varchar", { length: 255 })
  @IsHash("sha256")
  lastHash?: string;

  @Column("uuid")
  @IsDefined()
  @IsUUID()
  userId!: string;

  @Column("uuid")
  @IsDefined()
  @IsUUID()
  userAuthCredentialId!: string;

  @ManyToOne("User", "userEmailPasswords")
  @JoinColumn()
  user!: Relation<User>;

  @ManyToOne("UserAuthCredential", "userEmailPasswords")
  @JoinColumn()
  userAuthCredential?: Relation<UserAuthCredential>;

  @BeforeInsert()
  @BeforeUpdate()
  protected hashPassword() {
    if (this.password) {
      this.hash = PasswordHelper.hashPassword(this.userId, this.password);
    }
  }
}