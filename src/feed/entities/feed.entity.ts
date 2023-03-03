import { CommonEntity } from 'src/common/entities/common.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({
  name: 'feed',
})
export class FeedEntity extends CommonEntity {
  @Column({ nullable: false, length: 15 })
  FeedName: string;

  @Column({ nullable: false, length: 15 })
  FeedContent: string;

  @Column({ length: 200, nullable: true })
  img: string;

  @Column({ length: 2083 })
  URL: string;

  // relations

  @ManyToOne(() => UserEntity, (user) => user.feeds, {
    onDelete: 'CASCADE',
    // 사용자가 삭제되면 블로그도 삭제된다.
  })
  @JoinColumn([
    // foreign key 정보들
    {
      name: 'user_id',
      // db에 저장되는 필드 이름
      referencedColumnName: 'id',
      // USER의 id
    },
  ])
  user: UserEntity;
}
