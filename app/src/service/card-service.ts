import type { CardRequest } from '@/types';
import { Collections, type CardsRecord } from '@/types/pocketbase-types';
import { parsePullSheetCsv, type PullSheetCsv } from '@/util/csv-parse';
import { chunkArray } from '@/util/functions';
import pb from '@/util/pocketbase';

export class CardService {
  create = async (config: { file?: File; cards?: PullSheetCsv[] }) => {
    const { file, cards } = config;
    if ((!file && !cards) || (file && cards)) return;

    const csvData = config.file ? await parsePullSheetCsv(config.file) : config.cards!;
    const cardRequests = this.createRequestsFromCsv(csvData);

    const orderIds = Array.from(new Set(cardRequests.map((c) => c.order))).filter(Boolean);

    const orderIdChunks = chunkArray(orderIds, 75); // maximum query filter size is 3500 chars

    const res: CardsRecord[] = [];

    for (const chunk of orderIdChunks) {
      const filter = chunk.map((id) => `order="${id}"`).join(' || ');
      const chunkRes = await pb.collection(Collections.Cards).getFullList({ filter });
      res.push(...chunkRes);
    }

    const existingKeys = new Set(res.map((rc) => `${rc.order}||${rc.condition}||${rc.set}||${rc.number}||${rc.name}`));

    const newCardRequests = cardRequests.filter((c) => {
      return !existingKeys.has(`${c.order}||${c.condition}||${c.set}||${c.number}||${c.name}`);
    });

    if (!newCardRequests.length) {
      throw new Error('No new cards were found in the CSV.');
    }

    const batch = pb.createBatch();

    newCardRequests.forEach((card) => {
      batch.collection(Collections.Cards).create(card);
    });

    await batch.send();
  };

  createRequestsFromCsv = (csv: PullSheetCsv[]) => {
    const cardRequests: CardRequest[] = [];

    for (const row of csv) {
      const orders = row['Order Quantity'].split('|').map((o) => {
        const [orderNumber, quantity] = o.trim().split(':');
        return { orderNumber, quantity };
      });

      for (const order of orders) {
        const request: CardRequest = {
          name: row['Product Name'],
          condition: row.Condition,
          number: row.Number,
          set: row.Set,
          rarity: row.Rarity,
          order: order.orderNumber,
          quantity: Number(order.quantity)
        };

        cardRequests.push(request);
      }
    }

    return cardRequests;
  };
}
