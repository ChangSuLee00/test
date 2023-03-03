# Dev-Mark 개발 일지

https://kaput-geometry-436.notion.site/d8230eef4ced4582a6884d3d552734b0?v=0257760f0464402ca87762d4646d063c

# Project : 북마크 관리 + ChatGPT를 이용한 면접 서비스 | 22.01 ~ 22.03

## ChatGPT 기술 면접

<details>
<summary>gpt.service</summary>
<div markdown="1">

```javascript
import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import { UserEntity } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GptEntity } from './entities/gpt.entity';
import { Repository } from 'typeorm';
import { CreateGpt_Q_Dto } from './dto/create-gpt-question.dto';
import { CreateGpt_A_Dto } from './dto/create-gpt-answer.dto';

@Injectable()
export class GptService {
  constructor(
    @InjectRepository(GptEntity)
    private readonly gptRepository: Repository<GptEntity>,
  ) {}

  // Configuration
  configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(this.configuration);

  // Question
  async question(user: UserEntity, gpt: CreateGpt_Q_Dto) {
    // Config Error
    if (!this.configuration.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Input Error
    if (gpt.techStack.trim().length === 0) {
      throw new Error('Please enter a valid tech stack');
    }

    // Generate Question
    try {
      const completion = await this.openai.createCompletion({
        model: 'text-davinci-003',
        prompt: generatePromptQuestion(gpt.techStack),
        temperature: 0.6,
      });

      return { result: completion.data.choices[0].text };

      // Error handle
    } catch (error) {
      // console.error(error);
      if (error.response) {
        throw new Error(error.response.data);
      } else {
        throw new Error('An error occurred during your request');
      }
    }
  }

  // Answer
  async answer(user: UserEntity, gpt: CreateGpt_A_Dto) {
    // Config Error
    if (!this.configuration.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Input Error
    if (gpt.answer.trim().length === 0) {
      throw new Error('Please enter a valid answer');
    }

    // Generate Question
    try {
      const completion = await this.openai.createCompletion({
        model: 'text-davinci-003',
        prompt: generatePrompt(gpt.question, gpt.answer),
        temperature: 0.6,
      });

      return { result: completion.data.choices[0].text };

      // Error handle
    } catch (error) {
      // console.error(error);
      if (error.response) {
        throw new Error(error.response.data);
      } else {
        throw new Error('An error occurred during your request');
      }
    }
  }
}

function generatePromptQuestion(techStack) {
  // Generate Query
  const capitalizedQuestion =
    techStack[0].toUpperCase() + techStack.slice(1).toLowerCase();
  return `Give me tech-interview question
  about: ${capitalizedQuestion}
  in 50character`;
}

function generatePrompt(question, answer) {
  // Generate Query
  const capitalizedQuestion =
    question[0].toUpperCase() + question.slice(1).toLowerCase();
  const capitalizedAnswer =
    answer[0].toUpperCase() + answer.slice(1).toLowerCase();
  return `
  Question: ${capitalizedQuestion}.
  Answer: ${capitalizedAnswer}.
  if Answer is right = give me 'Right'.
  else if Answer is wrong = give me 'Wrong'.
  YOU MUST ANSWER WITHIN 50 CHARACTERS
  `;
}

```

</div>
</details>

<details>
<summary>gpt.service.spec (test)</summary>
<div markdown="1">

```javascript
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

```

</div>
</details>

<img width="943" alt="image" src="https://user-images.githubusercontent.com/98637739/222257318-2b77a528-6c80-40e7-9bdd-7eab9f9eed64.png">

chatGPT의 API를 통해 질문을 받습니다.

<img width="941" alt="image" src="https://user-images.githubusercontent.com/98637739/222258456-078951da-151e-470f-9351-6516dfe780d4.png">

chatGPT의 API를 이용해 질문에 대한 피드백을 받습니다. 

(50 글자 이내의 데모 API만 사용이 가능해 Rigth, Wrong만 판별합니다)

## 북마크 관리

<img width="946" alt="image" src="https://user-images.githubusercontent.com/98637739/222255428-0185660e-355d-4308-bcdf-07c7eefa9966.png">

<img width="947" alt="image" src="https://user-images.githubusercontent.com/98637739/222255874-ddf03967-dab2-4dca-aed4-c73ed722b3d7.png">

## 북마크 알람

<img width="944" alt="image" src="https://user-images.githubusercontent.com/98637739/222256189-5a88e3f9-41ba-455a-ac2b-38d7b480b210.png">


## 북마크 공유 피드

<img width="945" alt="image" src="https://user-images.githubusercontent.com/98637739/222268898-38197cd4-a9d5-4cd0-a168-5d85bea4c429.png">

---

# 서비스 소개

개발 공부를 하며 점점 늘어나는 북마크를 효율적으로 관리하고 싶다는 생각으로 서비스를 만들었습니다.

나중에 보기로 하고 다시 보지 않은 북마크들이 생기지 않도록 알람 기능을 추가하였습니다.

좋은 개발 관련 포스트를 다른 사람과 공유할 수 있는 기능이 있다면 더욱 좋은 서비스가 될 수 있을것 같아 피드 기능을 추가 했습니다.

기술 면접을 준비하면서 질문을 통해 더 많은 것들을 배운다는 것을 알게 되었습니다.

최근 성능을 인정받고 있는 ChatGPT의 데모 API를 이용해 기술면접에 대한 질문을 받고 그에 대한 대답을 피드백 받을 수 있도록 서비스를 만들었습니다. (데모 API이기 때문에 50글자 제한이 있습니다)

---

# 테스트 코드 작성

Unit Test를 작성해가며 Controller와 Service의 유효성을 테스트 했습니다.

![image](https://user-images.githubusercontent.com/98637739/222253623-c5f99914-fd06-4716-910b-43c5fc1590c4.png)

---

# Express -> Nest.js 프레임워크 이전

좋은 설계와 디자인패턴에 대해 공부하고 싶어 

Express로 개발을 완료한 어플리케이션을 Nest.js으로 재작성 했습니다.

Pipe-filter 패턴(DTO), Repository 패턴, Intercepter 패턴, Dependancy Injection을 이용한 의존성 역전 등

Nest.js의 설계에 대해 공부해가며 프로젝트를 만들었습니다.

---

# Architecture

![image](https://user-images.githubusercontent.com/98637739/222233439-1f6401dc-c393-4693-afca-22e655cd3e95.png)

Git Action을 이용해 CI/CD 파이프라인을 구축하였습니다.

Docker를 이용해 Server와 DB를 컨테이너화 하여 EC2 서비스에 업로드 했습니다.

RDS를 이용해 Server의 예상치 못한 종료에 대비해 DB 클라우드화를 했습니다.

Winston과 Daily Logger를 이용해 Log 파일을 관리하도록 했습니다.

Grafana와 CloudWatch를 이용해 인프라 모니터링 체계를 구축 했습니다 (비용문제로 현재는 삭제)

---

# 개발환경

## Backend: Nest.js (9.0.0)

- Database: MySql (3.1.2)

- DB Validation: Joi (17.7.1)

- ORM: TypeORM (0.3.12)

- Login: Json Web Token (passport-jwt 4.0.1)

- Encrypt: Bcrypt (5.0.0)

- Logger: Winston logger (3.8.2)

- Security: Helmet (6.0.1)

- Test: Jest (29.3.1)

## Frontend: React.js (18.2.0)

- bootstrap (5.2.2)

- react-bootstrap (2.7.0)

- axios (1.2.1)

---

# ERD

<img width="485" alt="image" src="https://user-images.githubusercontent.com/98637739/222259745-5799378a-6877-4560-8845-41c3375cba0d.png">

