import { GptHistory } from './gpt-history';
import { Injectable } from '@nestjs/common';
import { CompleteInputDTO, CompleteOutputDTO } from './dto/gpt.dto';
import { ChatOpenAI } from '@langchain/openai';

const DEFAULT_TEMPERATURE = 0.1;
const DEFAULT_MODEL = 'gpt-3.5-turbo';
const SAT_KEYWORDS = [
    'SAT',
    'bài thi',
    'đánh giá',
    'điểm',
    'câu hỏi',
    'luyện thi',
];

@Injectable()
export class GptService {
    private readonly chat: ChatOpenAI;
    private readonly chatHistory: GptHistory;

    constructor() {
        // Prompt được cập nhật để hỗ trợ duyệt câu hỏi SAT
        this.chatHistory = new GptHistory(
            `Bạn là một trợ lý hỗ trợ quản lý trong việc duyệt các câu hỏi dành cho kỳ thi SAT. Khi tôi cung cấp một câu hỏi cùng đáp án, hãy thực hiện các bước sau:
      
      1. Xác định loại câu hỏi: Phân loại câu hỏi này (ví dụ: đại số, hình học, đọc hiểu, từ vựng, phân tích văn bản, v.v.).
      2. **Đánh giá độ khó**: Đánh giá mức độ khó của câu hỏi (dễ, trung bình, khó), và đưa ra lý do tại sao bạn chọn mức độ đó.
      3. **Đề xuất điểm số phù hợp**: Gợi ý số điểm nên được phân bổ cho câu hỏi này dựa trên độ khó và loại câu hỏi.
      4. **Nhận xét tổng quan**: Cung cấp nhận xét về chất lượng của câu hỏi, bao gồm sự rõ ràng, tính phù hợp với kỳ thi SAT, và liệu câu hỏi có khả năng gây nhầm lẫn hay không.
      
      Ví dụ:
      Câu hỏi: "Nếu x = 5 và y = 10, thì tổng của x và y là bao nhiêu?"
      Đáp án: "15."

      Phân tích:
      1. Loại câu hỏi: Đại số cơ bản
      2. Độ khó: Dễ (vì chỉ yêu cầu thực hiện phép cộng đơn giản).
      3. Điểm số phù hợp: 1 điểm (câu hỏi đơn giản, không đòi hỏi phân tích sâu).
      4. Nhận xét: Câu hỏi rõ ràng, phù hợp với cấp độ dễ của kỳ thi DSAT. Không có khả năng gây nhầm lẫn.`,
        );

        this.chat = new ChatOpenAI({
            temperature: DEFAULT_TEMPERATURE,
            openAIApiKey: process.env.API_KEY,
            modelName: DEFAULT_MODEL,
        });
    }

    async getAiModelAnswer(data: CompleteInputDTO) {
        this.chatHistory.addHumanMessage(data.message);

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
