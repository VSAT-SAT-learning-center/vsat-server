import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteInputDTO {
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class CompleteOutputDTO {
  @IsString()
  @IsNotEmpty()
  aiMessage: string;

  static getInstance(aiMessage: string) {
    const result = new CompleteOutputDTO();
    result.aiMessage = aiMessage;
    return result;
  }
}
