import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  BeforeInsert,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm'
import * as bcryptjs from 'bcryptjs'
import { Exclude } from 'class-transformer'
import { Role } from 'src/modules/role/entities/role.entity'

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 50 })
  username: string

  @Column({ length: 256 })
  @Exclude()
  password: string

  @Column({ length: 50 })
  name: string

  @Column({ length: 255 })
  email: string

  @Column({ default: false })
  isAdmin: boolean

  @CreateDateColumn()
  createTime: Date

  @UpdateDateColumn()
  updateTime: Date

  @ManyToMany(() => Role, (role: Role) => role.users, {
    onDelete: 'CASCADE',
  })
  roles: Role[]

  @BeforeInsert()
  async encryptPwd() {
    this.password = bcryptjs.hashSync(this.password)
  }
}
