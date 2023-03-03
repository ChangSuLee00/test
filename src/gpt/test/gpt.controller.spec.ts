import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from 'src/user/entities/user.entity';
import { CreateGpt_A_Dto } from '../dto/create-gpt-answer.dto';
import { CreateGpt_Q_Dto } from '../dto/create-gpt-question.dto';
import { GptController } from '../gpt.controller';
import { GptService } from '../gpt.service';

const mockGptService = () => ({
  question: jest.fn(),
  answer: jest.fn(),
});

describe('GptController', () => {
  let controller: GptController;
  let spyGptService: GptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GptController],
      providers: [{ provide: GptService, useFactory: mockGptService }],
    }).compile();

    controller = module.get<GptController>(GptController);
    spyGptService = module.get<GptService>(GptService);
  });

  describe('Gpt_question', () => {
    it('Gpt question 컨트롤러 통과', async () => {
      const body: CreateGpt_Q_Dto = {
        techStack: 'javascript',
      };
      const user = new UserEntity();
      (spyGptService.question as jest.Mock).mockResolvedValue({});

      // Excute
      const response = await controller.question(user, body);

      // Expect
      expect(spyGptService.question).toBeCalled();
      expect(spyGptService.question).toBeCalledWith(user, body);
      expect(response).toBeTruthy();
    });

    it('Gpt question 컨트롤러 통과 실패', async () => {
      const body: CreateGpt_Q_Dto = {
        techStack: 'javascript',
      };
      const user = new UserEntity();
      (spyGptService.question as jest.Mock).mockRejectedValue(
        new InternalServerErrorException(),
      );
      try {
        // Excute
        const response = await controller.question(user, body);
      } catch (error) {
        // Expect
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('Gpt_answer', () => {
    it('Gpt answer 컨트롤러 통과', async () => {
      const body: CreateGpt_A_Dto = {
        question: 'test_question',
        answer: 'test_answer',
      };
      const user = new UserEntity();
      (spyGptService.answer as jest.Mock).mockResolvedValue({});

      // Excute
      const response = await controller.answer(user, body);

      // Expect
      expect(spyGptService.answer).toBeCalled();
      expect(spyGptService.answer).toBeCalledWith(user, body);
      expect(response).toBeTruthy();
    });

    it('Gpt answer 컨트롤러 통과 실패', async () => {
      const body: CreateGpt_A_Dto = {
        question: 'test_question',
        answer: 'test_answer',
      };
      const user = new UserEntity();
      (spyGptService.answer as jest.Mock).mockRejectedValue(
        new InternalServerErrorException(),
      );
      try {
        // Excute
        const response = await controller.answer(user, body);
      } catch (error) {
        // Expect
        expect(error).toBeTruthy;
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
