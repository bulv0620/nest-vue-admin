import { ResourceType } from '@nest-vue-admin/shared'
import { Role } from 'src/modules/role/entities/role.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Resource {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 50, nullable: true })
  resourceName: string

  @Column({ length: 50 })
  title: string

  @Column({ length: 255, nullable: true })
  path: string

  @Column({ length: 255, nullable: true })
  component: string

  @Column({ length: 255, nullable: true })
  icon: string

  @Column({ type: 'enum', enum: ResourceType })
  type: ResourceType

  @ManyToOne(() => Resource, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Resource

  @OneToMany(() => Resource, (resource: Resource) => resource.parent) // 一对多关系，表示子资源
  children: Resource[] // 关联的子资源

  @Column()
  order: number

  @CreateDateColumn()
  createTime: Date

  @UpdateDateColumn()
  updateTime: Date

  @ManyToMany(() => Role, (role: Role) => role.resources, {
    cascade: true,
  })
  @JoinTable({ name: 'role_resource' })
  roles: Role[]

  available?: boolean
}
