import { IsDefined, IsEmail } from "class-validator";
import {
  Entity,
  Column,
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";

@Entity("signup_email_reminders")
export class SignupEmailReminder extends BinaryPKBaseEntity {
  @Column("varchar")
  @IsDefined()
  @IsEmail()
  email?: string;
}