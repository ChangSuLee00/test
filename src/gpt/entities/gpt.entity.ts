import { CommonEntity } from 'src/common/entities/common.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({
  name: 'gpt',
})
export class GptEntity extends CommonEntity {
  @Column({ type: 'varchar', nullable: true })
  techStack;
  @Column({ type: 'varchar', nullable: true })
  question;

  @ManyToOne(() => UserEntity, (user) => user.gpts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  ])
  user: UserEntity;
}
