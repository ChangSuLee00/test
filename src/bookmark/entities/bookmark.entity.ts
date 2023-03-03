import { BoxEntity } from 'src/box/entities/box.entity';
import { CommonEntity } from 'src/common/entities/common.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({
  name: 'bookmark',
})
export class BookmarkEntity extends CommonEntity {
  @Column({ type: 'varchar', nullable: false, length: 15 })
  bookmarkName: string;

  @Column({ length: 2083, type: 'varchar', nullable: false })
  URL: string;

  // relations

  @ManyToOne(() => BoxEntity, (box) => box.bookmarks, {
    onDelete: 'CASCADE',
    // Box가 삭제되면 Bookmark도 삭제된다.
  })
  @JoinColumn([
    // foreign key 정보들
    {
      name: 'box_id',
      // db에 저장되는 필드 이름
      referencedColumnName: 'id',
      // BOX의 id
    },
  ])
  box: BoxEntity;
}
