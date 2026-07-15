import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CircleDollarSign, FileText, Package, ShoppingCart, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
    FlashMessage,
    formatCurrency,
    formatDate,
    PageHeader,
    StatCard,
    statusVariant,
    type Flash,
    type Order,
    type Stats,
} from './point-of-sale/components';

interface DashboardProps {
    orders: Order[];
    stats: Stats;
    flash?: Flash;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ orders, stats, flash }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <PageHeader
                    title="Dashboard"
                    description="Resumen general del punto de venta."
                    action={
                        <Button asChild variant="outline">
                            <a href={route('api.docs')}>
                                <FileText />
                                Swagger
                            </a>
                        </Button>
                    }
                />

                <FlashMessage flash={flash} />

                <div className="grid gap-3 md:grid-cols-4">
                    <StatCard icon={Users} label="Clientes activos" value={stats.active_customers} />
                    <StatCard icon={Package} label="Productos activos" value={stats.active_products} />
                    <StatCard icon={ShoppingCart} label="Pedidos pendientes" value={stats.pending_orders} />
                    <StatCard icon={CircleDollarSign} label="Unidades en stock" value={stats.inventory_units} />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Pedidos recientes</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {orders.map((order) => (
                                <div
                                    className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
                                    key={order.id}
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-medium">{order.customer?.full_name ?? 'Cliente'}</span>
                                            <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                                        </div>
                                        <p className="text-muted-foreground truncate text-xs">{formatDate(order.order_date)}</p>
                                    </div>
                                    <div className="font-semibold">{formatCurrency(order.total)}</div>
                                </div>
                            ))}
                            {orders.length === 0 && <p className="text-muted-foreground text-sm">Todavia no hay pedidos.</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Accesos</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Button asChild variant="outline">
                                <Link href={route('customers.index')}>
                                    <Users />
                                    Clientes
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={route('products.index')}>
                                    <Package />
                                    Productos
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={route('orders.index')}>
                                    <ShoppingCart />
                                    Pedidos
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
