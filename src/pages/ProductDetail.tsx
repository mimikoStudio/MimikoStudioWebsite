import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingBag, MessageCircle, Share2, Truck, Shield, RotateCcw, Star, ChevronRight, ZoomIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase, createWhatsAppLink } from '../lib/supabase';
import { getStockStatus } from '../lib/stockValidation';
import FabricImageViewer from '../components/FabricImageViewer';
import { useI18n } from '../i18n/I18nContext';
import type { Product } from '../types';

// Helper function to get image URL (handles base64, URLs, and storage paths)
function getProductImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  
  // If it's already a data URL (base64), return as-is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // If it's already a full URL, return as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a storage path, construct the full URL
  if (imageUrl.startsWith('products/') || imageUrl.startsWith('gallery/')) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const bucketName = imageUrl.startsWith('products/') ? 'product-images' : 'website-content';
    return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${imageUrl}`;
  }
  
  // Fallback: assume it's a storage path in product-images bucket
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/product-images/${imageUrl}`;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const { t } = useI18n();
  
  // All state hooks must be declared at the top
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews' | 'shipping'>('description');
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // All useEffect hooks must be declared at the top
  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  useEffect(() => {
    if (product?.category_id) {
      fetchRelatedProducts();
    }
  }, [product]);

  const fetchProduct = async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      // Try exact slug match first
      let { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), categories(*)')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      // If not found, try case-insensitive match
      if (error || !data) {
        const { data: caseInsensitiveData, error: caseInsensitiveError } = await supabase
          .from('products')
          .select('*, product_images(*), categories(*)')
          .ilike('slug', slug)
          .eq('is_published', true)
          .single();
        
        if (!caseInsensitiveError && caseInsensitiveData) {
          data = caseInsensitiveData;
          error = null;
        }
      }

      // If still not found, try matching by product name (for backward compatibility)
      if (error || !data) {
        const { data: nameMatchData, error: nameMatchError } = await supabase
          .from('products')
          .select('*, product_images(*), categories(*)')
          .ilike('name', slug.replace(/-/g, ' '))
          .eq('is_published', true)
          .single();
        
        if (!nameMatchError && nameMatchData) {
          data = nameMatchData;
          error = null;
        }
      }

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    if (!product?.category_id) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), categories(*)')
        .eq('category_id', product.category_id)
        .eq('is_published', true)
        .neq('id', product.id)
        .limit(4);

      if (!error && data) {
        setRelatedProducts(data);
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    const result = await addItem(product, quantity, selectedSize, selectedColor);
    if (result.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } else {
      alert(result.message);
    }
  };

  const handleShare = async () => {
    if (!product) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} - ₹${product.sale_price || product.price}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Early returns must come AFTER all hooks
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
          <h2 className="font-heading text-2xl text-chocolate mb-4">{t.messages.notFound}</h2>
          <Link to="/shop" className="btn-primary">{t.common.back}</Link>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  // Prepare images for viewer
  const viewerImages = images.map(img => ({
    url: getProductImageUrl(img.image_url) || '',
    alt: img.alt_text || product.name,
    title: img.alt_text,
    description: product.description,
  }));

  // Fetch related products
  const stockStatus = getStockStatus(product.stock_quantity);

  return (
    <div className="pt-20 bg-ivory min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-coffee/60 hover:text-gold transition-colors">Home</Link>
          <ChevronRight size={14} className="text-coffee/40" />
          <Link to="/shop" className="text-coffee/60 hover:text-gold transition-colors">Shop</Link>
          <ChevronRight size={14} className="text-coffee/40" />
          {product.category && (
            <>
              <Link to={`/shop?category=${product.category.slug}`} className="text-coffee/60 hover:text-gold transition-colors">
                {product.category.name}
              </Link>
              <ChevronRight size={14} className="text-coffee/40" />
            </>
          )}
          <span className="text-chocolate font-medium">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex gap-2">
              {product.is_new_arrival && (
                <span className="badge-luxury bg-sage text-white">✨ New Arrival</span>
              )}
              {product.is_featured && (
                <span className="badge-luxury bg-gold text-white">⭐ Featured</span>
              )}
              {hasDiscount && (
                <span className="badge-luxury bg-blush text-white">{discountPercent}% OFF</span>
              )}
            </div>

            {/* Main Image */}
            <div 
              className="aspect-square bg-gradient-to-br from-cream to-beige/20 curved-image-lg overflow-hidden border border-beige/20 shadow-curved cursor-zoom-in group relative"
              onClick={() => setIsViewerOpen(true)}
            >
              {images.length > 0 && images[selectedImage]?.image_url ? (
                <img
                  src={getProductImageUrl(images[selectedImage].image_url) || ''}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23F5F5F5" width="400" height="400"%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="24" fill="%23999"%3EImage unavailable%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl bg-gradient-to-br from-cream to-beige/30">
                  📦
                </div>
              )}
              
              {/* Zoom hint overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center pointer-events-none">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-4 shadow-lg">
                  <ZoomIn size={32} className="text-gold" />
                </div>
              </div>

              {/* Share button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                aria-label="Share product"
              >
                <Share2 size={18} className="text-chocolate" />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square curved-image-sm overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === idx
                        ? 'border-gold shadow-curved scale-105'
                        : 'border-beige/30 hover:border-gold/50 hover:scale-105'
                    }`}
                  >
                    {img.image_url ? (
                      <img
                        src={getProductImageUrl(img.image_url) || ''}
                        alt={`${product.name} view ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23F5F5F5" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="12" fill="%23999"%3ENo image%3C/text%3E%3C/svg%3E';
                        }}
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

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-beige/30">
              <div className="flex flex-col items-center text-center">
                <Truck size={24} className="text-gold mb-2" />
                <p className="text-xs font-medium text-chocolate">Free Shipping</p>
                <p className="text-xs text-coffee/50">On orders ₹1999+</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield size={24} className="text-gold mb-2" />
                <p className="text-xs font-medium text-chocolate">Secure Payment</p>
                <p className="text-xs text-coffee/50">100% Protected</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw size={24} className="text-gold mb-2" />
                <p className="text-xs font-medium text-chocolate">Easy Returns</p>
                <p className="text-xs text-coffee/50">7 Days Policy</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category */}
            <p className="text-xs font-label tracking-[0.3em] uppercase text-gold">
              {product.category?.name || 'Fabric Art'}
            </p>

            {/* Title */}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium text-chocolate leading-tight">
              {product.name}
            </h1>

            {/* Rating (Placeholder) */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={star <= 4 ? 'fill-gold text-gold' : 'text-beige'}
                  />
                ))}
              </div>
              <span className="text-sm text-coffee/60">(4.0) • 128 Reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-4xl font-bold text-chocolate">
                    ₹{product.sale_price!.toLocaleString()}
                  </span>
                  <span className="text-2xl text-coffee/40 line-through">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="badge-luxury bg-blush text-white text-sm px-3 py-1">
                    Save {discountPercent}%
                  </span>
                </>
              ) : (
                <span className="text-4xl font-bold text-chocolate">
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${stockStatus.color}`}>
              <span>{stockStatus.icon}</span>
              <span className="text-sm font-medium">{stockStatus.label}</span>
            </div>

            {/* Short Description */}
            {product.description && (
              <div className="border-t border-beige/30 pt-6">
                <p className="text-coffee/70 leading-relaxed text-lg">{product.description}</p>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-label tracking-wider uppercase text-coffee/70">
                    {t.product.size}
                  </p>
                  {selectedSize && (
                    <span className="text-xs text-gold">Selected: {selectedSize}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 text-sm border-2 rounded-lg transition-all duration-300 ${
                        selectedSize === size
                          ? 'border-gold bg-gold/10 text-chocolate font-medium shadow-md'
                          : 'border-beige text-coffee/60 hover:border-gold hover:bg-cream/30'
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
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-label tracking-wider uppercase text-coffee/70">
                    {t.product.color}
                  </p>
                  {selectedColor && (
                    <span className="text-xs text-gold">Selected: {selectedColor}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 text-sm border-2 rounded-lg transition-all duration-300 ${
                        selectedColor === color
                          ? 'border-gold bg-gold/10 text-chocolate font-medium shadow-md'
                          : 'border-beige text-coffee/60 hover:border-gold hover:bg-cream/30'
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
              <p className="text-sm font-label tracking-wider uppercase text-coffee/70 mb-3">
                {t.product.quantity}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-beige rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock_quantity === 0}
                    className="w-12 h-12 flex items-center justify-center hover:bg-cream/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-16 h-12 flex items-center justify-center text-lg font-medium text-chocolate border-x-2 border-beige">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={product.stock_quantity === 0 || quantity >= product.stock_quantity}
                    className="w-12 h-12 flex items-center justify-center hover:bg-cream/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
                {product.stock_quantity > 0 && (
                  <span className="text-sm text-coffee/50">
                    {product.stock_quantity} items available
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className={`btn-primary curved-button flex-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
                  addedToCart ? 'bg-sage hover:bg-sage' : ''
                }`}
              >
                <ShoppingBag size={20} />
                {addedToCart ? '✓ Added!' : product.stock_quantity === 0 ? t.product.outOfStock : t.product.addToCart}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-14 h-14 border-2 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isInWishlist(product.id)
                    ? 'border-blush bg-blush/10 text-blush scale-110'
                    : 'border-beige text-coffee/60 hover:border-gold hover:text-gold hover:scale-110'
                }`}
                aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={22} className={isInWishlist(product.id) ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Delivery Estimate */}
            <div className="bg-cream/30 border border-beige/30 rounded-lg p-4 flex items-center gap-3">
              <Truck size={24} className="text-gold flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-chocolate">Estimated Delivery</p>
                <p className="text-xs text-coffee/60">
                  {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })} - {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* WhatsApp Inquiry */}
            <a
              href={createWhatsAppLink(
                `Hi! I'm interested in: ${product.name} (₹${product.sale_price || product.price})`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary curved-button w-full flex items-center justify-center gap-2 hover:bg-gold hover:text-white transition-all duration-300"
            >
              <MessageCircle size={18} />
              {t.product.inquireOnWhatsApp}
            </a>

            {/* Product Tabs */}
            <div className="border-t border-beige/30 pt-6">
              <div className="flex gap-4 border-b border-beige/30 mb-4">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-3 px-2 text-sm font-medium transition-colors ${
                    activeTab === 'description'
                      ? 'text-gold border-b-2 border-gold'
                      : 'text-coffee/60 hover:text-chocolate'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-3 px-2 text-sm font-medium transition-colors ${
                    activeTab === 'details'
                      ? 'text-gold border-b-2 border-gold'
                      : 'text-coffee/60 hover:text-chocolate'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 px-2 text-sm font-medium transition-colors ${
                    activeTab === 'reviews'
                      ? 'text-gold border-b-2 border-gold'
                      : 'text-coffee/60 hover:text-chocolate'
                  }`}
                >
                  Reviews (128)
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-3 px-2 text-sm font-medium transition-colors ${
                    activeTab === 'shipping'
                      ? 'text-gold border-b-2 border-gold'
                      : 'text-coffee/60 hover:text-chocolate'
                  }`}
                >
                  Shipping
                </button>
              </div>

              <div className="py-4">
                {activeTab === 'description' && (
                  <div className="prose prose-sm max-w-none text-coffee/70">
                    <p>{product.description || 'No description available.'}</p>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-3">
                    {product.material && (
                      <div className="flex justify-between py-2 border-b border-beige/20">
                        <span className="text-sm text-coffee/60">Material</span>
                        <span className="text-sm font-medium text-chocolate">{product.material}</span>
                      </div>
                    )}
                    {product.fabric_type && (
                      <div className="flex justify-between py-2 border-b border-beige/20">
                        <span className="text-sm text-coffee/60">Fabric Type</span>
                        <span className="text-sm font-medium text-chocolate">{product.fabric_type}</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="flex justify-between py-2 border-b border-beige/20">
                        <span className="text-sm text-coffee/60">Dimensions</span>
                        <span className="text-sm font-medium text-chocolate">{product.dimensions}</span>
                      </div>
                    )}
                    {product.pattern && (
                      <div className="flex justify-between py-2 border-b border-beige/20">
                        <span className="text-sm text-coffee/60">Pattern</span>
                        <span className="text-sm font-medium text-chocolate">{product.pattern}</span>
                      </div>
                    )}
                    {product.sku && (
                      <div className="flex justify-between py-2 border-b border-beige/20">
                        <span className="text-sm text-coffee/60">SKU</span>
                        <span className="text-sm font-medium text-chocolate">{product.sku}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-beige/20">
                      <span className="text-sm text-coffee/60">Customization</span>
                      <span className="text-sm font-medium text-chocolate">
                        {product.customization_available ? '✅ Available' : '❌ Not Available'}
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="text-center py-8">
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={24} className={star <= 4 ? 'fill-gold text-gold' : 'text-beige'} />
                      ))}
                    </div>
                    <p className="text-2xl font-bold text-chocolate mb-2">4.0 out of 5</p>
                    <p className="text-sm text-coffee/60 mb-4">Based on 128 reviews</p>
                    <p className="text-sm text-coffee/50">Reviews coming soon!</p>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Truck size={20} className="text-gold flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-chocolate">Free Shipping</p>
                        <p className="text-xs text-coffee/60">On orders above ₹1999</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield size={20} className="text-gold flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-chocolate">Secure Packaging</p>
                        <p className="text-xs text-coffee/60">Carefully packed to prevent damage</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RotateCcw size={20} className="text-gold flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-chocolate">7-Day Returns</p>
                        <p className="text-xs text-coffee/60">Easy returns and exchanges</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-beige/30">
            <h2 className="font-heading text-2xl sm:text-3xl font-medium text-chocolate mb-8 text-center">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.slug}`}
                  className="curved-card bg-pearl group shadow-curved hover:shadow-curved-lg transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="aspect-square bg-gradient-to-br from-cream to-beige/20 curved-image overflow-hidden">
                    {relatedProduct.images && relatedProduct.images.length > 0 && relatedProduct.images[0]?.image_url ? (
                      <img
                        src={getProductImageUrl(relatedProduct.images[0].image_url) || ''}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading text-sm font-medium text-chocolate mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-lg font-bold text-gold">
                      ₹{(relatedProduct.sale_price || relatedProduct.price).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fabric Image Viewer */}
      {viewerImages.length > 0 && (
        <FabricImageViewer
          images={viewerImages}
          initialIndex={selectedImage}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </div>
  );
}
