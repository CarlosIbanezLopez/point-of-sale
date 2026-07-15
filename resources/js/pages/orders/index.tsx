import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, ShoppingCart } from 'lucide-react';
import { type FormEventHandler, useMemo } from 'react';

import {
    type Customer,
    Field,
    type Flash,
    FlashMessage,
    type Order,
    type OrderStatus,
    OrdersTable,
    PageHeader,
    type Product,
    StatCard,
    type Stats,
} from '../point-of-sale/components';

interface OrderFormItem {
    product_id: string;
    quantity: string;
}

interface OrdersPageProps {
    customers: Customer[];
    products: Product[];
    orders: Order[];
    statuses: OrderStatus[];
    stats: Stats;
    flash?: Flash;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pedidos',
        href: '/orders',
    },
];

export default function OrdersIndex({ customers, products, orders, statuses, stats, flash }: OrdersPageProps) {
    const activeCustomers = useMemo(() => customers.filter((customer) => customer.is_active), [customers]);
    const activeProducts = useMemo(() => products.filter((product) => product.is_active), [products]);
    const purchasableProducts = useMemo(() => activeProducts.filter((product) => product.stock > 0), [activeProducts]);
    const firstProductId = purchasableProducts[0]?.id ?? '';

    const orderForm = useForm<{
        customer_id: string;
        items: OrderFormItem[];
    }>({
        customer_id: activeCustomers[0]?.id ?? '',
        items: firstProductId ? [{ product_id: firstProductId, quantity: '1' }] : [],
    });

    const submitOrder: FormEventHandler = (event) => {
        event.preventDefault();
        orderForm.post(route('orders.store'), {
            preserveScroll: true,
            onSuccess: () => orderForm.setData('items', firstProductId ? [{ product_id: firstProductId, quantity: '1' }] : []),
        });
    };

    const addOrderLine = () => {
        orderForm.setData('items', [...orderForm.data.items, { product_id: firstProductId, quantity: '1' }]);
    };

    const updateOrderLine = (index: number, item: OrderFormItem) => {
        orderForm.setData(
            'items',
            orderForm.data.items.map((currentItem, currentIndex) => (currentIndex === index ? item : currentItem)),
        );
    };

    const removeOrderLine = (index: number) => {
        orderForm.setData(
            'items',
            orderForm.data.items.filter((item, currentIndex) => currentIndex !== index),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pedidos" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <PageHeader title="Pedidos" description="Crea pedidos, valida stock y cambia estados." />
                <FlashMessage flash={flash} />

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={ShoppingCart} label="Pedidos pendientes" value={stats.pending_orders} />
                </div>

                <div className="grid gap-4 xl:grid-cols-[480px_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Crear pedido</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="grid gap-4" onSubmit={submitOrder}>
                                <Field label="Cliente activo" htmlFor="customer_id" error={orderForm.errors.customer_id}>
                                    <select
                                        id="customer_id"
                                        className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                                        value={orderForm.data.customer_id}
                                        onChange={(event) => orderForm.setData('customer_id', event.target.value)}
                                    >
                                        {activeCustomers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <div className="grid gap-3">
                                    {orderForm.data.items.map((item, index) => (
                                        <div className="grid gap-2 sm:grid-cols-[1fr_96px_auto]" key={`${item.product_id}-${index}`}>
                                            <select
                                                className="border-input bg-background h-10 rounded-md border px-3 py-2 text-sm"
                                                value={item.product_id}
                                                onChange={(event) => updateOrderLine(index, { ...item, product_id: event.target.value })}
                                            >
                                                {purchasableProducts.map((product) => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name} ({product.stock})
                                                    </option>
                                                ))}
                                            </select>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(event) => updateOrderLine(index, { ...item, quantity: event.target.value })}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => removeOrderLine(index)}
                                                disabled={orderForm.data.items.length === 1}
                                            >
                                                Quitar
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <InputError message={orderForm.errors.items} />
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Button type="button" variant="outline" onClick={addOrderLine} disabled={!firstProductId}>
                                        <Plus />
                                        Producto
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={orderForm.processing || activeCustomers.length === 0 || purchasableProducts.length === 0}
                                    >
                                        {orderForm.processing ? <LoaderCircle className="animate-spin" /> : <ShoppingCart />}
                                        Crear pedido
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <OrdersTable orders={orders} statuses={statuses} />
                </div>
            </div>
        </AppLayout>
    );
}
