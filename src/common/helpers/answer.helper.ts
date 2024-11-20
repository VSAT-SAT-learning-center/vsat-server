import sanitizeHtml from 'sanitize-html';

export class AnswerHelper {
    static normalize(content: string): string {
        const strippedContent = sanitizeHtml(content, {
            allowedTags: [],
            allowedAttributes: {},
        });

        return strippedContent.replace(/\s+/g, ' ').trim();
    }
}
