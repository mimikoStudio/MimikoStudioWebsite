import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, MessageCircle, CheckCircle, Clock, Package } from 'lucide-react';
import { createWhatsAppLink } from '../../lib/supabase';

export default function OrdersManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('order_status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      // Error fetching orders handled silently
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', id);
      
      if (error) throw error;
      fetchOrders();
      
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, order_status: status });
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handlePaymentUpdate = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: status })
        .eq('id', id);
      
      if (error) throw error;
      fetchOrders();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gold/10 text-gold border-gold/20',
      confirmed: 'bg-sky/10 text-sky border-sky/20',
      processing: 'bg-sage/10 text-sage border-sage/20',
      shipped: 'bg-blush/10 text-blush border-blush/20',
      delivered: 'bg-leaf/10 text-leaf border-leaf/20',
      cancelled: 'bg-chocolate/10 text-chocolate border-chocolate/20',
    };
    return colors[status] || 'bg-coffee/10 text-coffee border-coffee/20';
  };

  const getPaymentColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gold/10 text-gold',
      paid: 'bg-sage/10 text-sage',
      failed: 'bg-blush/10 text-blush',
      refunded: 'bg-chocolate/10 text-chocolate',
    };
    return colors[status] || 'bg-coffee/10 text-coffee';
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="spinner-luxury" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading text-chocolate">📦 Orders Management</h2>
        <div className="text-sm text-coffee/60">
          Total: {orders.length} orders
        </div>
      </div>

      {/* Filters */}
      <div className="bg-pearl border border-beige/20 rounded-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-luxury"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-pearl border border-beige/20 rounded-sm p-6 hover:shadow-luxury transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-heading text-lg text-chocolate">
                    Order #{order.order_number}
                  </h3>
                  <span className={`badge-luxury border ${getStatusColor(order.order_status)}`}>
                    {order.order_status}
                  </span>
                  <span className={`badge-luxury ${getPaymentColor(order.payment_status)}`}>
                    {order.payment_status}
                  </span>
                </div>
                <p className="text-xs text-coffee/50">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-medium text-chocolate">₹{order.total_amount.toLocaleString()}</p>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="btn-outline mt-2 flex items-center gap-2"
                >
                  <Eye size={14} /> View Details
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-coffee/50 text-xs mb-1">Customer</p>
                <p className="text-chocolate font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-coffee/50 text-xs mb-1">Phone</p>
                <p className="text-chocolate">{order.phone}</p>
              </div>
              <div>
                <p className="text-coffee/50 text-xs mb-1">Items</p>
                <p className="text-chocolate">
                  {order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0} items
                </p>
              </div>
              <div>
                <p className="text-coffee/50 text-xs mb-1">Email</p>
                <p className="text-chocolate text-xs">{order.email}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-beige/20">
              <a
                href={createWhatsAppLink(
                  `Hi ${order.customer_name}! Regarding your order ${order.order_number}...`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex items-center gap-2"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              {order.order_status === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckCircle size={14} /> Confirm Order
                </button>
              )}
              {order.order_status === 'confirmed' && (
                <button
                  onClick={() => handleStatusUpdate(order.id, 'processing')}
                  className="btn-primary flex items-center gap-2"
                >
                  <Package size={14} /> Start Processing
                </button>
              )}
              {order.order_status === 'processing' && (
                <button
                  onClick={() => handleStatusUpdate(order.id, 'shipped')}
                  className="btn-primary flex items-center gap-2"
                >
                  <Package size={14} /> Mark as Shipped
                </button>
              )}
              {order.order_status === 'shipped' && (
                <button
                  onClick={() => handleStatusUpdate(order.id, 'delivered')}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckCircle size={14} /> Mark as Delivered
                </button>
              )}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12 bg-pearl border border-beige/20 rounded-sm">
            <p className="text-coffee/40">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-chocolate/50 z-50 flex items-center justify-center p-4">
          <div className="bg-pearl rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-beige/20 flex items-center justify-between">
              <h3 className="text-xl font-heading text-chocolate">
                Order #{selectedOrder.order_number}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-coffee/60 hover:text-chocolate"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-3">
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-coffee/50">Name</p>
                    <p className="text-chocolate">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-coffee/50">Email</p>
                    <p className="text-chocolate">{selectedOrder.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-coffee/50">Phone</p>
                    <p className="text-chocolate">{selectedOrder.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-coffee/50">Order Date</p>
                    <p className="text-chocolate">
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-3">
                  Shipping Address
                </h4>
                <p className="text-chocolate bg-cream/30 p-4 rounded-sm">
                  {selectedOrder.shipping_address}
                </p>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-3">
                  Order Items
                </h4>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-ivory rounded-sm">
                      <div>
                        <p className="text-chocolate font-medium">{item.product_name}</p>
                        <p className="text-xs text-coffee/50">
                          Quantity: {item.quantity}
                          {item.selected_options?.size && ` • Size: ${item.selected_options.size}`}
                          {item.selected_options?.color && ` • Color: ${item.selected_options.color}`}
                        </p>
                      </div>
                      <p className="text-chocolate font-medium">
                        ₹{(item.unit_price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h4 className="font-label text-sm tracking-wider uppercase text-gold mb-3">
                  Payment Summary
                </h4>
                <div className="space-y-2 bg-cream/30 p-4 rounded-sm">
                  <div className="flex justify-between text-sm">
                    <span className="text-coffee/60">Subtotal</span>
                    <span className="text-chocolate">₹{selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-coffee/60">Shipping</span>
                    <span className="text-chocolate">₹{selectedOrder.shipping_fee.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-coffee/60">Discount</span>
                      <span className="text-blush">-₹{selectedOrder.discount_amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-beige/30 pt-2 flex justify-between text-lg font-medium">
                    <span className="text-chocolate">Total</span>
                    <span className="text-chocolate">₹{selectedOrder.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Status Updates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Order Status
                  </label>
                  <select
                    value={selectedOrder.order_status}
                    onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                    className="select-luxury"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-label tracking-wider uppercase text-coffee/70 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={selectedOrder.payment_status}
                    onChange={(e) => handlePaymentUpdate(selectedOrder.id, e.target.value)}
                    className="select-luxury"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-beige/20">
                <a
                  href={createWhatsAppLink(
                    `Hi ${selectedOrder.customer_name}! Regarding your order ${selectedOrder.order_number}...`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} /> Contact Customer
                </a>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn-outline flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
