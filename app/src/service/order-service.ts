import type { ShippingCsvRecord } from '@/types';
import { Collections } from '@/types/pocketbase-types';
import { parseShippingCsv, type ShippingCsv } from '@/util/csv-parse';
import pb from '@/util/pocketbase';

export class OrderService {
  readonly ENVELOPE = { cost: 1, name: 'Envelope' };
  readonly TRACKING = { cost: 5, name: 'Tracking' };
  readonly SHIPPING_METHODS = [this.ENVELOPE, this.TRACKING];
  readonly TRACKING_THRESHOLD = 35;
  readonly TEMP_COGS = 0.26;

  create = async (config: { file?: File; orders?: ShippingCsv[] }) => {
    const { file, orders } = config;
    if ((!file && !orders) || (file && orders)) return;

    const csvData = config.file ? await parseShippingCsv(config.file) : config.orders!;
    const newOrders = this.convertCsv(csvData);

    const existingOrderNumbers = new Set((await pb.collection(Collections.Orders).getFullList()).map((o) => o.orderNumber));
    const filteredNewOrders = newOrders.filter((order) => !existingOrderNumbers.has(order.orderNumber));

    if (!filteredNewOrders.length) {
      throw new Error('No new orders were found in the CSV.');
    }

    const batch = pb.createBatch();

    filteredNewOrders.forEach((order) => {
      batch.collection(Collections.Orders).create(order);
    });

    await batch.send();
  };

  getShippingMethod = (shippingCost: number) => {
    return this.SHIPPING_METHODS.find((sm) => sm.cost === shippingCost);
  };

  private convertCsv = (csv: ShippingCsv[]) => {
    const newOrders: ShippingCsvRecord[] = [];

    for (const row of csv) {
      const [year, month, day] = (row['Order Date'] ?? '0000-00-00').split('-');
      const newOrder: ShippingCsvRecord = {
        orderNumber: row['Order #'],
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
        carrier: row.Carrier
      };

      this.setOrderFinancial(newOrder);

      newOrders.push(newOrder);
    }

    return newOrders;
  };

  determineDefaultShippingCost = (totalPrice: number) => {
    return totalPrice >= this.TRACKING_THRESHOLD ? this.TRACKING.cost : this.ENVELOPE.cost;
  };

  setOrderFinancial = (order: ShippingCsvRecord) => {
    const totalPrice = order.productValue + order.shippingFee;
    const vendorFee = totalPrice * 0.1025;
    const processingFee = totalPrice * 0.025 + 0.3;
    const cogs = order.itemCount * this.TEMP_COGS;
    const shippingCost = this.determineDefaultShippingCost(totalPrice);
    const profit = totalPrice - vendorFee - processingFee - cogs - shippingCost;
    const feePercentage = ((vendorFee + processingFee) / totalPrice) * 100;

    order.totalPrice = totalPrice;
    order.vendorFee = vendorFee;
    order.processingFee = processingFee;
    order.cogs = cogs;
    order.shippingCost = shippingCost;
    order.profit = profit;
    order.feePercentage = feePercentage;
  };
}
