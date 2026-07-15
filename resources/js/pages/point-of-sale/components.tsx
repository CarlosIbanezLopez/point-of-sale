import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { Power, Save, type LucideIcon } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';

export interface Customer {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    is_active: boolean;
    created_at: string | null;
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    is_active: boolean;
    created_at: string | null;
}

export interface OrderItem {
    id: string;
    product_id: string;
    product_name?: string;
    quantity: number;
    unit_price: string;
    line_total: string;
}

export interface Order {
    id: string;
    customer_id: string;
    customer?: Customer | null;
    order_date: string | null;
    status: OrderStatus;
    total: string;
    items: OrderItem[];
}

export interface Stats {
    active_customers: number;
    active_products: number;
    pending_orders: number;
    inventory_units: number;
}

export interface Flash {
    status?: string;
}

const money = new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
});

export function formatCurrency(value: string | number) {
    return money.format(Number(value));
}

export function formatDate(value: string | null) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('es-BO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function statusVariant(status: OrderStatus) {
    if (status === 'Cancelled') {
        return 'destructive';
    }

    if (status === 'Delivered') {
        return 'default';
    }

    return 'secondary';
}

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            {action}
        </div>
    );
}

export function FlashMessage({ flash }: { flash?: Flash }) {
    if (!flash?.status) {
        return null;
    }

    return (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950 dark:text-emerald-100">
            {flash.status}
        </div>
    );
}

export function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
    return (
        <Card>
            <CardContent className="flex items-center gap-3 p-4">
                <div className="bg-muted flex size-10 items-center justify-center rounded-md">
                    <Icon className="size-5" />
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">{label}</p>
                    <p className="text-xl font-semibold">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}

export function Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: ReactNode }) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

export function CustomersTable({ customers }: { customers: Customer[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Clientes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                {customers.map((customer) => (
                    <CustomerRow customer={customer} key={customer.id} />
                ))}
                {customers.length === 0 && <p className="text-muted-foreground text-sm">Todavia no hay clientes.</p>}
            </CardContent>
        </Card>
    );
}

function CustomerRow({ customer }: { customer: Customer }) {
    const [values, setValues] = useState({
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone ?? '',
    });

    const save = () => router.patch(route('customers.update', customer.id), values, { preserveScroll: true });
    const deactivate = () => router.delete(route('customers.destroy', customer.id), { preserveScroll: true });

    return (
        <div className="grid gap-2 rounded-md border p-3">
            <div className="flex items-center justify-between gap-2">
                <Badge variant={customer.is_active ? 'default' : 'secondary'}>{customer.is_active ? 'Activo' : 'Inactivo'}</Badge>
                <span className="text-muted-foreground truncate text-xs">{customer.id}</span>
            </div>
            <div className="grid gap-2 lg:grid-cols-3">
                <Input value={values.full_name} onChange={(event) => setValues({ ...values, full_name: event.target.value })} />
                <Input type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} />
                <Input value={values.phone} onChange={(event) => setValues({ ...values, phone: event.target.value })} />
            </div>
            <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={save}>
                    <Save />
                    Guardar
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={deactivate} disabled={!customer.is_active}>
                    <Power />
                    Desactivar
                </Button>
            </div>
        </div>
    );
}

export function ProductsTable({ products }: { products: Product[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Productos</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                {products.map((product) => (
                    <ProductRow product={product} key={product.id} />
                ))}
                {products.length === 0 && <p className="text-muted-foreground text-sm">Todavia no hay productos.</p>}
            </CardContent>
        </Card>
    );
}

function ProductRow({ product }: { product: Product }) {
    const [values, setValues] = useState({
        name: product.name,
        description: product.description ?? '',
        price: product.price,
        stock: String(product.stock),
    });

    const save = () => router.patch(route('products.update', product.id), values, { preserveScroll: true });
    const deactivate = () => router.delete(route('products.destroy', product.id), { preserveScroll: true });

    return (
        <div className="grid gap-2 rounded-md border p-3">
            <div className="flex items-center justify-between gap-2">
                <Badge variant={product.is_active ? 'default' : 'secondary'}>{product.is_active ? 'Activo' : 'Inactivo'}</Badge>
                <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
            </div>
            <div className="grid gap-2 lg:grid-cols-[1fr_1fr_112px_96px]">
                <Input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} />
                <Input value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} />
                <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={values.price}
                    onChange={(event) => setValues({ ...values, price: event.target.value })}
                />
                <Input
                    type="number"
                    min="0"
                    step="1"
                    value={values.stock}
                    onChange={(event) => setValues({ ...values, stock: event.target.value })}
                />
            </div>
            <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={save}>
                    <Save />
                    Guardar
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={deactivate} disabled={!product.is_active}>
                    <Power />
                    Desactivar
                </Button>
            </div>
        </div>
    );
}

export function OrdersTable({ orders, statuses }: { orders: Order[]; statuses: OrderStatus[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Pedidos</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
                {orders.map((order) => (
                    <OrderRow order={order} statuses={statuses} key={order.id} />
                ))}
                {orders.length === 0 && <p className="text-muted-foreground text-sm">Todavia no hay pedidos.</p>}
            </CardContent>
        </Card>
    );
}

function OrderRow({ order, statuses }: { order: Order; statuses: OrderStatus[] }) {
    const [status, setStatus] = useState<OrderStatus>(order.status);
    const orderItems = Array.isArray(order.items) ? order.items : [];

    const saveStatus = () => router.patch(route('orders.status.update', order.id), { status }, { preserveScroll: true });

    return (
        <div className="grid gap-3 rounded-md border p-3">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{order.customer?.full_name ?? 'Cliente'}</span>
                        <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    </div>
                    <p className="text-muted-foreground truncate text-xs">{order.id}</p>
                </div>
                <div className="text-sm">
                    <span className="text-muted-foreground">{formatDate(order.order_date)}</span>
                    <span className="ml-3 font-semibold">{formatCurrency(order.total)}</span>
                </div>
            </div>

            <div className="grid gap-2 text-sm md:grid-cols-2 xl:grid-cols-3">
                {orderItems.map((item) => (
                    <div className="bg-muted rounded-md px-3 py-2" key={item.id}>
                        <div className="font-medium">{item.product_name ?? item.product_id}</div>
                        <div className="text-muted-foreground">
                            {item.quantity} x {formatCurrency(item.unit_price)} = {formatCurrency(item.line_total)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as OrderStatus)}
                >
                    {statuses.map((availableStatus) => (
                        <option key={availableStatus} value={availableStatus}>
                            {availableStatus}
                        </option>
                    ))}
                </select>
                <Button type="button" size="sm" variant="outline" onClick={saveStatus}>
                    <Save />
                    Cambiar estado
                </Button>
            </div>
        </div>
    );
}
