import { BookmarkEntity } from 'src/bookmark/entities/bookmark.entity';
import { CommonEntity } from 'src/common/entities/common.entity';
import { UserEntity } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity({
  name: 'box',
})
export class BoxEntity extends CommonEntity {
  @Column({ type: 'varchar', nullable: true, length: 15 })
  boxName: string;

  @Column({ type: 'varchar', nullable: true, length: 200 })
  img: string;

  // relations

  @ManyToOne(() => UserEntity, (user) => user.boxs, {
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

  @OneToMany(() => BookmarkEntity, (boookmark) => boookmark.box, {
    cascade: true,
    // Box를 통해 Bookmark가 추가, 수정, 삭제 되고
    // Box가 저장되면 Bookmark도 저장된다.
  })
  bookmarks: BookmarkEntity[];
}
