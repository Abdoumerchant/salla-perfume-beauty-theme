$path = "src\views\pages\product\single.twig"

if (!(Test-Path $path)) {
    Write-Error "File not found: $path. Run this script from the theme root folder."
    exit 1
}

$content = Get-Content $path -Raw

if ($content -match 'application/ld\+json') {
    Write-Host "Product schema already exists in $path" -ForegroundColor Yellow
    exit 0
}

$schema = @'

    {# Stronger Theme - Product Schema Markup #}
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": {{ (product.url ~ '#product')|json_encode|raw }},
      "name": {{ product.name|json_encode|raw }},
      "description": {{ product.description|striptags|default(product.name)|json_encode|raw }},
      "url": {{ product.url|json_encode|raw }},
      "sku": {{ product.sku|default(product.id)|json_encode|raw }},
      {% if product.brand.name %}
      "brand": {
        "@type": "Brand",
        "name": {{ product.brand.name|json_encode|raw }}
      },
      {% endif %}
      "image": [
        {% if product.images|length %}
          {% for image in product.images %}
            {{ image.url|json_encode|raw }}{{ not loop.last ? ',' : '' }}
          {% endfor %}
        {% else %}
          {{ product.image.url|json_encode|raw }}
        {% endif %}
      ],
      {% if product.rating and product.rating.count > 0 %}
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "{{ product.rating.stars }}",
        "reviewCount": "{{ product.rating.count }}"
      },
      {% endif %}
      "offers": {
        "@type": "Offer",
        "url": {{ product.url|json_encode|raw }},
        "priceCurrency": {{ product.currency|default('SAR')|json_encode|raw }},
        "price": "{{ product.is_on_sale ? product.sale_price : product.price }}",
        "availability": "https://schema.org/{{ product.is_available ? 'InStock' : 'OutOfStock' }}",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": {{ store.name|json_encode|raw }},
          "url": {{ store.url|json_encode|raw }}
        }
      }
    }
    </script>
'@

$markerPattern = "`r?`n\{% endblock %\}`r?`n`r?`n\{% block scripts %\}"

if ($content -notmatch $markerPattern) {
    Write-Error "Could not find the content endblock before the scripts block. Please send the current single.twig file."
    exit 1
}

$updated = [regex]::Replace($content, $markerPattern, "$schema`r`n{% endblock %}`r`n`r`n{% block scripts %}", 1)
Set-Content -Path $path -Value $updated -Encoding UTF8
Write-Host "Product schema inserted successfully into $path" -ForegroundColor Green
