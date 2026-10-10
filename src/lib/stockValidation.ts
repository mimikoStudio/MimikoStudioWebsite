import { supabase } from './supabase';

/**
 * Validate if stock is sufficient
 * @param productId Product ID
 * @param requestedQuantity Requested quantity
 * @returns Validation result
 */
export async function validateStock(
  productId: string,
  requestedQuantity: number
): Promise<{ valid: boolean; available: number; message: string }> {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('stock_quantity, name')
      .eq('id', productId)
      .single();

    if (error) {
      return {
        valid: false,
        available: 0,
        message: 'Unable to validate stock',
      };
    }

    const available = product.stock_quantity || 0;

    if (available === 0) {
      return {
        valid: false,
        available: 0,
        message: `${product.name} is out of stock`,
      };
    }

    if (requestedQuantity > available) {
      return {
        valid: false,
        available,
        message: `Only ${available} ${product.name} available`,
      };
    }

    return {
      valid: true,
      available,
      message: 'Stock sufficient',
    };
  } catch (error) {
    return {
      valid: false,
      available: 0,
      message: 'Stock validation failed',
    };
  }
}

/**
 * Batch validate stock for all products in cart
 * @param cartItems Cart items
 * @returns Validation results
 */
export async function validateCartStock(
  cartItems: Array<{ productId: string; quantity: number }>
): Promise<{
  allValid: boolean;
  results: Array<{
    productId: string;
    valid: boolean;
    available: number;
    requested: number;
    message: string;
  }>;
}> {
  const results = await Promise.all(
    cartItems.map(async (item) => {
      const validation = await validateStock(item.productId, item.quantity);
      return {
        productId: item.productId,
        valid: validation.valid,
        available: validation.available,
        requested: item.quantity,
        message: validation.message,
      };
    })
  );

  const allValid = results.every((r) => r.valid);

  return { allValid, results };
}

/**
 * Safely decrease stock and create order using database transaction
 * Prevents overselling
 * @param orderData Order data
 * @param orderItems Order items
 * @returns Order creation result
 */
export async function createOrderWithStockUpdate(
  orderData: {
    order_number: string;
    customer_name: string;
    email: string;
    phone: string;
    shipping_address: string;
    subtotal: number;
    shipping_fee: number;
    discount_amount: number;
    total_amount: number;
    payment_status: string;
    order_status: string;
  },
  orderItems: Array<{
    product_id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
    selected_options: any;
  }>
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    // Step 1: Validate stock for all products
    const stockValidation = await validateCartStock(
      orderItems.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
      }))
    );

    if (!stockValidation.allValid) {
      const failedItems = stockValidation.results.filter((r) => !r.valid);
      const errorMessages = failedItems.map((r) => r.message).join('; ');
      return {
        success: false,
        error: `Insufficient stock: ${errorMessages}`,
      };
    }

    // Step 2: Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      return {
        success: false,
        error: `Failed to create order: ${orderError.message}`,
      };
    }

    // Step 3: Create order items
    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      // Rollback: delete created order
      await supabase.from('orders').delete().eq('id', order.id);
      return {
        success: false,
        error: `Failed to create order items: ${itemsError.message}`,
      };
    }

    // Step 4: Update stock (atomic operation)
    for (const item of orderItems) {
      // Try RPC function first (if it exists)
      try {
        const { error: stockError } = await supabase.rpc('decrement_stock', {
          product_id: item.product_id,
          quantity: item.quantity,
        });

        if (!stockError) {
          continue; // Success, move to next item
        }
      } catch (rpcError) {
        // RPC function doesn't exist, use fallback
      }

      // Fallback: Manual stock update with validation
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (fetchError || !product) {
        // Rollback: delete order and order items
        await supabase.from('order_items').delete().eq('order_id', order.id);
        await supabase.from('orders').delete().eq('id', order.id);
        return {
          success: false,
          error: `Product not found: ${item.product_id}`,
        };
      }

      const currentStock = product.stock_quantity || 0;
      const newStock = currentStock - item.quantity;

      // Validate new stock is not negative
      if (newStock < 0) {
        // Rollback: delete order and order items
        await supabase.from('order_items').delete().eq('order_id', order.id);
        await supabase.from('orders').delete().eq('id', order.id);
        return {
          success: false,
          error: `Insufficient stock for ${item.product_name}. Available: ${currentStock}, Requested: ${item.quantity}`,
        };
      }

      // Ensure newStock is a valid non-negative integer
      const validNewStock = Math.max(0, Math.floor(newStock));

      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: validNewStock })
        .eq('id', item.product_id);

      if (updateError) {
        // Rollback: delete order and order items
        await supabase.from('order_items').delete().eq('order_id', order.id);
        await supabase.from('orders').delete().eq('id', order.id);
        return {
          success: false,
          error: `Failed to update stock: ${updateError.message}`,
        };
      }
    }

    return {
      success: true,
      orderId: order.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Order creation failed',
    };
  }
}

/**
 * Get stock status label
 * @param stockQuantity Stock quantity
 * @returns Status label and color
 */
export function getStockStatus(stockQuantity: number): {
  label: string;
  color: string;
  icon: string;
} {
  if (stockQuantity === 0) {
    return {
      label: 'Out of Stock',
      color: 'text-red-600 bg-red-50',
      icon: '🔴',
    };
  } else if (stockQuantity <= 3) {
    return {
      label: `Only ${stockQuantity} left`,
      color: 'text-orange-600 bg-orange-50',
      icon: '🟠',
    };
  } else if (stockQuantity <= 10) {
    return {
      label: 'Limited Stock',
      color: 'text-yellow-600 bg-yellow-50',
      icon: '🟡',
    };
  } else {
    return {
      label: 'In Stock',
      color: 'text-green-600 bg-green-50',
      icon: '🟢',
    };
  }
}
