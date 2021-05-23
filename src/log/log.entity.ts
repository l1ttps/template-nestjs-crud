import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { LogType } from "./log_type.enum";

@Entity({ name: 'log' })
export class Log {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: LogType;

    @Column()
    message: string;

    @Column()
    createDate: Date


}