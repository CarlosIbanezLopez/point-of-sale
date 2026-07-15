import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Plus, Users } from 'lucide-react';
import { type FormEventHandler } from 'react';

import { CustomersTable, Field, FlashMessage, PageHeader, StatCard, type Customer, type Flash, type Stats } from '../point-of-sale/components';

interface CustomersPageProps {
    customers: Customer[];
    stats: Stats;
    flash?: Flash;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clientes',
        href: '/customers',
    },
];

export default function CustomersIndex({ customers, stats, flash }: CustomersPageProps) {
    const customerForm = useForm({
        full_name: '',
        email: '',
        phone: '',
    });

    const submitCustomer: FormEventHandler = (event) => {
        event.preventDefault();
        customerForm.post(route('customers.store'), {
            preserveScroll: true,
            onSuccess: () => customerForm.reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clientes" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <PageHeader title="Clientes" description="Registra, edita y desactiva clientes sin eliminarlos fisicamente." />
                <FlashMessage flash={flash} />

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={Users} label="Clientes activos" value={stats.active_customers} />
                </div>

                <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
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

                    <CustomersTable customers={customers} />
                </div>
            </div>
        </AppLayout>
    );
}
