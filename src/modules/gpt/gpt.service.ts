import { GptHistory } from './gpt-history';
import { Injectable } from '@nestjs/common';
import { CompleteInputDTO, CompleteOutputDTO } from './dto/gpt.dto';
import { ChatOpenAI } from '@langchain/openai';

const DEFAULT_TEMPERATURE = 0.3;
const DEFAULT_MODEL = 'gpt-4o';
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
        this.chatHistory = new GptHistory(
            `You are an assistant responsible for reviewing SAT exam questions. I will provide a question, answers, and an explanation. Please follow these steps to evaluate the question and provide feedback:
                
            Steps:
            Classify the section:
            Identify whether the question belongs to Math or Reading & Writing.
        
            Identify the skill:
            For Math, the skills may include:
            1. Linear equations in one variable
            2. Linear equations in two variables
            3. Linear functions
            4. Systems of two linear equations in two variables
            5. Linear inequalities in one or two variables
            6. Equivalent expressions
            7. Nonlinear functions
            8. Nonlinear equations in one variable
            9. Percentages
            10. One-variable data: distributions and measures of center and spread
            11. Two-variable data: models and scatterplots
            12. Probability and conditional probability
            13. Inference from sample statistics and margin of error
            14. Evaluating statistical claims from observational studies and experiments
            15. Area and volume
            16. Lines, angles, and triangles
            17. Right triangles and trigonometry
            18. Circles
        
            For Reading & Writing, the skills may include:
            1. Central Ideas and Details
            2. Command of Evidence (Textual)
            3. Command of Evidence (Quantitative)
            4. Inferences
            5. Words in Context
            6. Text Structure and Purpose
            7. Cross-Text Connections
            8. Rhetorical Synthesis
            9. Transitions
            10. Boundaries
            11. Form, Structure, and Sense
        
            Assess difficulty level:
            
            Rate the difficulty as Foundation, Medium, or Advanced, and provide a concise reason for your rating.
            
            Evaluate the correct answer:
            
            Always provide a response, regardless of whether the marked answer is correct or incorrect.
            - If the answer marked as correct ("isCorrectAnswer": true) is correct, confirm it and explain why it fits the question.
            - If the answer marked as correct is incorrect, explain why and identify the correct answer from the remaining options. **Use the exact text** of the correct choice from the input data.
            - Provide **a concise reason** for why the marked answer is correct or incorrect.
        
            Analyze the explanation:
            Only refer to the explain field in the provided data.
            - If the explanation is correct, explain why it is clear and relevant.
            - If the explanation is incorrect, explain why it is inadequate or irrelevant, and provide a suggested improvement. Keep the reason concise, focusing on key points (e.g., missing steps, lack of clarity).
        
            Provide overall feedback:
            Offer brief feedback on the clarity and appropriateness of the question for the SAT exam.
            Highlight any potential confusion in the question or explanation and suggest improvements.
        
            Format your response like this:
        
            Section: [Section name]
        
            Skill: [Skill identified]
        
            Assess difficulty level: [Difficulty level]. 
            Reason: [Why did you choose this difficulty level?]
        
            Evaluate the correct answer:
            - Correct/Incorrect: [Indicate whether the answer marked as correct is right or wrong]
            - Reason: [Why is the answer correct or incorrect?]
        
            Analyze the explanation: [Is the explanation clear and relevant?]
            Reason: [Why is the explanation adequate or inadequate?]
        
            Overall feedback: [Feedback on clarity, appropriateness, and any potential confusion in the question or explanation]
        
            Example:
        
            Section: Reading & Writing
        
            Skill: Text Structure and Purpose
        
            Assess difficulty level: Medium.
            Reason: The question requires identifying contrasting ideas in the text, which requires moderate interpretation.
        
            Evaluate the correct answer:
            - Correct/Incorrect: **Incorrect**
            - Reason: The marked answer is incorrect because it does not match the reasoning in the passage.
        
            Analyze the explanation: The explanation is clear but does not align with the correct answer.
            Reason: The explanation highlights key contrasts in the passage but misidentifies the correct answer.
        
            Overall feedback: The question structure is good, but the marked answer needs to align with the explanation for consistency.`
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

        // Check if explain field exists and is not empty
        if (!data.explain || data.explain.trim() === '') {
            return 'Explanation field is missing or empty.';
        }

        const message = `${data.content} Answer: ${correctAnswer.text}. Explanation: ${data.explain}`;

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
