import { Account } from 'src/database/entities/account.entity';
import { Repository } from 'typeorm';

export async function populateCreatedBy<T>(
    entities: T[],
    accountRepository: Repository<Account>,
): Promise<T[]> {
    const accountIds = new Set<string>();

    entities.forEach((entity: any) => {
        if (entity.createdby) accountIds.add(entity.createdby);
    });

    const accounts = await accountRepository.findByIds(Array.from(accountIds));
    const accountsMap = new Map(accounts.map((account) => [account.id, account]));

    entities.forEach((entity: any) => {
        if (entity.createdby) {
            entity.account = accountsMap.get(entity.createdby) || null;
        }
    });

    return entities;
}
