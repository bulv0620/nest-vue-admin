import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Dictionary {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 255 })
  dictionaryCode: string // 唯一标识

  @Column({ length: 255 })
  dictionaryLabel: string // 名称

  @Column({ length: 255 })
  dictionaryValue: string // 实际值

  @Column({ default: false })
  disabled: boolean

  @CreateDateColumn()
  createTime: Date

  @UpdateDateColumn()
  updateTime: Date

  @ManyToOne(() => Dictionary, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Dictionary

  @OneToMany(() => Dictionary, (dictionary: Dictionary) => dictionary.parent) // 一对多关系，表示子资源
  children: Dictionary[] // 关联的子资源
}
