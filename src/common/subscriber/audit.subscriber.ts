import { Injectable } from '@nestjs/common';
import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    UpdateEvent,
} from 'typeorm';
import { RequestContext } from '../context/request-context';

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
    beforeInsert(event: InsertEvent<any>) {
        const userId = RequestContext.get('userId');
        console.log('UserId from RequestContext in beforeInsert:', userId);
        if (userId && event.entity) {
            event.entity.createdby = userId;
        }
    }

    beforeUpdate(event: UpdateEvent<any>) {
        const userId = RequestContext.get('userId');
        console.log('UserId from RequestContext in beforeUpdate:', userId);
        if (userId && event.entity) {
            event.entity.updatedby = userId;
        }
    }
}
