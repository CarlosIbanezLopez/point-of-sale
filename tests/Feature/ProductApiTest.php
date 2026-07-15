<?php

use App\Models\Product;

it('registers, lists, shows, updates stock and price, and deactivates products', function () {
    $response = $this->postJson('/api/v1/products', [
        'name' => 'Thermal Printer',
        'description' => 'Receipt printer',
        'price' => 120.50,
        'stock' => 8,
    ])->assertCreated();

    $productId = $response->json('data.id');

    $this->getJson('/api/v1/products')
        ->assertOk()
        ->assertJsonFragment(['name' => 'Thermal Printer']);

    $this->getJson("/api/v1/products/{$productId}")
        ->assertOk()
        ->assertJsonPath('data.stock', 8);

    $this->patchJson("/api/v1/products/{$productId}", [
        'price' => 99.99,
        'stock' => 4,
    ])->assertOk()
        ->assertJsonPath('data.price', '99.99')
        ->assertJsonPath('data.stock', 4);

    $this->deleteJson("/api/v1/products/{$productId}")
        ->assertOk()
        ->assertJsonPath('data.is_active', false);

    $product = Product::findOrFail($productId);

    expect($product->is_active)->toBeFalse()
        ->and(Product::count())->toBe(1);
});

it('validates product price and stock rules', function () {
    $this->postJson('/api/v1/products', [
        'name' => 'Invalid product',
        'price' => 0,
        'stock' => -1,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['price', 'stock']);
});
