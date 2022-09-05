import { IsBoolean, IsDefined, IsIn, IsUUID } from "class-validator";
import {
    Entity,
    Column,
    OneToOne,
    Relation,
    JoinColumn,
  } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { User } from "./User";
  
  @Entity("user_service_agreements")
  export class UserServiceAgreement extends BinaryPKBaseEntity {
  
    @Column("boolean")
    @IsDefined()
    @IsIn([true])
    @IsBoolean()
      agreedToTos?: boolean;

    @Column("boolean")
    @IsDefined()
    @IsIn([true])
    @IsBoolean()
      agreedToPrivacyPolicy?: boolean;

    @Column("uuid")
    @IsDefined()
    @IsUUID()
    userId!: string;

    @OneToOne('User', 'userServiceAgreement')
    @JoinColumn()
      user?: Relation<User>;
  }