# eCommerce Tasks

---

## Create products schema

[todo][08-07-2026]

- id, title, slug, description, short description, meta, created_at, status (product status), product type (simple, variable, affiliate), featured image, gallary,  
category, tags, brand

Pricing
Regular Price
Sale Price
Cost Price
Tax Class
Currency

- inventory - sku, manage stock, quantity, stock status, allow backorders, 

- linked products
  up sell
  cross sell

shipping

  width, height, weight, length

attributes
  size, color, material

Product Status
        
| Field              | Values                                |
| ------------------ | ------------------------------------- |
| Status             | Draft / Pending / Private / Published |
| Catalog Visibility | Shop, Search, Hidden                  |
| Featured Product   | Yes / No                              |
| Menu Order         | Integer                               |


Reviews

Field
Enable Reviews
Average Rating
Rating Count

Custom Fields (Meta Data)

WooCommerce allows unlimited custom fields, for example:

Warranty
Return Policy
Country of Origin
Manufacturer
Barcode (EAN/UPC)
ISBN
Model Number
Product Video URL
Care Instructions
Ingredients
Expiry Date

stored in meta

SEO
Meta Title
Meta Description
Canonical URL