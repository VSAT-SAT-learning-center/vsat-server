import {
    EventSubscriber,
    EntitySubscriberInterface,
    InsertEvent,
    UpdateEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RequestContext } from '../context/request-context';

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
    beforeInsert(event: InsertEvent<any>) {
        const userId = RequestContext.get('userId');
        if (userId && event.entity) {
            event.entity.createdby = userId;
        }
    }

    beforeUpdate(event: UpdateEvent<any>) {
        const userId = RequestContext.get('userId');
        if (userId && event.entity) {
            event.entity.updatedby = userId;
        }
    }
}
