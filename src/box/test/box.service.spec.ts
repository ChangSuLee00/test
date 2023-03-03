import { Test, TestingModule } from '@nestjs/testing';
import { BoxService } from '../box.service';
import { BoxRepository } from '../repository/box.repository';
import { CreateBoxDto } from '../dto/create-box.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateBoxDto } from '../dto/update-box.dto';

jest.mock('bcrypt');

const mockBoxRepository = () => ({
  createBox: jest.fn(),
  findAllBoxByUserId: jest.fn(),
  updateBox: jest.fn(),
  deleteBox: jest.fn(),
  deleteImg: jest.fn(),
});

describe('BoxService', () => {
  let spyBoxService: BoxService;
  let spyBoxRepository: BoxRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoxService,
        {
          provide: BoxRepository,
          useFactory: mockBoxRepository,
        },
      ],
    }).compile();

    spyBoxService = module.get<BoxService>(BoxService);
    spyBoxRepository = module.get<BoxRepository>(BoxRepository);
  });

  describe('createBox', () => {
    const createBoxDto: CreateBoxDto = {
      boxName: 'test_boxname',
      img: 'test_img',
      user_id: 1,
    };

    it('새 박스 생성', async () => {
      // Method Mocking
      (spyBoxRepository.createBox as jest.Mock).mockReturnValue(null);

      // Excute
      const result = await spyBoxService.create(createBoxDto);

      // Expect
      expect(spyBoxRepository.createBox).toBeCalled();
      expect(spyBoxRepository.createBox).toBeCalledWith({
        boxName: createBoxDto.boxName,
        img: createBoxDto.img,
        user_id: createBoxDto.user_id,
      });
      expect(result).toEqual({ status: 201, success: true });
    });

    it('새 박스 생성 실패', async () => {
      // Method Mocking
      (spyBoxRepository.createBox as jest.Mock).mockRejectedValue(
        new InternalServerErrorException(),
      );
      try {
        // Excute
        const result = await spyBoxService.create(createBoxDto);
      } catch (error) {
        // Expect
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('findAll', () => {
    const user_id = 1;

    it('박스 찾기 성공', async () => {
      // Method Mocking
      (spyBoxRepository.findAllBoxByUserId as jest.Mock).mockReturnValue({
        box: 1,
      });

      // Excute
      const result = await spyBoxService.findAll(user_id);

      // Expect
      expect(spyBoxRepository.findAllBoxByUserId).toBeCalled();
      expect(spyBoxRepository.findAllBoxByUserId).toBeCalledWith(user_id);
      expect(result).toEqual({ box: 1 });
    });

    it('박스 찾기 실패', async () => {
      // Method Mocking
      (spyBoxRepository.findAllBoxByUserId as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );
      try {
        // Excute
        const result = await spyBoxService.findAll(user_id);
      } catch (error) {
        // Expect
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('update', () => {
    const body: UpdateBoxDto = {
      boxName: 'test_boxname',
      img: 'test_img',
      user_id: 1,
      boxId: '1',
      deleteImg: 'test_delete',
    };

    it('박스 업데이트 성공', async () => {
      // Method Mocking
      (spyBoxRepository.updateBox as jest.Mock).mockReturnValue(true);
      (spyBoxRepository.deleteImg as jest.Mock).mockReturnValue(null);

      // Excute
      const result = await spyBoxService.update(body);

      // Expect
      expect(spyBoxRepository.updateBox).toBeCalledWith(body);
      expect(spyBoxRepository.deleteImg).toBeCalledWith(body);
      expect(result).toEqual({ status: 200, success: true });
    });

    it('박스 업데이트 실패(updatedBox 없는 경우)', async () => {
      // Method Mocking
      (spyBoxRepository.updateBox as jest.Mock).mockReturnValue(null);

      // Excute
      const result = await spyBoxService.update(body);

      // Expect
      expect(spyBoxRepository.updateBox).toBeCalledWith(body);
      expect(result).toEqual({ status: 422, success: false });
    });

    it('박스 업데이트 실패(repository.updateBox에서 에러)', async () => {
      // Method Mocking
      (spyBoxRepository.updateBox as jest.Mock).mockRejectedValue(
        new InternalServerErrorException(),
      );
      try {
        // Expect
        const result = await spyBoxService.update(body);
      } catch (error) {
        // Expect
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });

    it('박스 업데이트 실패(repository.deleteImg에서 에러)', async () => {
      // Method Mocking
      (spyBoxRepository.updateBox as jest.Mock).mockReturnValue(true);
      (spyBoxRepository.deleteImg as jest.Mock).mockRejectedValue(
        new InternalServerErrorException(),
      );
      try {
        // Expect
        const result = await spyBoxService.update(body);
      } catch (error) {
        // Expect
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('delete', () => {
    const body = { boxId: 1, deleteImg: 'delete_img' };
    it('박스 삭제 성공', async () => {
      // Method Mocking
      (spyBoxRepository.deleteBox as jest.Mock).mockReturnValue(true);
      (spyBoxRepository.deleteImg as jest.Mock).mockReturnValue(null);

      // Excute
      const result = await spyBoxService.remove(body);

      // Expect
      expect(spyBoxRepository.deleteBox).toBeCalledWith(body);
      expect(spyBoxRepository.deleteImg).toBeCalledWith(body);
      expect(result).toEqual({ status: 200, success: true });
    });

    it('박스 삭제 실패(deletedBox 없는 경우)', async () => {
      // Method Mocking
      (spyBoxRepository.deleteBox as jest.Mock).mockReturnValue(null);

      // Excute
      const result = await spyBoxService.remove(body);

      // Expect
      expect(spyBoxRepository.deleteBox).toBeCalledWith(body);
      expect(result).toEqual({ status: 422, success: false });
    });

    it('박스 업데이트 실패(repository.deleteBox에서 에러)', async () => {
      // Method Mocking
      (spyBoxRepository.deleteBox as jest.Mock).mockRejectedValue(
        new InternalServerErrorException(),
      );
      try {
        // Expect
        const result = await spyBoxService.remove(body);
      } catch (error) {
        // Expect
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });

    it('박스 업데이트 실패(repository.deleteImg에서 에러)', async () => {
      // Method Mocking
      (spyBoxRepository.deleteBox as jest.Mock).mockReturnValue(true);
      (spyBoxRepository.deleteImg as jest.Mock).mockRejectedValue(
        new InternalServerErrorException(),
      );
      try {
        // Expect
        const result = await spyBoxService.remove(body);
      } catch (error) {
        // Expect
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
