import { Account } from 'src/database/entities/account.entity';
import { Repository } from 'typeorm';

export async function populateCreatedBy<T>(
    entities: T[],
    accountRepository: Repository<Account>
): Promise<T[]> {
    const accountIds = new Set<string>();

    // Collect unique IDs for createdby and updatedby fields
    entities.forEach((entity: any) => {
        if (entity.createdby) accountIds.add(entity.createdby);
        if (entity.updatedby) accountIds.add(entity.updatedby);
    });

    // Fetch all required accounts in a single query
    const accounts = await accountRepository.findByIds(Array.from(accountIds));
    const accountsMap = new Map(accounts.map((acc) => [acc.id, acc]));

    // Replace createdby and updatedby fields with account objects
    entities.forEach((entity: any) => {
        if (entity.createdby) entity.createdby = accountsMap.get(entity.createdby) || entity.createdby;
        if (entity.updatedby) entity.updatedby = accountsMap.get(entity.updatedby) || entity.updatedby;
    });

    return entities;
}
