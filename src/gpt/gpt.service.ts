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
