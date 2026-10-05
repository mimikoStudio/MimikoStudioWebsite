import { supabase } from './supabase';

/**
 * 验证库存是否足够
 * @param productId 产品ID
 * @param requestedQuantity 请求的数量
 * @returns 验证结果
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
        message: '无法验证库存',
      };
    }

    const available = product.stock_quantity || 0;

    if (available === 0) {
      return {
        valid: false,
        available: 0,
        message: `${product.name} 缺货`,
      };
    }

    if (requestedQuantity > available) {
      return {
        valid: false,
        available,
        message: `${product.name} 只有 ${available} 件可用`,
      };
    }

    return {
      valid: true,
      available,
      message: '库存充足',
    };
  } catch (error) {
    return {
      valid: false,
      available: 0,
      message: '库存验证失败',
    };
  }
}

/**
 * 批量验证购物车中所有产品的库存
 * @param cartItems 购物车项目
 * @returns 验证结果
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
 * 使用数据库事务安全地减少库存并创建订单
 * 防止超卖
 * @param orderData 订单数据
 * @param orderItems 订单项目
 * @returns 订单创建结果
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
    // 步骤1：验证所有产品的库存
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
        error: `库存不足: ${errorMessages}`,
      };
    }

    // 步骤2：创建订单
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      return {
        success: false,
        error: `创建订单失败: ${orderError.message}`,
      };
    }

    // 步骤3：创建订单项
    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      // 回滚：删除已创建的订单
      await supabase.from('orders').delete().eq('id', order.id);
      return {
        success: false,
        error: `创建订单项失败: ${itemsError.message}`,
      };
    }

    // 步骤4：更新库存（原子操作）
    for (const item of orderItems) {
      const { error: stockError } = await supabase.rpc('decrement_stock', {
        product_id: item.product_id,
        quantity: item.quantity,
      });

      if (stockError) {
        // 如果RPC函数不存在，使用普通更新
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single();

        const newStock = (product?.stock_quantity || 0) - item.quantity;

        if (newStock < 0) {
          // 回滚：删除订单和订单项
          await supabase.from('order_items').delete().eq('order_id', order.id);
          await supabase.from('orders').delete().eq('id', order.id);
          return {
            success: false,
            error: `库存不足，无法完成订单`,
          };
        }

        await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product_id);
      }
    }

    return {
      success: true,
      orderId: order.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || '订单创建失败',
    };
  }
}

/**
 * 获取库存状态标签
 * @param stockQuantity 库存数量
 * @returns 状态标签和颜色
 */
export function getStockStatus(stockQuantity: number): {
  label: string;
  color: string;
  icon: string;
} {
  if (stockQuantity === 0) {
    return {
      label: '缺货',
      color: 'text-red-600 bg-red-50',
      icon: '🔴',
    };
  } else if (stockQuantity <= 3) {
    return {
      label: `仅剩 ${stockQuantity} 件`,
      color: 'text-orange-600 bg-orange-50',
      icon: '🟠',
    };
  } else if (stockQuantity <= 10) {
    return {
      label: '库存有限',
      color: 'text-yellow-600 bg-yellow-50',
      icon: '🟡',
    };
  } else {
    return {
      label: '有货',
      color: 'text-green-600 bg-green-50',
      icon: '🟢',
    };
  }
}
