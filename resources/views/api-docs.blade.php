<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Point of Sale API Docs</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
        <link rel="stylesheet" href="{{ asset('swagger-docs.css') }}">
    </head>
    <body>
        <div id="swagger-ui" data-spec-url="{{ route('api.docs.spec') }}"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script src="{{ asset('swagger-initializer.js') }}"></script>
    </body>
</html>
