import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Package, Plus } from 'lucide-react';
import { type FormEventHandler } from 'react';

import { Field, type Flash, FlashMessage, PageHeader, type Product, ProductsTable, StatCard, type Stats } from '../point-of-sale/components';

interface ProductsPageProps {
    products: Product[];
    stats: Stats;
    flash?: Flash;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos',
        href: '/products',
    },
];

export default function ProductsIndex({ products, stats, flash }: ProductsPageProps) {
    const productForm = useForm({
        name: '',
        description: '',
        price: '',
        stock: '0',
    });

    const submitProduct: FormEventHandler = (event) => {
        event.preventDefault();
        productForm.post(route('products.store'), {
            preserveScroll: true,
            onSuccess: () => productForm.reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Productos" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <PageHeader title="Productos" description="Registra productos, ajusta precio y stock, y usa baja logica." />
                <FlashMessage flash={flash} />

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={Package} label="Productos activos" value={stats.active_products} />
                    <StatCard icon={Package} label="Unidades en stock" value={stats.inventory_units} />
                </div>

                <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
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

                    <ProductsTable products={products} />
                </div>
            </div>
        </AppLayout>
    );
}
