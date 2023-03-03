import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { AlarmEntity } from 'src/alarm/entities/alarm.entity';
import { BoxEntity } from 'src/box/entities/box.entity';
import { CommonEntity } from 'src/common/entities/common.entity';
import { FeedEntity } from 'src/feed/entities/feed.entity';
import { GptEntity } from 'src/gpt/entities/gpt.entity';
import { Entity, Column, OneToMany } from 'typeorm';

@Entity({
  name: 'user',
})
export class UserEntity extends CommonEntity {
  @IsEmail()
  @IsNotEmpty({ message: '이메일은 비워져 있을 수 없습니다.' })
  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '닉네임은 비워져 있을 수 없습니다.' })
  @MaxLength(15, { message: '닉네임은 최대 15글자입니다.' })
  @Column({ type: 'varchar', unique: false, nullable: false })
  nick: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  password: string;

  @Column({ default: 'local' })
  provider: string;

  @Column({ type: 'varchar', nullable: true })
  snsId: string;

  // relations

  @OneToMany(() => BoxEntity, (box) => box.user, {
    cascade: true,
    // 사용자를 통해 Box가 추가, 수정, 삭제 되고
    // 사용자가 저장되면 Box도 저장된다.
  })
  boxs: BoxEntity[];
  // OneToMany일때 Many쪽은 복수형 + 엔티티[]

  @OneToMany(() => AlarmEntity, (alarm) => alarm.user, {
    cascade: true,
  })
  alarms: AlarmEntity[];

  @OneToMany(() => FeedEntity, (feed) => feed.user, {
    cascade: true,
  })
  feeds: FeedEntity[];

  @OneToMany(() => GptEntity, (gpt) => gpt.user, {
    cascade: true,
  })
  gpts: GptEntity[];
}
