import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { CircleDollarSign, FileText, LoaderCircle, Package, Plus, Power, Save, ShoppingCart, Users } from 'lucide-react';
import { FormEventHandler, useMemo, useState } from 'react';

type OrderStatus = 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';

interface Customer {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    is_active: boolean;
    created_at: string | null;
}

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    is_active: boolean;
    created_at: string | null;
}

interface OrderItem {
    id: string;
    product_id: string;
    product_name?: string;
    quantity: number;
    unit_price: string;
    line_total: string;
}

interface Order {
    id: string;
    customer_id: string;
    customer?: Customer;
    order_date: string | null;
    status: OrderStatus;
    total: string;
    items: OrderItem[];
}

interface Stats {
    active_customers: number;
    active_products: number;
    pending_orders: number;
    inventory_units: number;
}

interface OrderFormItem {
    product_id: string;
    quantity: string;
}

interface DashboardProps {
    customers: Customer[];
    products: Product[];
    orders: Order[];
    statuses: OrderStatus[];
    stats: Stats;
    flash?: {
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Punto de venta',
        href: '/dashboard',
    },
];

const money = new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
});

function formatCurrency(value: string | number) {
    return money.format(Number(value));
}

function formatDate(value: string | null) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('es-BO', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function statusVariant(status: OrderStatus) {
    if (status === 'Cancelled') {
        return 'destructive';
    }

    if (status === 'Delivered') {
        return 'default';
    }

    return 'secondary';
}

export default function Dashboard({ customers, products, orders, statuses, stats, flash }: DashboardProps) {
    const activeCustomers = useMemo(() => customers.filter((customer) => customer.is_active), [customers]);
    const activeProducts = useMemo(() => products.filter((product) => product.is_active), [products]);
    const purchasableProducts = useMemo(() => activeProducts.filter((product) => product.stock > 0), [activeProducts]);
    const firstProductId = purchasableProducts[0]?.id ?? '';

    const customerForm = useForm({
        full_name: '',
        email: '',
        phone: '',
    });

    const productForm = useForm({
        name: '',
        description: '',
        price: '',
        stock: '0',
    });

    const orderForm = useForm<{
        customer_id: string;
        items: OrderFormItem[];
    }>({
        customer_id: activeCustomers[0]?.id ?? '',
        items: firstProductId ? [{ product_id: firstProductId, quantity: '1' }] : [],
    });

    const submitCustomer: FormEventHandler = (event) => {
        event.preventDefault();
        customerForm.post(route('customers.store'), {
            preserveScroll: true,
            onSuccess: () => customerForm.reset(),
        });
    };

    const submitProduct: FormEventHandler = (event) => {
        event.preventDefault();
        productForm.post(route('products.store'), {
            preserveScroll: true,
            onSuccess: () => productForm.reset(),
        });
    };

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
            <Head title="Punto de venta" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Punto de venta</h1>
                        <p className="text-muted-foreground text-sm">Clientes, productos y pedidos en una app monolitica Laravel + React.</p>
                    </div>
                    <Button asChild variant="outline">
                        <a href={route('api.docs')}>
                            <FileText />
                            Swagger
                        </a>
                    </Button>
                </div>

                {flash?.status && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <div className="grid gap-3 md:grid-cols-4">
                    <StatCard icon={Users} label="Clientes activos" value={stats.active_customers} />
                    <StatCard icon={Package} label="Productos activos" value={stats.active_products} />
                    <StatCard icon={ShoppingCart} label="Pedidos pendientes" value={stats.pending_orders} />
                    <StatCard icon={CircleDollarSign} label="Unidades en stock" value={stats.inventory_units} />
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Registrar cliente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="grid gap-4" onSubmit={submitCustomer}>
                                <Field label="Nombre completo" htmlFor="full_name" error={customerForm.errors.full_name}>
                                    <Input
                                        id="full_name"
                                        value={customerForm.data.full_name}
                                        onChange={(event) => customerForm.setData('full_name', event.target.value)}
                                    />
                                </Field>
                                <Field label="Email" htmlFor="email" error={customerForm.errors.email}>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={customerForm.data.email}
                                        onChange={(event) => customerForm.setData('email', event.target.value)}
                                    />
                                </Field>
                                <Field label="Telefono" htmlFor="phone" error={customerForm.errors.phone}>
                                    <Input
                                        id="phone"
                                        value={customerForm.data.phone}
                                        onChange={(event) => customerForm.setData('phone', event.target.value)}
                                    />
                                </Field>
                                <Button type="submit" disabled={customerForm.processing}>
                                    {customerForm.processing ? <LoaderCircle className="animate-spin" /> : <Plus />}
                                    Registrar
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Registrar producto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="grid gap-4" onSubmit={submitProduct}>
                                <Field label="Nombre" htmlFor="name" error={productForm.errors.name}>
                                    <Input
                                        id="name"
                                        value={productForm.data.name}
                                        onChange={(event) => productForm.setData('name', event.target.value)}
                                    />
                                </Field>
                                <Field label="Descripcion" htmlFor="description" error={productForm.errors.description}>
                                    <Input
                                        id="description"
                                        value={productForm.data.description}
                                        onChange={(event) => productForm.setData('description', event.target.value)}
                                    />
                                </Field>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Precio" htmlFor="price" error={productForm.errors.price}>
                                        <Input
                                            id="price"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={productForm.data.price}
                                            onChange={(event) => productForm.setData('price', event.target.value)}
                                        />
                                    </Field>
                                    <Field label="Stock" htmlFor="stock" error={productForm.errors.stock}>
                                        <Input
                                            id="stock"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={productForm.data.stock}
                                            onChange={(event) => productForm.setData('stock', event.target.value)}
                                        />
                                    </Field>
                                </div>
                                <Button type="submit" disabled={productForm.processing}>
                                    {productForm.processing ? <LoaderCircle className="animate-spin" /> : <Plus />}
                                    Registrar
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

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
                </div>

                <div className="grid gap-4 2xl:grid-cols-2">
                    <CustomersTable customers={customers} />
                    <ProductsTable products={products} />
                </div>

                <OrdersTable orders={orders} statuses={statuses} />
            </div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
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

function Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function CustomersTable({ customers }: { customers: Customer[] }) {
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

function ProductsTable({ products }: { products: Product[] }) {
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

function OrdersTable({ orders, statuses }: { orders: Order[]; statuses: OrderStatus[] }) {
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
                {order.items.map((item) => (
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
