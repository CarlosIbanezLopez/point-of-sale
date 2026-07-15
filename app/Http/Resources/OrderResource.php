<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'customer' => $this->relationLoaded('customer')
                ? (new CustomerResource($this->customer))->resolve($request)
                : null,
            'order_date' => $this->order_date?->toISOString(),
            'status' => $this->status->value,
            'total' => $this->total,
            'items' => $this->relationLoaded('items')
                ? OrderItemResource::collection($this->items)->resolve($request)
                : [],
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
