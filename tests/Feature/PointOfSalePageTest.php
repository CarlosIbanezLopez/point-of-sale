<?php

use App\Models\Customer;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderService;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the point of sale dashboard for authenticated users', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $product = Product::factory()->create(['price' => 12, 'stock' => 4]);

    app(OrderService::class)->create([
        'customer_id' => $customer->id,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
    ]);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('orders', 1)
            ->has('orders.0.items', 1)
            ->has('stats')
        );
});

it('renders the customer screen for authenticated users', function () {
    $user = User::factory()->create();
    Customer::factory()->create();

    $this->actingAs($user)
        ->get('/customers')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customers/index')
            ->has('customers', 1)
            ->has('stats')
        );
});

it('renders the product screen for authenticated users', function () {
    $user = User::factory()->create();
    Product::factory()->create();

    $this->actingAs($user)
        ->get('/products')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('products/index')
            ->has('products', 1)
            ->has('stats')
        );
});

it('renders the order screen for authenticated users', function () {
    $user = User::factory()->create();
    $customer = Customer::factory()->create();
    $product = Product::factory()->create(['price' => 8, 'stock' => 3]);

    app(OrderService::class)->create([
        'customer_id' => $customer->id,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
    ]);

    $this->actingAs($user)
        ->get('/orders')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('orders/index')
            ->has('customers', 1)
            ->has('products', 1)
            ->has('orders', 1)
            ->has('orders.0.items', 1)
            ->has('statuses', 4)
        );
});

it('serves swagger ui and openapi specification', function () {
    $this->get('/api/docs')->assertOk();

    $response = $this->getJson('/api/docs/openapi.json')
        ->assertOk()
        ->assertJsonPath('openapi', '3.0.3');

    expect($response->json('paths'))->toHaveKeys([
        '/api/v1/customers',
        '/api/v1/products',
        '/api/v1/orders',
    ]);
});
