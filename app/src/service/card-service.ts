import type { CardRequest } from '@/types';
import { Collections } from '@/types/pocketbase-types';
import { parsePullSheetCsv, type PullSheetCsv } from '@/util/csv-parse';
import pb from '@/util/pocketbase';

export class CardService {
  create = async (config: { file?: File; cards?: PullSheetCsv[] }) => {
    const { file, cards } = config;
    if ((!file && !cards) || (file && cards)) return;

    const csvData = config.file ? await parsePullSheetCsv(config.file) : config.cards!;
    const cardRequests = this.createRequestsFromCsv(csvData);

    const orderIds = Array.from(new Set(cardRequests.map((c) => c.order))).filter(Boolean);
    const res = orderIds.length
      ? await pb.collection(Collections.Cards).getFullList({ filter: orderIds.map((id) => `order="${id}"`).join(' || ') })
      : [];

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
