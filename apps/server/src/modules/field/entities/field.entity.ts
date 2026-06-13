import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Field {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  fieldCode: number // 标识

  @Column({ length: 255 })
  fieldGroup: string // 分组

  @Column({ length: 255 })
  fieldType: 'form' | 'table' | 'button'

  @Column('json')
  fields: any

  @CreateDateColumn()
  createTime: Date

  @UpdateDateColumn()
  updateTime: Date
}
