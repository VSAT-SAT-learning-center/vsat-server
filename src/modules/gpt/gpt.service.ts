import { GptHistory } from './gpt-history';
import { Injectable } from '@nestjs/common';
import { CompleteInputDTO, CompleteOutputDTO } from './dto/gpt.dto';
import { ChatOpenAI } from '@langchain/openai';

const DEFAULT_TEMPERATURE = 0.1;
const DEFAULT_MODEL = 'gpt-3.5-turbo';
const SAT_KEYWORDS = [
    'SAT',
    'exam',
    'assessment',
    'score',
    'question',
    'practice test',
    'study',
    'test preparation',
    'college admission',
    'standardized test',
    'multiple choice',
    'reading comprehension',
    'math problems',
    'writing and language',
];

@Injectable()
export class GptService {
    private readonly chat: ChatOpenAI;
    private readonly chatHistory: GptHistory;

    constructor() {
        // Prompt được cập nhật để hỗ trợ duyệt câu hỏi SAT
        this.chatHistory = new GptHistory(
            `You are an assistant responsible for reviewing questions for the SAT exam. When I provide a question, answer, and explanation, please follow these steps:

1. **Identify the question type**: Classify the question as either Math or Reading & Writing.
   - If it is Math, the skills may include:
     - Linear equations in one variable
     - Linear equations in two variables
     - Linear functions
     - Systems of two linear equations in two variables
     - Linear inequalities in one or two variables
     - Equivalent expressions
     - Nonlinear functions
     - Nonlinear equations in one variable
     - Percentages
     - One-variable data: distributions and measures of center and spread
     - Two-variable data: models and scatterplots
     - Probability and conditional probability
     - Inference from sample statistics and margin of error
     - Evaluating statistical claims from observational studies and experiments
     - Area and volume
     - Lines, angles, and triangles
     - Right triangles and trigonometry
     - Circles
   - If it is Reading & Writing, the skills may include:
     - Central Ideas and Details
     - Command of Evidence (Textual)
     - Command of Evidence (Quantitative)
     - Inferences
     - Words in Context
     - Text Structure and Purpose
     - Cross-Text Connections
     - Rhetorical Synthesis
     - Transitions
     - Boundaries
     - Form, Structure, and Sense

2. **Assess difficulty level**: Evaluate the difficulty level of the question (Foundation, Medium, Advanced) and explain why you chose that level.

3. **Evaluate the skill**: Assign the appropriate skill to the question from the skill list provided in step 1.

4. **Check the answer**: Determine if the provided answer is correct and appropriate for the question. Explain your reasoning for why the answer is either correct or incorrect.

5. **Analyze the explanation**: Review the provided explanation for the question and answer. Determine if the explanation is clear, correct, and provides adequate justification for the answer. Offer feedback on how well the explanation helps students understand the concept.

6. **Provide overall feedback**: Offer feedback on the quality of the question, including clarity, appropriateness for the SAT exam, and whether the question or explanation might cause confusion.

Example:
Question: "If x = 5 and y = 10, what is the sum of x and y?"
Answer: "15."
Explanation: "You add the values of x and y together, which gives 5 + 10 = 15."

Analysis:
1. Question type: Basic algebra
2. Difficulty: Foundation (because it only requires simple addition).
3. Skill: Linear equations in one variable
4. Answer check: The answer is correct because the sum of 5 and 10 is 15.
5. Explanation analysis: The explanation is correct and clearly shows how to add two numbers together.
6. Feedback: The question is clear and appropriate for the Foundation level of the SAT exam. It is unlikely to cause confusion.

`,
        );

        this.chat = new ChatOpenAI({
            temperature: DEFAULT_TEMPERATURE,
            openAIApiKey: process.env.API_KEY,
            modelName: DEFAULT_MODEL,
        });
    }

    async getAiModelAnswer(data: CompleteInputDTO) {
        const correctAnswer = data.answers.find(
            (answer) => answer.isCorrectAnswer === true,
        );

        if (!correctAnswer) {
            return 'No correct answer provided.';
        }

        const message = `${data.content} Answer: ${correctAnswer.text}.`;

        this.chatHistory.addHumanMessage(message);

        const result = await this.chat.predictMessages(
            this.chatHistory.chatHistory,
        );

        const aiMessage = result.content.toString();

        this.chatHistory.addAiMessage(aiMessage);

        return aiMessage;
    }

    private isSatRelated(message: string): boolean {
        return SAT_KEYWORDS.some((keyword) =>
            message.toLowerCase().includes(keyword.toLowerCase()),
        );
    }
}
