<?php

use App\Http\Controllers\OpenApiDocumentationController;
use App\Http\Controllers\PointOfSaleController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::get('api/docs', [OpenApiDocumentationController::class, 'show'])->name('api.docs');
Route::get('api/docs/openapi.json', [OpenApiDocumentationController::class, 'spec'])->name('api.docs.spec');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [PointOfSaleController::class, 'index'])->name('dashboard');

    Route::get('customers', [PointOfSaleController::class, 'customers'])->name('customers.index');
    Route::post('customers', [PointOfSaleController::class, 'storeCustomer'])->name('customers.store');
    Route::patch('customers/{customer}', [PointOfSaleController::class, 'updateCustomer'])->name('customers.update');
    Route::delete('customers/{customer}', [PointOfSaleController::class, 'deactivateCustomer'])->name('customers.destroy');

    Route::get('products', [PointOfSaleController::class, 'products'])->name('products.index');
    Route::post('products', [PointOfSaleController::class, 'storeProduct'])->name('products.store');
    Route::patch('products/{product}', [PointOfSaleController::class, 'updateProduct'])->name('products.update');
    Route::delete('products/{product}', [PointOfSaleController::class, 'deactivateProduct'])->name('products.destroy');

    Route::get('orders', [PointOfSaleController::class, 'orders'])->name('orders.index');
    Route::post('orders', [PointOfSaleController::class, 'storeOrder'])->name('orders.store');
    Route::patch('orders/{order}/status', [PointOfSaleController::class, 'updateOrderStatus'])->name('orders.status.update');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
