import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from 'src/user/entities/user.entity';
import { GptService } from '../gpt.service';

class MockOpenAI {
  constructor(private readonly configuration: any) {}
  async createCompletion_Q(gpt) {
    if (gpt.techStack) {
      return 'mock text';
    } else {
      throw new Error('An error occurred during your request');
    }
  }
  async createCompletion_A(gpt) {
    if (gpt.answer) {
      return 'mock text';
    } else {
      throw new Error('An error occurred during your request');
    }
  }
}

const config = {
  apiKey: 'mock-api-key',
};

const configuration = {
  apiKey: config.apiKey,
};

const openai = new MockOpenAI(configuration);

const mockGptService = () => ({
  question: jest.fn((user: UserEntity, gpt: any) => {
    if (!configuration.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    if (gpt.techStack.trim().length === 0) {
      throw new Error('Please enter a valid tech stack');
    }
    return openai.createCompletion_Q(gpt);
  }),

  answer: jest.fn((user: UserEntity, gpt: any) => {
    if (!configuration.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    if (gpt.answer.trim().length === 0) {
      throw new Error('Please enter a valid answer');
    }
    return openai.createCompletion_A(gpt);
  }),
  configuration,
  openai,
});

describe('GptService', () => {
  let spyGptService: GptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: GptService, useFactory: mockGptService }],
    }).compile();

    spyGptService = module.get<GptService>(GptService);
  });

  describe('Question', () => {
    const user = new UserEntity();
    const body = { techStack: 'javascript' };

    it('API_KEY 없을때 Error', async () => {
      configuration.apiKey = null;
      await expect(() => spyGptService.question(user, body)).toThrow(
        'OpenAI API key not configured',
      );
    });

    it('techStack 잘못 입력 되었을때 Error', async () => {
      configuration.apiKey = 'mock-api-key';
      body.techStack = ' ';
      await expect(() => spyGptService.question(user, body)).toThrow(
        'Please enter a valid tech stack',
      );
    });

    it('techStack 없을때 Error', async () => {
      configuration.apiKey = 'mock-api-key';
      body.techStack = null;
      await expect(() => spyGptService.question(user, body)).toThrowError();
    });

    it('질문 생성 성공', async () => {
      body.techStack = 'javascript';
      const response = await spyGptService.question(user, body);
      expect(response).toEqual('mock text');
    });
  });

  describe('Answer', () => {
    const user = new UserEntity();
    const body = { question: 'javascript', answer: 'good' };

    it('API_KEY 없을때 Error', async () => {
      configuration.apiKey = null;
      await expect(() => spyGptService.answer(user, body)).toThrow(
        'OpenAI API key not configured',
      );
    });

    it('answer 잘못 입력 되었을때 Error', async () => {
      configuration.apiKey = 'mock-api-key';
      body.answer = ' ';
      await expect(() => spyGptService.answer(user, body)).toThrow(
        'Please enter a valid answer',
      );
    });

    it('answer 없을때 Error', async () => {
      configuration.apiKey = 'mock-api-key';
      body.answer = null;
      await expect(() => spyGptService.answer(user, body)).toThrowError();
    });

    it('답변 생성 성공', async () => {
      body.answer = 'good';
      const response = await spyGptService.answer(user, body);
      expect(response).toEqual('mock text');
    });
  });
});
