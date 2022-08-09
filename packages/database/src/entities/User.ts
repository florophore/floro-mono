import { MaxLength, MinLength } from "class-validator";
import {
    Entity,
    Column,
  } from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
  
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
      username?: string = undefined;
  }