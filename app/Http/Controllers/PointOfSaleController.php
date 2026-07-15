<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PointOfSaleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'orders' => OrderResource::collection(
                Order::with(['customer', 'items.product'])->latest('order_date')->limit(5)->get()
            )->resolve(request()),
            'stats' => $this->stats(),
        ]);
    }

    public function customers(): Response
    {
        return Inertia::render('customers/index', [
            'customers' => CustomerResource::collection(Customer::latest()->get())->resolve(request()),
            'stats' => $this->stats(),
        ]);
    }

    public function products(): Response
    {
        return Inertia::render('products/index', [
            'products' => ProductResource::collection(Product::latest()->get())->resolve(request()),
            'stats' => $this->stats(),
        ]);
    }

    public function orders(): Response
    {
        return Inertia::render('orders/index', [
            'customers' => CustomerResource::collection(Customer::latest()->get())->resolve(request()),
            'products' => ProductResource::collection(Product::latest()->get())->resolve(request()),
            'orders' => OrderResource::collection(
                Order::with(['customer', 'items.product'])->latest('order_date')->get()
            )->resolve(request()),
            'statuses' => OrderStatus::values(),
            'stats' => $this->stats(),
        ]);
    }

    public function storeCustomer(StoreCustomerRequest $request): RedirectResponse
    {
        Customer::create($request->validated());

        return to_route('customers.index')->with('status', __('Customer registered.'));
    }

    public function updateCustomer(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $customer->update($request->validated());

        return to_route('customers.index')->with('status', __('Customer updated.'));
    }

    public function deactivateCustomer(Customer $customer): RedirectResponse
    {
        $customer->update(['is_active' => false]);

        return to_route('customers.index')->with('status', __('Customer deactivated.'));
    }

    public function storeProduct(StoreProductRequest $request): RedirectResponse
    {
        Product::create($request->validated());

        return to_route('products.index')->with('status', __('Product registered.'));
    }

    public function updateProduct(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        return to_route('products.index')->with('status', __('Product updated.'));
    }

    public function deactivateProduct(Product $product): RedirectResponse
    {
        $product->update(['is_active' => false]);

        return to_route('products.index')->with('status', __('Product deactivated.'));
    }

    public function storeOrder(StoreOrderRequest $request, OrderService $orders): RedirectResponse
    {
        $orders->create($request->validated());

        return to_route('orders.index')->with('status', __('Order created.'));
    }

    public function updateOrderStatus(UpdateOrderStatusRequest $request, Order $order, OrderService $orders): RedirectResponse
    {
        $orders->updateStatus($order, OrderStatus::from($request->validated()['status']));

        return to_route('orders.index')->with('status', __('Order status updated.'));
    }

    /**
     * @return array{active_customers: int, active_products: int, pending_orders: int, inventory_units: int}
     */
    private function stats(): array
    {
        return [
            'active_customers' => Customer::active()->count(),
            'active_products' => Product::active()->count(),
            'pending_orders' => Order::where('status', OrderStatus::Pending)->count(),
            'inventory_units' => (int) Product::active()->sum('stock'),
        ];
    }
}
