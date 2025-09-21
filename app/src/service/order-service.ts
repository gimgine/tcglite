import { usePreferencesStore } from '@/store/preferences-store';
import type { OrderRequest } from '@/types';
import { Collections, ExpensesTypeOptions, type StorePreferencesRecord } from '@/types/pocketbase-types';
import { parseShippingCsv, type ShippingCsv } from '@/util/csv-parse';
import pb from '@/util/pocketbase';

export class OrderService {
  preferencesStore = usePreferencesStore();

  create = async (config: { file?: File; orders?: ShippingCsv[] }) => {
    const { file, orders } = config;
    if ((!file && !orders) || (file && orders)) return;

    const csvData = config.file ? await parseShippingCsv(config.file) : config.orders!;
    const orderRequests = await this.createRequestsFromCsv(csvData);

    const existingOrderNumbers = new Set((await pb.collection(Collections.Orders).getFullList()).map((o) => o.id));
    const newOrderRequests = orderRequests.filter((order) => !existingOrderNumbers.has(order.id));

    if (!newOrderRequests.length) {
      throw new Error('No new orders were found in the CSV.');
    }

    const batch = pb.createBatch();

    newOrderRequests.forEach((order) => {
      batch.collection(Collections.Orders).create(order);
    });

    await batch.send();
  };

  getAverageCogs = async () => {
    const cardExpenses = (await pb.collection(Collections.Expenses).getFullList()).filter((e) => e.type === ExpensesTypeOptions.cards);
    const totalSpentOnCards = cardExpenses.reduce((sum, expense) => sum + (expense.price ?? 0), 0);
    const quantityCardsPurchased = cardExpenses.reduce((sum, expense) => sum + (expense.quantity ?? 0), 0);
    return totalSpentOnCards / quantityCardsPurchased;
  };

  refreshProfit = async (historicalCogs: { date: string; averageCogs: number }[]) => {
    const orders = await pb.collection(Collections.Orders).getFullList();

    const batch = pb.createBatch();

    orders.forEach((order) => {
      for (let i = 0; i < historicalCogs.length; i++) {
        const orderDateMs = new Date(order.orderDate).getTime();

        if (!(i === historicalCogs.length - 1) && orderDateMs >= new Date(historicalCogs[i + 1].date).getTime()) {
          continue;
        }

        const newCogsForOrder = order.itemCount * historicalCogs[i].averageCogs;
        batch.collection(Collections.Orders).update(order.id, {
          date: order.orderDate,
          cogs: newCogsForOrder,
          profit: order.totalPrice - order.vendorFee - order.processingFee - newCogsForOrder - order.shippingCost
        });
        break;
      }
    });

    await batch.send();
  };

  private createRequestsFromCsv = async (csv: ShippingCsv[]) => {
    const orderRequests: OrderRequest[] = [];

    const avgCogs = await this.getAverageCogs();

    for (const row of csv) {
      const [year, month, day] = (row['Order Date'] ?? '0000-00-00').split('-');
      const newOrder: OrderRequest = {
        id: row['Order #'],
        firstName: row.FirstName,
        lastName: row.LastName,
        address: row.Address1,
        addressTwo: row.Address2,
        city: row.City,
        state: row.State,
        postalCode: row.PostalCode,
        country: row.Country,
        orderDate: new Date(Date.UTC(+year, +month - 1, +day, 12, 0, 0)),
        productWeight: row['Product Weight'],
        shippingMethod: row['Shipping Method'],
        itemCount: row['Item Count'],
        productValue: row['Value Of Products'],
        shippingFee: row['Shipping Fee Paid'],
        trackingNumber: row['Tracking #'],
        carrier: row.Carrier,
        store: pb.authStore.record?.store
      };

      this.setOrderFinancial(newOrder, avgCogs);

      orderRequests.push(newOrder);
    }

    return orderRequests;
  };

  public determineWeight = (itemCount: number, preferences: StorePreferencesRecord) => {
    if (itemCount <= preferences.oneOunceCards!) {
      return 1;
    } else if (itemCount <= preferences.twoOunceCards!) {
      return 2;
    } else if (itemCount <= preferences.threeOunceCards!) {
      return 3;
    } else {
      return -1; // used to signify "more ounces"
    }
  };

  public determineTracking = (totalPrice: number, preferences: StorePreferencesRecord) => {
    return totalPrice >= preferences.trackingThreshold!;
  };

  public determineShippingCost = (totalPrice: number, itemCount: number, preferences: StorePreferencesRecord) => {
    if (totalPrice >= this.preferencesStore.preferences!.trackingThreshold) {
      return this.preferencesStore.preferences!.trackingCost;
    }

    if (itemCount <= preferences.oneOunceCards!) {
      return preferences.oneOunceCost!;
    } else if (itemCount <= preferences.twoOunceCards!) {
      return preferences.twoOunceCost!;
    } else if (itemCount <= preferences.threeOunceCards!) {
      return preferences.threeOunceCost!;
    } else {
      return preferences.moreOunceCost!;
    }
  };

  public determineProfit = (totalPrice: number, vendorFee: number, processingFee: number, cogs: number, shippingCost: number) => {
    return totalPrice - vendorFee - processingFee - cogs - shippingCost;
  };

  private setOrderFinancial = (order: OrderRequest, avgCogs: number) => {
    const totalPrice = order.productValue + order.shippingFee;
    const vendorFee = totalPrice * 0.1025;
    const processingFee = totalPrice * 0.025 + 0.3;
    const cogs = order.itemCount * avgCogs;
    const shippingCost = this.determineShippingCost(totalPrice, order.itemCount, this.preferencesStore.preferences!);
    const packageOunces = this.determineWeight(order.itemCount, this.preferencesStore.preferences!);
    const isTracking = this.determineTracking(totalPrice, this.preferencesStore.preferences!);
    const profit = this.determineProfit(totalPrice, vendorFee, processingFee, cogs, shippingCost);
    const feePercentage = ((vendorFee + processingFee) / totalPrice) * 100;

    order.totalPrice = totalPrice;
    order.vendorFee = vendorFee;
    order.processingFee = processingFee;
    order.cogs = cogs;
    order.shippingCost = shippingCost;
    order.packageOunces = packageOunces;
    order.isTracking = isTracking;
    order.profit = profit;
    order.feePercentage = feePercentage;
  };
}
