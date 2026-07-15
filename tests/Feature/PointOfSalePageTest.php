<?php

use App\Models\Customer;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('renders the point of sale dashboard for authenticated users', function () {
    $user = User::factory()->create();
    Customer::factory()->create();
    Product::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->has('customers', 1)
            ->has('products', 1)
            ->has('stats')
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
