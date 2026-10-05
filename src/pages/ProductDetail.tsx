import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag, Share2, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { createWhatsAppLink } from '../lib/supabase';
import type { Product } from '../types';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), categories(*)')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-ivory flex items-center justify-center">
        <div className="spinner-luxury" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-20 min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">🔍</span>
          <h2 className="font-heading text-2xl text-chocolate mb-4">Product Not Found</h2>
          <Link to="/shop" className="btn-primary">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  return (
    <div className="pt-20 bg-ivory min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-coffee/60 hover:text-gold transition-colors">
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gradient-to-br from-cream to-beige/20 rounded-sm overflow-hidden border border-beige/20">
              {images.length > 0 && images[selectedImage]?.image_url ? (
                <img
                  src={images[selectedImage].image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl">
                  📦
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-sm overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-gold shadow-luxury'
                        : 'border-beige/30 hover:border-gold/50'
                    }`}
                  >
                    {img.image_url ? (
                      <img
                        src={img.image_url}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-cream/50 flex items-center justify-center text-2xl">
                        📦
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <p className="text-xs font-label tracking-[0.2em] uppercase text-gold">
              {product.category?.name || 'Fabric Art'}
            </p>

            {/* Title */}
            <h1 className="font-heading text-3xl sm:text-4xl font-medium text-chocolate">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-medium text-chocolate">
                    ₹{product.sale_price!.toLocaleString()}
                  </span>
                  <span className="text-xl text-coffee/40 line-through">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="badge-luxury bg-blush text-white">
                    {discountPercent}% OFF
                  </span>
                </>
              ) : (
                <span className="text-3xl font-medium text-chocolate">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="border-t border-beige/30 pt-6">
                <p className="text-coffee/70 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="text-xs font-label tracking-wider uppercase text-coffee/70 mb-3">
                  Select Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm border rounded-sm transition-all ${
                        selectedSize === size
                          ? 'border-gold bg-gold/10 text-chocolate'
                          : 'border-beige text-coffee/60 hover:border-gold'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <p className="text-xs font-label tracking-wider uppercase text-coffee/70 mb-3">
                  Select Color
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-sm border rounded-sm transition-all ${
                        selectedColor === color
                          ? 'border-gold bg-gold/10 text-chocolate'
                          : 'border-beige text-coffee/60 hover:border-gold'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-xs font-label tracking-wider uppercase text-coffee/70 mb-3">
                Quantity
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-beige rounded-sm flex items-center justify-center hover:border-gold transition-colors"
                >
                  -
                </button>
                <span className="text-lg font-medium text-chocolate w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-beige rounded-sm flex items-center justify-center hover:border-gold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => addItem(product, quantity, selectedSize, selectedColor)}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-14 h-14 border rounded-sm flex items-center justify-center transition-all ${
                  isInWishlist(product.id)
                    ? 'border-blush bg-blush/10 text-blush'
                    : 'border-beige text-coffee/60 hover:border-gold hover:text-gold'
                }`}
              >
                <Heart size={20} className={isInWishlist(product.id) ? 'fill-current' : ''} />
              </button>
            </div>

            {/* WhatsApp Inquiry */}
            <a
              href={createWhatsAppLink(
                `Hi! I'm interested in: ${product.name} (₹${product.sale_price || product.price})`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              Inquire on WhatsApp
            </a>

            {/* Product Details */}
            <div className="border-t border-beige/30 pt-6 space-y-3">
              {product.material && (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-label tracking-wider uppercase text-coffee/50 w-24">
                    Material
                  </span>
                  <span className="text-sm text-chocolate">{product.material}</span>
                </div>
              )}
              {product.customization_available && (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-label tracking-wider uppercase text-coffee/50 w-24">
                    Custom
                  </span>
                  <span className="text-sm text-chocolate">
                    ✅ Customization available
                  </span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="text-xs font-label tracking-wider uppercase text-coffee/50 w-24">
                  Stock
                </span>
                <span className={`text-sm ${
                  product.stock_quantity > 0 ? 'text-sage' : 'text-blush'
                }`}>
                  {product.stock_quantity > 0 
                    ? `${product.stock_quantity} in stock`
                    : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
