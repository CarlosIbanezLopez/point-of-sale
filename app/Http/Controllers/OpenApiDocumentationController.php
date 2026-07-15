<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

class OpenApiDocumentationController extends Controller
{
    public function show(): View
    {
        return view('api-docs');
    }

    public function spec(): JsonResponse
    {
        return response()->json([
            'openapi' => '3.0.3',
            'info' => [
                'title' => 'Point of Sale API',
                'version' => '1.0.0',
                'description' => 'Customer, product, and order operations for the Laravel + React monolith.',
            ],
            'servers' => [
                ['url' => url('/')],
            ],
            'paths' => [
                '/api/v1/customers' => [
                    'get' => [
                        'summary' => 'List customers',
                        'tags' => ['Customers'],
                        'responses' => ['200' => ['description' => 'Customer list']],
                    ],
                    'post' => [
                        'summary' => 'Register a customer',
                        'tags' => ['Customers'],
                        'requestBody' => ['$ref' => '#/components/requestBodies/CustomerPayload'],
                        'responses' => [
                            '201' => ['description' => 'Customer created'],
                            '422' => ['$ref' => '#/components/responses/ValidationError'],
                        ],
                    ],
                ],
                '/api/v1/customers/{customer}' => [
                    'get' => [
                        'summary' => 'Get customer by ID',
                        'tags' => ['Customers'],
                        'parameters' => [['$ref' => '#/components/parameters/CustomerId']],
                        'responses' => ['200' => ['description' => 'Customer detail']],
                    ],
                    'patch' => [
                        'summary' => 'Update customer data',
                        'tags' => ['Customers'],
                        'parameters' => [['$ref' => '#/components/parameters/CustomerId']],
                        'requestBody' => ['$ref' => '#/components/requestBodies/CustomerPayload'],
                        'responses' => [
                            '200' => ['description' => 'Customer updated'],
                            '422' => ['$ref' => '#/components/responses/ValidationError'],
                        ],
                    ],
                    'delete' => [
                        'summary' => 'Deactivate customer',
                        'tags' => ['Customers'],
                        'parameters' => [['$ref' => '#/components/parameters/CustomerId']],
                        'responses' => ['200' => ['description' => 'Customer deactivated without physical deletion']],
                    ],
                ],
                '/api/v1/products' => [
                    'get' => [
                        'summary' => 'List products',
                        'tags' => ['Products'],
                        'responses' => ['200' => ['description' => 'Product list']],
                    ],
                    'post' => [
                        'summary' => 'Register a product',
                        'tags' => ['Products'],
                        'requestBody' => ['$ref' => '#/components/requestBodies/ProductPayload'],
                        'responses' => [
                            '201' => ['description' => 'Product created'],
                            '422' => ['$ref' => '#/components/responses/ValidationError'],
                        ],
                    ],
                ],
                '/api/v1/products/{product}' => [
                    'get' => [
                        'summary' => 'Get product by ID',
                        'tags' => ['Products'],
                        'parameters' => [['$ref' => '#/components/parameters/ProductId']],
                        'responses' => ['200' => ['description' => 'Product detail']],
                    ],
                    'patch' => [
                        'summary' => 'Update product price and stock',
                        'tags' => ['Products'],
                        'parameters' => [['$ref' => '#/components/parameters/ProductId']],
                        'requestBody' => ['$ref' => '#/components/requestBodies/ProductPayload'],
                        'responses' => [
                            '200' => ['description' => 'Product updated'],
                            '422' => ['$ref' => '#/components/responses/ValidationError'],
                        ],
                    ],
                    'delete' => [
                        'summary' => 'Deactivate product',
                        'tags' => ['Products'],
                        'parameters' => [['$ref' => '#/components/parameters/ProductId']],
                        'responses' => ['200' => ['description' => 'Product deactivated without physical deletion']],
                    ],
                ],
                '/api/v1/orders' => [
                    'get' => [
                        'summary' => 'List orders',
                        'tags' => ['Orders'],
                        'responses' => ['200' => ['description' => 'Order list']],
                    ],
                    'post' => [
                        'summary' => 'Create order with products',
                        'tags' => ['Orders'],
                        'requestBody' => ['$ref' => '#/components/requestBodies/OrderPayload'],
                        'responses' => [
                            '201' => ['description' => 'Order created and total calculated'],
                            '422' => ['$ref' => '#/components/responses/ValidationError'],
                        ],
                    ],
                ],
                '/api/v1/orders/{order}' => [
                    'get' => [
                        'summary' => 'Get order by ID',
                        'tags' => ['Orders'],
                        'parameters' => [['$ref' => '#/components/parameters/OrderId']],
                        'responses' => ['200' => ['description' => 'Order detail']],
                    ],
                ],
                '/api/v1/orders/{order}/items' => [
                    'post' => [
                        'summary' => 'Add product to a pending order',
                        'tags' => ['Orders'],
                        'parameters' => [['$ref' => '#/components/parameters/OrderId']],
                        'requestBody' => ['$ref' => '#/components/requestBodies/OrderItemPayload'],
                        'responses' => [
                            '200' => ['description' => 'Product added and order total recalculated'],
                            '422' => ['$ref' => '#/components/responses/ValidationError'],
                        ],
                    ],
                ],
                '/api/v1/orders/{order}/status' => [
                    'patch' => [
                        'summary' => 'Change order status',
                        'tags' => ['Orders'],
                        'parameters' => [['$ref' => '#/components/parameters/OrderId']],
                        'requestBody' => [
                            'required' => true,
                            'content' => [
                                'application/json' => [
                                    'schema' => [
                                        'type' => 'object',
                                        'required' => ['status'],
                                        'properties' => [
                                            'status' => [
                                                'type' => 'string',
                                                'enum' => ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'responses' => [
                            '200' => ['description' => 'Order status updated'],
                            '422' => ['$ref' => '#/components/responses/ValidationError'],
                        ],
                    ],
                ],
            ],
            'components' => [
                'parameters' => [
                    'CustomerId' => [
                        'name' => 'customer',
                        'in' => 'path',
                        'required' => true,
                        'schema' => ['type' => 'string', 'format' => 'uuid'],
                    ],
                    'ProductId' => [
                        'name' => 'product',
                        'in' => 'path',
                        'required' => true,
                        'schema' => ['type' => 'string', 'format' => 'uuid'],
                    ],
                    'OrderId' => [
                        'name' => 'order',
                        'in' => 'path',
                        'required' => true,
                        'schema' => ['type' => 'string', 'format' => 'uuid'],
                    ],
                ],
                'requestBodies' => [
                    'CustomerPayload' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'required' => ['full_name', 'email'],
                                    'properties' => [
                                        'full_name' => ['type' => 'string'],
                                        'email' => ['type' => 'string', 'format' => 'email'],
                                        'phone' => ['type' => 'string', 'nullable' => true],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'ProductPayload' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'required' => ['name', 'price', 'stock'],
                                    'properties' => [
                                        'name' => ['type' => 'string'],
                                        'description' => ['type' => 'string', 'nullable' => true],
                                        'price' => ['type' => 'number', 'minimum' => 0.01],
                                        'stock' => ['type' => 'integer', 'minimum' => 0],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'OrderPayload' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'required' => ['customer_id', 'items'],
                                    'properties' => [
                                        'customer_id' => ['type' => 'string', 'format' => 'uuid'],
                                        'items' => [
                                            'type' => 'array',
                                            'minItems' => 1,
                                            'items' => ['$ref' => '#/components/schemas/OrderItemInput'],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'OrderItemPayload' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => ['$ref' => '#/components/schemas/OrderItemInput'],
                            ],
                        ],
                    ],
                ],
                'responses' => [
                    'ValidationError' => ['description' => 'Validation error'],
                ],
                'schemas' => [
                    'OrderItemInput' => [
                        'type' => 'object',
                        'required' => ['product_id', 'quantity'],
                        'properties' => [
                            'product_id' => ['type' => 'string', 'format' => 'uuid'],
                            'quantity' => ['type' => 'integer', 'minimum' => 1],
                        ],
                    ],
                ],
            ],
        ]);
    }
}
