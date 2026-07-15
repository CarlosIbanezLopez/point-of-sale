<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderItemRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;

class OrderItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function store(StoreOrderItemRequest $request, Order $order, OrderService $orders): OrderResource
    {
        return new OrderResource($orders->addProduct($order, $request->validated()));
    }
}
