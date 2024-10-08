import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";


export class GptHistory{
    readonly chatHistory : BaseMessage[];

    constructor(systemMessage? : string){
        this.chatHistory = [];

        if (systemMessage){
            this.addSystemMessage(systemMessage);
        }
    }

    private addSystemMessage(message: string){
        this.chatHistory.push(new SystemMessage(message));
    }

    addAiMessage(message: string){
        this.chatHistory.push(new AIMessage(message));
    }

    addHumanMessage(message: string){
        this.chatHistory.push(new HumanMessage(message));
    }
}