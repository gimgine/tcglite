import type { ShippingCsvRecord } from '@/types';
import { Collections } from '@/types/pocketbase-types';
import { parseShippingCsv } from '@/util/csv-parse';
import pb from '@/util/pocketbase';

export class OrderService {
  readonly ENVELOPE = { cost: 1, name: 'Envelope' };
  readonly TRACKING = { cost: 5, name: 'Tracking' };
  readonly TRACKING_THRESHOLD = 30;
  readonly TEMP_COGS = 0.26;

  convertCsv = async (file: File) => {
    const parsed = await parseShippingCsv(file);
    const existingOrders = await pb.collection(Collections.Orders).getFullList();
    const newOrders: ShippingCsvRecord[] = [];

    for (const row of parsed) {
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

      if (existingOrders.some((o) => o.orderNumber === newOrder.orderNumber)) {
        continue;
      }

      this.setOrderFinancial(newOrder, true);

      newOrders.push(newOrder);
    }

    return newOrders;
  };

  create = async (orders: ShippingCsvRecord[]) => {
    if (!orders.length) {
      throw new Error('No new orders were found in the CSV.');
    }

    const batch = pb.createBatch();

    orders.forEach((order) => {
      batch.collection(Collections.Orders).create(order);
    });

    await batch.send();
  };

  determineDefaultShippingCost = (totalPrice: number) => {
    return totalPrice >= this.TRACKING_THRESHOLD ? this.TRACKING.cost : this.ENVELOPE.cost;
  };

  setOrderFinancial = (order: ShippingCsvRecord, useDefaultShipping?: boolean) => {
    const totalPrice = order.productValue + order.shippingFee;
    const vendorFee = totalPrice * 0.1025;
    const processingFee = totalPrice * 0.025 + 0.3;
    const cogs = order.itemCount * this.TEMP_COGS;
    const shippingCost = useDefaultShipping
      ? this.determineDefaultShippingCost(totalPrice)
      : (order.shippingCost ?? this.determineDefaultShippingCost(totalPrice));
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
