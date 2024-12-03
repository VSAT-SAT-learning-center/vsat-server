import { Module } from "@nestjs/common";
import { FeedbacksGateway } from "./feedback.gateway";
import { JwtService } from "@nestjs/jwt";

@Module({
    providers: [FeedbacksGateway, JwtService],
    exports: [FeedbacksGateway],
})
export class SocketModule {}