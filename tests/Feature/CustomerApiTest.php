<?php

use App\Models\Customer;

it('registers, lists, shows, updates, and deactivates customers', function () {
    $response = $this->postJson('/api/v1/customers', [
        'full_name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'phone' => '70000001',
    ])->assertCreated();

    $customerId = $response->json('data.id');

    $this->getJson('/api/v1/customers')
        ->assertOk()
        ->assertJsonFragment(['email' => 'ada@example.com']);

    $this->getJson("/api/v1/customers/{$customerId}")
        ->assertOk()
        ->assertJsonPath('data.full_name', 'Ada Lovelace');

    $this->patchJson("/api/v1/customers/{$customerId}", [
        'full_name' => 'Ada Byron',
        'email' => 'ada.byron@example.com',
        'phone' => null,
    ])->assertOk()
        ->assertJsonPath('data.full_name', 'Ada Byron');

    $this->deleteJson("/api/v1/customers/{$customerId}")
        ->assertOk()
        ->assertJsonPath('data.is_active', false);

    $customer = Customer::findOrFail($customerId);

    expect($customer->is_active)->toBeFalse()
        ->and(Customer::count())->toBe(1);
});

it('requires unique customer emails', function () {
    Customer::factory()->create(['email' => 'unique@example.com']);

    $this->postJson('/api/v1/customers', [
        'full_name' => 'Duplicate Email',
        'email' => 'unique@example.com',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});
