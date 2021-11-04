export interface Order {
    id: string;
    customerId: string;
    date: Date;
    status: OrderStatus;
    items: OrderItem[];
}

export interface OrderItem {
    id: number;
    productId: string;
    quantity: number;
    price: number;
}

export enum OrderStatus {
    Inserted,
    Processing,
    Processed,
    Shipped,
    Delivered,
    Closed,
    Cancelled
}