window.addEventListener('load', () => {
    const swaggerElement = document.getElementById('swagger-ui');

    window.ui = SwaggerUIBundle({
        url: swaggerElement.dataset.specUrl,
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout',
    });
});
