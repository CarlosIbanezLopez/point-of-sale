<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * @param  array{customer_id: string, items: list<array{product_id: string, quantity: int}>}  $data
     */
    public function create(array $data): Order
    {
        return DB::transaction(function () use ($data): Order {
            $customer = Customer::active()
                ->whereKey($data['customer_id'])
                ->first();

            if (! $customer) {
                throw ValidationException::withMessages([
                    'customer_id' => __('The selected customer must exist and be active.'),
                ]);
            }

            $order = Order::create([
                'customer_id' => $customer->id,
                'order_date' => now(),
                'status' => OrderStatus::Pending,
                'total' => 0,
            ]);

            return $this->addProductsToPendingOrder($order, $data['items']);
        });
    }

    /**
     * @param  array{product_id: string, quantity: int}  $data
     */
    public function addProduct(Order $order, array $data): Order
    {
        return DB::transaction(fn (): Order => $this->addProductsToPendingOrder($order, [$data]));
    }

    public function updateStatus(Order $order, OrderStatus $status): Order
    {
        $order->update(['status' => $status]);

        return $this->freshOrder($order);
    }

    /**
     * @param  list<array{product_id: string, quantity: int}>  $items
     */
    private function addProductsToPendingOrder(Order $order, array $items): Order
    {
        $order->refresh();

        if ($order->status !== OrderStatus::Pending) {
            throw ValidationException::withMessages([
                'status' => __('Products can only be added to pending orders.'),
            ]);
        }

        $requestedProducts = $this->aggregateItems($items);
        $products = Product::active()
            ->whereIn('id', $requestedProducts->keys())
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        $this->ensureStockIsAvailable($requestedProducts, $products);

        $requestedProducts->each(function (int $quantity, string $productId) use ($order, $products): void {
            /** @var Product $product */
            $product = $products->get($productId);
            $unitPrice = (float) $product->price;
            $lineTotal = round($unitPrice * $quantity, 2);

            $product->decrement('stock', $quantity);

            $order->items()->create([
                'product_id' => $product->id,
                'quantity' => $quantity,
                'unit_price' => number_format($unitPrice, 2, '.', ''),
                'line_total' => number_format($lineTotal, 2, '.', ''),
            ]);
        });

        $order->update([
            'total' => $order->items()->sum('line_total'),
        ]);

        return $this->freshOrder($order);
    }

    /**
     * @param  list<array{product_id: string, quantity: int}>  $items
     * @return Collection<string, int>
     */
    private function aggregateItems(array $items): Collection
    {
        return collect($items)
            ->groupBy('product_id')
            ->map(fn (Collection $productItems): int => (int) $productItems->sum('quantity'));
    }

    /**
     * @param  Collection<string, int>  $requestedProducts
     * @param  Collection<string, Product>  $products
     */
    private function ensureStockIsAvailable(Collection $requestedProducts, Collection $products): void
    {
        $errors = [];

        $requestedProducts->each(function (int $quantity, string $productId) use ($products, &$errors): void {
            /** @var Product|null $product */
            $product = $products->get($productId);

            if (! $product) {
                $errors['items'] = __('Every selected product must exist and be active.');

                return;
            }

            if ($product->stock < $quantity) {
                $errors['items'] = __('There is not enough stock for :product.', [
                    'product' => $product->name,
                ]);
            }
        });

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    private function freshOrder(Order $order): Order
    {
        return $order->refresh()->load(['customer', 'items.product']);
    }
}
