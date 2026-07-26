> Archived pre-v2 schema retained for historical reference.

## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `username` | `varchar` |  Nullable |
| `email` | `varchar` |  Nullable |
| `avatar_url` | `varchar` |  Nullable |
| `is_new` | `bool` |  Nullable |

## Table `vendors`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `name` | `varchar` |  Nullable |
| `category` | `varchar` |  Nullable |
| `address` | `varchar` |  Nullable |
| `rating` | `numeric` |  Nullable |
| `image_url` | `text` |  Nullable |

## Table `products`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `vendor_id` | `varchar` |  Nullable |
| `category` | `varchar` |  Nullable |
| `name` | `varchar` |  Nullable |
| `price` | `numeric` |  Nullable |
| `image_url` | `text` |  Nullable |

## Table `user_favorite_products`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `varchar` |  Nullable |
| `product_id` | `varchar` |  Nullable |
| `saved_at` | `timestamp` |  Nullable |

## Table `reviews`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `varchar` |  Nullable |
| `product_id` | `varchar` |  Nullable |
| `rating` | `int4` |  Nullable |
| `comment` | `text` |  Nullable |
| `created_at` | `timestamp` |  Nullable |

## Table `task_dictionary`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `name` | `varchar` |  Nullable |
| `is_mandatory` | `bool` |  Nullable |

## Table `user_journey_tasks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `varchar` |  Nullable |
| `task_id` | `varchar` |  Nullable |
| `status` | `varchar` |  Nullable |
| `completed_at` | `timestamp` |  Nullable |

## Table `vouchers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `vendor_id` | `varchar` |  Nullable |
| `required_task_id` | `varchar` |  Nullable |
| `title` | `varchar` |  Nullable |
| `discount_value` | `varchar` |  Nullable |

## Table `user_vouchers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `varchar` |  Nullable |
| `voucher_id` | `varchar` |  Nullable |
| `status` | `varchar` |  Nullable |
| `unlocked_at` | `timestamp` |  Nullable |

## Table `posts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `user_id` | `varchar` |  Nullable |
| `content` | `text` |  Nullable |
| `views_count` | `int4` |  Nullable |
| `created_at` | `timestamp` |  Nullable |

## Table `post_comments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `post_id` | `varchar` |  Nullable |
| `user_id` | `varchar` |  Nullable |
| `content` | `text` |  Nullable |
| `created_at` | `timestamp` |  Nullable |

## Table `post_likes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `post_id` | `varchar` | Primary |
| `user_id` | `varchar` | Primary |
| `created_at` | `timestamp` |  Nullable |

## Table `tags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `name` | `varchar` |  Nullable Unique |

## Table `post_tags`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `post_id` | `varchar` | Primary |
| `tag_id` | `varchar` | Primary |

## Table `chat_messages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `user_id` | `varchar` |  Nullable |
| `role` | `varchar` |  Nullable |
| `content` | `text` |  Nullable |
| `suggested_product_id` | `varchar` |  Nullable |
| `created_at` | `timestamp` |  Nullable |

## Table `customization_options`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `category` | `varchar` |  Nullable |
| `name` | `varchar` |  Nullable |
| `display_order` | `int4` |  Nullable |

## Table `customization_values`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `option_id` | `varchar` |  Nullable |
| `value_name` | `varchar` |  Nullable |
| `extra_price` | `numeric` |  Nullable |

## Table `user_designs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `user_id` | `varchar` |  Nullable |
| `category` | `varchar` |  Nullable |
| `total_price` | `numeric` |  Nullable |
| `created_at` | `timestamp` |  Nullable |

## Table `user_design_selections`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `design_id` | `varchar` | Primary |
| `value_id` | `varchar` | Primary |

## Table `product_images`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `product_id` | `varchar` |  Nullable |
| `image_url` | `text` |  Nullable |
| `is_main` | `bool` |  Nullable |

## Table `product_options`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `product_id` | `varchar` | Primary |
| `option_id` | `varchar` | Primary |

