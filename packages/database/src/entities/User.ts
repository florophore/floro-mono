import { MaxLength, MinLength } from "class-validator";
import { Entity, Column, OneToMany, OneToOne, Relation } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { UserAuthCredential } from "./UserAuthCredential";
import { UserEmailPassword } from "./UserEmailPassword";
import { UserServiceAgreement } from "./UserServiceAgreement";

@Entity("users")
export class User extends BinaryPKBaseEntity {
  @Column("varchar", { length: 255 })
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @Column("varchar", { length: 255 })
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @Column("varchar", { length: 255 })
  @MinLength(1)
  @MaxLength(30)
  username?: string;

  @OneToMany("UserAuthCredential", "user")
  userAuthCrentials?: Relation<UserAuthCredential>[];

  @OneToMany("UserEmailPassword", "user")
  userEmailPasswords?: Relation<UserEmailPassword>[];

  @OneToOne("UserServiceAgreement", "user")
  userServiceAgreement?: Relation<UserServiceAgreement>;
}
