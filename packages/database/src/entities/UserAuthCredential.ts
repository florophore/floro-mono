import { IsIn, IsBoolean, IsEmail, IsDefined } from "class-validator";
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  Relation,
  JoinColumn,
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { User } from "./User";
import { UserEmailPassword } from "./UserEmailPassword";

@Entity("user_auth_credentials")
export class UserAuthCredential extends BinaryPKBaseEntity {
  /**
   *  credential type
   */
  @Column("varchar", { length: 255 })
  @IsIn(["email_pass", "google_oauth", "github_oauth"])
  credentialType!: string;

  /**
   *  used to denote the credential used for signing up
   */
  @Column("boolean")
  @IsDefined()
  @IsBoolean()
  isSignupCredential!: boolean;

  /**
   *  raw unprocessed email address, no need to check credentials against
   */
  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsEmail()
  email!: string;

  /**
   *  this ensures a one to one account to email address relationship
   */
  @Column("varchar", { length: 255 })
  @IsDefined()
  @IsEmail()
  normalizedEmail!: string;

  /**
   *  we can cluster and search against the hash for any credential, also in case of pii removal, we can maintain the hash
   * which separates some login/reactivate/disablement concerns
   */
  @Column("varchar", { length: 255 })
  @IsDefined()
  emailHash!: string;

  /**
   *  if third party verified, this will be true. If not third party login then this indicates if account has been
   * verified.
   * Notable rules:
   * 1) An unverified email OR third party account cannot be used for billing.
   * 2) An unverified email, can be changed by user without re-verification if no oauth login exists for the email address.
   * 3) An unverified email, can only be changed by user via re-verification if prior oauth login exists or credential is verified
   */
  @Column("boolean")
  @IsDefined()
  isVerified!: boolean;

  /**
   * if third party verified am email_credential passphrase can be used for billing. By default a third party verified login will be verified
   * on floro end
   */
  @Column("boolean")
  isThirdPartyVerified?: boolean;

  /**
   * credential is disabled for login via floro admin. e.g. if disabled the credential cannot be used.
   */
  @Column("boolean")
  isDisabled = false;

  /**
   * if enabled, we can relax some frictions on our end knowing 2fa exists on 3pa level
   */
  @Column("boolean")
  hasThirdPartyTwoFactorEnabled?: boolean;

  /**
   * return access token last used by either git or google
   */
  @Column("varchar", { length: 255 })
  accessToken?: string;

  /**
   *  search again this for google login
   */
  @Column("varchar", { length: 255 })
  googleId?: string;

  @Column("varchar", { length: 255 })
  googleGivenName?: string;

  @Column("varchar", { length: 255 })
  googleFamilyName?: string;

  @Column("varchar", { length: 255 })
  googleLocale?: string;

  @Column("integer")
  githubId?: number;

  /**
   *  we should prefer this id over github ID
   */
  @Column("varchar", { length: 255 })
  githubNodeId?: string;

  /**
   *  github username
   */
  @Column("varchar", { length: 255 })
  githubLogin?: string;

  @Column("varchar", { length: 255 })
  githubName?: string;

  @Column("varchar", { length: 255 })
  githubCompany?: string;

  @Column("uuid")
  userId?: string;

  @ManyToOne("User", "userAuthCrentials")
  @JoinColumn()
  user?: User;

  @OneToMany("UserEmailPassword", "userAuthCredential")
  userEmailPasswords?: Relation<UserEmailPassword>[];
}
