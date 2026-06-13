import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Example {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  exampleCode: string

  @Column({ length: 255 })
  exampleName: string

  @Column({ length: 255 })
  exampleDesc: string

  @CreateDateColumn()
  createTime: Date

  @UpdateDateColumn()
  updateTime: Date
}
