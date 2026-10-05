import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { supabase, createWhatsAppLink } from '../lib/supabase';
import { validateCartStock, createOrderWithStockUpdate } from '../lib/stockValidation';
import { getImageUrl } from '../lib/imageUtils';

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    notes: '',
  });

  const shippingFee = totalPrice > 1999 ? 0 : 99;
  const finalTotal = totalPrice + shippingFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Step 1: Validate stock for all products
      const stockValidation = await validateCartStock(
        items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        }))
      );

      if (!stockValidation.allValid) {
        const failedItems = stockValidation.results.filter(r => !r.valid);
        const errorMessages = failedItems.map(r => r.message).join('\n');
        alert(`Insufficient stock:\n\n${errorMessages}\n\nPlease adjust quantities and try again.`);
        return;
      }

      // Step 2: Create order with stock update
      const orderNumber = `ORD-${Date.now()}`;
      
      const orderData = {
        order_number: orderNumber,
        customer_name: checkoutData.name,
        email: checkoutData.email,
        phone: checkoutData.phone,
        shipping_address: `${checkoutData.address}, ${checkoutData.city} - ${checkoutData.pincode}`,
        subtotal: totalPrice,
        shipping_fee: shippingFee,
        discount_amount: 0,
        total_amount: finalTotal,
        payment_status: 'pending',
        order_status: 'pending',
      };

      const orderItems = items.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        unit_price: item.product.sale_price || item.product.price,
        quantity: item.quantity,
        selected_options: {
          size: item.selectedSize || '',
          color: item.selectedColor || '',
        },
      }));

      const result = await createOrderWithStockUpdate(orderData, orderItems);

      if (!result.success) {
        alert(`Order creation failed: ${result.error}`);
        return;
      }

      setOrderPlaced(true);
      clearCart();

      // Send WhatsApp notification
      const message = `New Order ${orderNumber}\n\nCustomer: ${checkoutData.name}\nPhone: ${checkoutData.phone}\nTotal: ₹${finalTotal}\n\nItems:\n${items.map(i => `- ${i.product.name} x${i.quantity}`).join('\n')}`;
      
      window.open(createWhatsAppLink(message), '_blank');

    } catch (error: any) {
      alert('Error placing order: ' + error.message);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="pt-20 min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-coffee/20 mb-4" />
          <h2 className="font-heading text-2xl text-chocolate mb-4">Your Cart is Empty</h2>
          <p className="text-coffee/60 mb-6">Add some beautiful handcrafted products to your cart!</p>
          <Link to="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="pt-20 min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage/10 flex items-center justify-center">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="font-heading text-3xl text-chocolate mb-4">Order Placed Successfully!</h2>
          <p className="text-coffee/60 mb-6">
            Thank you for your order! We'll contact you soon to confirm the details and arrange payment.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/shop" className="btn-primary">
              Continue Shopping
            </Link>
            <Link to="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-ivory min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-coffee/60 hover:text-gold transition-colors mb-2">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
            <h1 className="font-heading text-3xl text-chocolate">Shopping Cart</h1>
          </div>
          <p className="text-coffee/60">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>

        {!showCheckout ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="bg-pearl border border-beige/20 rounded-sm p-4 flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-cream to-beige/20 rounded-sm overflow-hidden">
                    {item.product.images && item.product.images.length > 0 && item.product.images[0]?.image_url ? (
                      <img
                        src={getImageUrl(item.product.images[0].image_url) || ''}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23F5F5F5" width="96" height="96"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="32" fill="%23999"%3E📦%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-heading text-lg text-chocolate mb-1">{item.product.name}</h3>
                    <p className="text-sm text-coffee/60 mb-2">
                      {item.selectedSize && `Size: ${item.selectedSize}`}
                      {item.selectedSize && item.selectedColor && ' • '}
                      {item.selectedColor && `Color: ${item.selectedColor}`}
                    </p>
                    <p className="text-lg font-medium text-chocolate">
                      ₹{(item.product.sale_price || item.product.price).toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-coffee/40 hover:text-blush transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const result = await updateQuantity(item.product.id, item.quantity - 1);
                          if (!result.success) {
                            alert(result.message);
                          }
                        }}
                        className="w-8 h-8 border border-beige rounded-sm flex items-center justify-center hover:border-gold transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-chocolate">{item.quantity}</span>
                      <button
                        onClick={async () => {
                          const result = await updateQuantity(item.product.id, item.quantity + 1);
                          if (!result.success) {
                            alert(result.message);
                          }
                        }}
                        disabled={item.quantity >= item.product.stock_quantity}
                        className="w-8 h-8 border border-beige rounded-sm flex items-center justify-center hover:border-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    {/* Stock Warning */}
                    {item.quantity >= item.product.stock_quantity && (
                      <p className="text-xs text-orange-600 mt-1">
                        Max: {item.product.stock_quantity} available
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-pearl border border-beige/20 rounded-sm p-6 sticky top-24">
                <h2 className="font-heading text-xl text-chocolate mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-coffee/60">Subtotal</span>
                    <span className="text-chocolate">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-coffee/60">Shipping</span>
                    <span className="text-chocolate">
                      {shippingFee === 0 ? (
                        <span className="text-sage">FREE</span>
                      ) : (
                        `₹${shippingFee}`
                      )}
                    </span>
                  </div>
                  {totalPrice < 1999 && (
                    <p className="text-xs text-gold">
                      Add ₹{(1999 - totalPrice).toLocaleString()} more for free shipping!
                    </p>
                  )}
                  <div className="border-t border-beige/30 pt-3 flex justify-between">
                    <span className="font-medium text-chocolate">Total</span>
                    <span className="text-xl font-medium text-chocolate">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowCheckout(true)}
                  className="btn-primary w-full"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div className="max-w-2xl mx-auto">
            <div className="bg-pearl border border-beige/20 rounded-sm p-8">
              <h2 className="font-heading text-2xl text-chocolate mb-6">Checkout</h2>
              
              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={checkoutData.name}
                    onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                    className="input-luxury"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={checkoutData.email}
                      onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={checkoutData.phone}
                      onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                      className="input-luxury"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Address *
                  </label>
                  <textarea
                    required
                    value={checkoutData.address}
                    onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                    className="textarea-luxury"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={checkoutData.city}
                      onChange={(e) => setCheckoutData({ ...checkoutData, city: e.target.value })}
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={checkoutData.pincode}
                      onChange={(e) => setCheckoutData({ ...checkoutData, pincode: e.target.value })}
                      className="input-luxury"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={checkoutData.notes}
                    onChange={(e) => setCheckoutData({ ...checkoutData, notes: e.target.value })}
                    className="textarea-luxury"
                    rows={2}
                    placeholder="Any special instructions?"
                  />
                </div>

                {/* Order Summary */}
                <div className="border-t border-beige/30 pt-4 mt-6">
                  <h3 className="font-heading text-lg text-chocolate mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    {items.map(item => (
                      <div key={item.product.id} className="flex justify-between">
                        <span className="text-coffee/60">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span className="text-chocolate">
                          ₹{((item.product.sale_price || item.product.price) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-beige/20 pt-2 flex justify-between">
                      <span className="text-coffee/60">Shipping</span>
                      <span className="text-chocolate">
                        {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                      </span>
                    </div>
                    <div className="border-t border-beige/20 pt-2 flex justify-between text-lg font-medium">
                      <span className="text-chocolate">Total</span>
                      <span className="text-chocolate">₹{finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    Place Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    className="btn-secondary flex-1"
                  >
                    Back to Cart
                  </button>
                </div>

                <p className="text-xs text-coffee/50 text-center mt-4">
                  Payment will be arranged via WhatsApp after order confirmation
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
