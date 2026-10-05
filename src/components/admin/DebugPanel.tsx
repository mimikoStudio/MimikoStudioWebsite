import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Database, RefreshCw, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function DebugPanel() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setStatus('checking');
    setMessage('Testing database connection...');
    setDetails({});

    try {
      // Test 1: Check if Supabase is configured
      if (!isSupabaseConfigured) {
        setStatus('error');
        setMessage('❌ Supabase not configured. Check environment variables.');
        setTesting(false);
        return;
      }

      // Test 2: Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('products')
        .select('count', { count: 'exact', head: true });

      if (testError) {
        setStatus('error');
        setMessage(`❌ Database connection failed: ${testError.message}`);
        setDetails({ error: testError });
        setTesting(false);
        return;
      }

      // Test 3: Count products
      const { count: productCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        setStatus('error');
        setMessage(`❌ Failed to count products: ${countError.message}`);
        setTesting(false);
        return;
      }

      // Test 4: Count published products
      const { count: publishedCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Test 5: Count categories
      const { count: categoryCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      // Test 6: Get sample products
      const { data: sampleProducts, error: sampleError } = await supabase
        .from('products')
        .select('id, name, is_published, price')
        .limit(5);

      setStatus('success');
      setMessage('✅ Database connection successful!');
      setDetails({
        totalProducts: productCount || 0,
        publishedProducts: publishedCount || 0,
        draftProducts: (productCount || 0) - (publishedCount || 0),
        categories: categoryCount || 0,
        sampleProducts: sampleProducts || [],
        sampleError: sampleError?.message
      });

    } catch (err: any) {
      setStatus('error');
      setMessage(`❌ Unexpected error: ${err.message}`);
      setDetails({ error: err });
    } finally {
      setTesting(false);
    }
  };

  const insertSampleProducts = async () => {
    if (!confirm('This will insert 3 sample products. Continue?')) return;

    try {
      const sampleProducts = [
        {
          name: 'Floral Hand-Painted Tote Bag',
          slug: 'floral-tote-bag',
          description: 'Beautiful hand-painted tote bag with floral design',
          price: 1299,
          stock_quantity: 10,
          is_published: true,
          is_featured: true,
          is_new_arrival: true,
          category_id: null,
          sizes: [],
          colors: ['Natural', 'Beige'],
          material: 'Canvas',
          customization_available: true
        },
        {
          name: 'Abstract Art Dupatta',
          slug: 'abstract-dupatta',
          description: 'Elegant dupatta with abstract art design',
          price: 2499,
          stock_quantity: 5,
          is_published: true,
          is_featured: true,
          is_new_arrival: false,
          category_id: null,
          sizes: ['Free Size'],
          colors: ['Ivory', 'Gold'],
          material: 'Silk',
          customization_available: true
        },
        {
          name: 'Botanical Cushion Cover Set',
          slug: 'botanical-cushion-set',
          description: 'Set of 2 cushion covers with botanical prints',
          price: 1899,
          stock_quantity: 8,
          is_published: true,
          is_featured: false,
          is_new_arrival: true,
          category_id: null,
          sizes: ['16x16 inches'],
          colors: ['Green', 'White'],
          material: 'Cotton',
          customization_available: false
        }
      ];

      const { data, error } = await supabase
        .from('products')
        .insert(sampleProducts)
        .select();

      if (error) throw error;

      alert(`✅ Successfully inserted ${data?.length || 0} sample products!`);
      testConnection(); // Refresh the test
    } catch (err: any) {
      alert(`❌ Error inserting sample products: ${err.message}`);
    }
  };

  const publishAllProducts = async () => {
    if (!confirm('This will publish ALL draft products. Continue?')) return;

    try {
      const { data, error, count } = await supabase
        .from('products')
        .update({ is_published: true })
        .eq('is_published', false)
        .select();

      if (error) throw error;

      alert(`✅ Successfully published ${count || 0} products!`);
      testConnection(); // Refresh the test
    } catch (err: any) {
      alert(`❌ Error publishing products: ${err.message}`);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="bg-pearl border border-beige/20 rounded-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-xl text-chocolate flex items-center gap-2">
          <Database size={20} className="text-gold" />
          Database Debug Panel
        </h3>
        <button
          onClick={testConnection}
          disabled={testing}
          className="btn-outline flex items-center gap-2"
        >
          <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {/* Status Message */}
      <div className={`p-4 rounded-sm mb-4 ${
        status === 'success' ? 'bg-sage/10 border border-sage/20' :
        status === 'error' ? 'bg-blush/10 border border-blush/20' :
        'bg-gold/10 border border-gold/20'
      }`}>
        <div className="flex items-start gap-3">
          {status === 'checking' && <Loader size={20} className="text-gold animate-spin mt-0.5" />}
          {status === 'success' && <CheckCircle size={20} className="text-sage mt-0.5" />}
          {status === 'error' && <AlertCircle size={20} className="text-blush mt-0.5" />}
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              status === 'success' ? 'text-sage' :
              status === 'error' ? 'text-blush' :
              'text-gold'
            }`}>
              {message}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      {status === 'success' && details.totalProducts !== undefined && (
        <div className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-ivory p-4 rounded-sm">
              <p className="text-xs text-coffee/50 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-chocolate">{details.totalProducts}</p>
            </div>
            <div className="bg-ivory p-4 rounded-sm">
              <p className="text-xs text-coffee/50 mb-1">Published</p>
              <p className="text-2xl font-bold text-sage">{details.publishedProducts}</p>
            </div>
            <div className="bg-ivory p-4 rounded-sm">
              <p className="text-xs text-coffee/50 mb-1">Drafts</p>
              <p className="text-2xl font-bold text-gold">{details.draftProducts}</p>
            </div>
            <div className="bg-ivory p-4 rounded-sm">
              <p className="text-xs text-coffee/50 mb-1">Categories</p>
              <p className="text-2xl font-bold text-chocolate">{details.categories}</p>
            </div>
          </div>

          {/* Sample Products */}
          {details.sampleProducts && details.sampleProducts.length > 0 && (
            <div>
              <p className="text-sm font-medium text-chocolate mb-2">Sample Products:</p>
              <div className="space-y-2">
                {details.sampleProducts.map((product: any) => (
                  <div key={product.id} className="bg-ivory p-3 rounded-sm flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-chocolate">{product.name}</p>
                      <p className="text-xs text-coffee/50">₹{product.price}</p>
                    </div>
                    <span className={`badge-luxury ${
                      product.is_published ? 'bg-sage/10 text-sage' : 'bg-gold/10 text-gold'
                    }`}>
                      {product.is_published ? '✅ Published' : '📝 Draft'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-beige/20">
            {details.draftProducts > 0 && (
              <button
                onClick={publishAllProducts}
                className="btn-primary flex items-center gap-2"
              >
                🚀 Publish All Drafts ({details.draftProducts})
              </button>
            )}
            {details.totalProducts === 0 && (
              <button
                onClick={insertSampleProducts}
                className="btn-secondary flex items-center gap-2"
              >
                📦 Insert Sample Products
              </button>
            )}
          </div>

          {/* Help Text */}
          {details.draftProducts > 0 && (
            <div className="bg-gold/10 border border-gold/20 rounded-sm p-4">
              <p className="text-sm text-chocolate">
                💡 <strong>Tip:</strong> You have {details.draftProducts} draft product{details.draftProducts > 1 ? 's' : ''} that {details.draftProducts > 1 ? 'are' : 'is'} hidden from the website. 
                Click "Publish All Drafts" to make them visible, or go to the Products tab to publish them individually.
              </p>
            </div>
          )}

          {details.totalProducts === 0 && (
            <div className="bg-blush/10 border border-blush/20 rounded-sm p-4">
              <p className="text-sm text-chocolate">
                ⚠️ <strong>No products found!</strong> Click "Insert Sample Products" to add demo products, 
                or go to the Products tab to add your own products.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Details */}
      {status === 'error' && details.error && (
        <div className="bg-blush/10 border border-blush/20 rounded-sm p-4">
          <p className="text-sm text-blush font-medium mb-2">Error Details:</p>
          <pre className="text-xs text-chocolate bg-ivory p-3 rounded-sm overflow-x-auto">
            {JSON.stringify(details.error, null, 2)}
          </pre>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-chocolate font-medium">Common Solutions:</p>
            <ul className="text-xs text-coffee/70 space-y-1 list-disc list-inside">
              <li>If you see "row-level security" error, run the RLS fix SQL in Supabase</li>
              <li>If you see "relation does not exist", run the database migration SQL</li>
              <li>Check that your Supabase URL and anon key are correct</li>
              <li>Verify that your Supabase project is active</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
