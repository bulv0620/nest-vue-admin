import { Resource } from 'src/modules/resource/entities/resource.entity'
import { User } from 'src/modules/user/entities/user.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 50 })
  roleName: string

  @Column({ length: 255 })
  description: string

  @Column({ default: false })
  isDefault: boolean

  @CreateDateColumn()
  createTime: Date

  @UpdateDateColumn()
  updateTime: Date

  @ManyToMany(() => User, (user: User) => user.roles, {
    cascade: true,
  })
  @JoinTable({ name: 'user_role' })
  users: User[]

  @ManyToMany(() => Resource, (resource: Resource) => resource.roles, {
    onDelete: 'CASCADE',
  })
  resources: Resource[]
}
