<?php

use App\Enums\OrderStatus;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;

it('creates orders, calculates total, and decreases stock', function () {
    $customer = Customer::factory()->create();
    $product = Product::factory()->create([
        'price' => 10.50,
        'stock' => 5,
    ]);

    $this->postJson('/api/v1/orders', [
        'customer_id' => $customer->id,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
    ])->assertCreated()
        ->assertJsonPath('data.status', OrderStatus::Pending->value)
        ->assertJsonPath('data.total', '21.00')
        ->assertJsonPath('data.items.0.quantity', 2);

    expect($product->fresh()->stock)->toBe(3);
});

it('rejects orders for inactive customers', function () {
    $customer = Customer::factory()->inactive()->create();
    $product = Product::factory()->create(['stock' => 5]);

    $this->postJson('/api/v1/orders', [
        'customer_id' => $customer->id,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('customer_id');
});

it('does not create orders without enough stock', function () {
    $customer = Customer::factory()->create();
    $product = Product::factory()->create(['stock' => 1]);

    $this->postJson('/api/v1/orders', [
        'customer_id' => $customer->id,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('items');

    expect(Order::count())->toBe(0)
        ->and($product->fresh()->stock)->toBe(1);
});

it('adds products to pending orders and changes status', function () {
    $customer = Customer::factory()->create();
    $order = Order::factory()->for($customer)->create();
    $product = Product::factory()->create([
        'price' => 7.25,
        'stock' => 3,
    ]);

    $this->postJson("/api/v1/orders/{$order->id}/items", [
        'product_id' => $product->id,
        'quantity' => 2,
    ])->assertOk()
        ->assertJsonPath('data.total', '14.50');

    $this->patchJson("/api/v1/orders/{$order->id}/status", [
        'status' => OrderStatus::Confirmed->value,
    ])->assertOk()
        ->assertJsonPath('data.status', OrderStatus::Confirmed->value);

    expect($product->fresh()->stock)->toBe(1);
});
