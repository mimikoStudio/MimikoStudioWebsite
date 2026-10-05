import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertCircle, CheckCircle, XCircle, Loader, Database } from 'lucide-react';

export default function ImageUploadDiagnostics() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [fixing, setFixing] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    setResults([]);

    const testResults: any[] = [];

    // Test 1: Check if product_images table exists
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('id')
        .limit(1);

      if (error) {
        testResults.push({
          test: 'Table exists',
          status: 'error',
          message: `❌ product_images table does not exist or is not accessible: ${error.message}`,
        });
      } else {
        testResults.push({
          test: 'Table exists',
          status: 'success',
          message: '✅ product_images table exists',
        });
      }
    } catch (err: any) {
      testResults.push({
        test: 'Table exists',
        status: 'error',
        message: `❌ Error checking table: ${err.message}`,
      });
    }

    // Test 2: Check current image count
    try {
      const { count, error } = await supabase
        .from('product_images')
        .select('*', { count: 'exact', head: true });

      if (error) {
        testResults.push({
          test: 'Image count',
          status: 'error',
          message: `❌ Unable to get image count: ${error.message}`,
        });
      } else {
        testResults.push({
          test: 'Image count',
          status: 'success',
          message: `✅ Currently ${count || 0} images`,
        });
      }
    } catch (err: any) {
      testResults.push({
        test: 'Image count',
        status: 'error',
        message: `❌ Error getting image count: ${err.message}`,
      });
    }

    // Test 3: Test insert permission
    try {
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .limit(1)
        .single();

      if (!product) {
        testResults.push({
          test: 'Insert permission',
          status: 'warning',
          message: '⚠️ No products available to test insert',
        });
      } else {
        // Try to insert a test image
        const testImage = {
          product_id: product.id,
          image_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          alt_text: 'Test image',
          display_order: 999,
        };

        const { data, error } = await supabase
          .from('product_images')
          .insert([testImage])
          .select();

        if (error) {
          testResults.push({
            test: 'Insert permission',
            status: 'error',
            message: `❌ Unable to insert image: ${error.message}`,
            details: error,
          });
        } else {
          // Clean up test image
          if (data && data[0]) {
            await supabase
              .from('product_images')
              .delete()
              .eq('id', data[0].id);
          }

          testResults.push({
            test: 'Insert permission',
            status: 'success',
            message: '✅ Can insert images',
          });
        }
      }
    } catch (err: any) {
      testResults.push({
        test: 'Insert permission',
        status: 'error',
        message: `❌ Error testing insert: ${err.message}`,
      });
    }

    // Test 4: Check products count
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (error) {
        testResults.push({
          test: 'Products count',
          status: 'error',
          message: `❌ Unable to get product count: ${error.message}`,
        });
      } else {
        testResults.push({
          test: 'Products count',
          status: 'success',
          message: `✅ Currently ${count || 0} products`,
        });
      }
    } catch (err: any) {
      testResults.push({
        test: 'Products count',
        status: 'error',
        message: `❌ Error getting product count: ${err.message}`,
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  const fixImageUpload = async () => {
    setFixing(true);

    try {
      alert(
        '🔧 Fix Steps:\n\n' +
        '1. Open Supabase SQL Editor\n' +
        '2. Run the following SQL:\n\n' +
        'ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;\n\n' +
        'ALTER TABLE product_images \n' +
        'ALTER COLUMN image_url TYPE TEXT;\n\n' +
        '3. Return to this page and test again\n\n' +
        'SQL Editor link:\n' +
        'https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql'
      );
    } catch (err: any) {
      alert(`❌ Fix failed: ${err.message}`);
    } finally {
      setFixing(false);
    }
  };

  const hasErrors = results.some(r => r.status === 'error');
  const allSuccess = results.length > 0 && results.every(r => r.status === 'success');

  return (
    <div className="bg-pearl border border-beige/20 rounded-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-xl text-chocolate flex items-center gap-2">
          <Database size={20} className="text-gold" />
          Image Upload Diagnostics
        </h3>
        <div className="flex gap-2">
          <button
            onClick={runDiagnostics}
            disabled={testing}
            className="btn-outline flex items-center gap-2"
          >
            {testing ? (
              <>
                <Loader size={14} className="animate-spin" />
                Testing...
              </>
            ) : (
              <>🔍 Run Diagnostics</>
            )}
          </button>
          {hasErrors && (
            <button
              onClick={fixImageUpload}
              disabled={fixing}
              className="btn-primary flex items-center gap-2"
            >
              🔧 View Fix Steps
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-sm border ${
                result.status === 'success'
                  ? 'bg-sage/10 border-sage/20'
                  : result.status === 'error'
                  ? 'bg-blush/10 border-blush/20'
                  : 'bg-gold/10 border-gold/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.status === 'success' && (
                  <CheckCircle size={20} className="text-sage flex-shrink-0 mt-0.5" />
                )}
                {result.status === 'error' && (
                  <XCircle size={20} className="text-blush flex-shrink-0 mt-0.5" />
                )}
                {result.status === 'warning' && (
                  <AlertCircle size={20} className="text-gold flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-chocolate text-sm">{result.test}</p>
                  <p className="text-sm text-coffee/70 mt-1">{result.message}</p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-coffee/50 cursor-pointer hover:text-chocolate">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-ivory rounded-sm text-xs overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className={`p-4 rounded-sm border ${
            allSuccess
              ? 'bg-sage/10 border-sage/20'
              : hasErrors
              ? 'bg-blush/10 border-blush/20'
              : 'bg-gold/10 border-gold/20'
          }`}>
            {allSuccess && (
              <p className="text-sage font-medium">
                ✅ All tests passed! Image upload is working correctly.
              </p>
            )}
            {hasErrors && (
              <div>
                <p className="text-blush font-medium mb-2">
                  ❌ Found {results.filter(r => r.status === 'error').length} issue(s)
                </p>
                <p className="text-sm text-coffee/70">
                  Please click the "View Fix Steps" button for instructions.
                </p>
              </div>
            )}
            {!allSuccess && !hasErrors && (
              <p className="text-gold font-medium">
                ⚠️ Some warnings, but functionality may still work.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Initial State */}
      {results.length === 0 && !testing && (
        <div className="text-center py-8">
          <Database size={48} className="mx-auto text-coffee/20 mb-4" />
          <p className="text-coffee/60 mb-2">Click "Run Diagnostics" to check image upload functionality</p>
          <p className="text-xs text-coffee/40">
            This will check table structure, permissions, and insert functionality
          </p>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 pt-6 border-t border-beige/20">
        <h4 className="text-sm font-medium text-chocolate mb-3">💡 Common Issues</h4>
        <div className="space-y-2 text-xs text-coffee/60">
          <p>
            <strong>Issue:</strong> No records in product_images table
          </p>
          <p className="pl-4">
            <strong>Solution:</strong> Run SQL to disable RLS:
            <code className="block mt-1 p-2 bg-ivory rounded text-chocolate">
              ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
            </code>
          </p>
          <p className="mt-3">
            <strong>Issue:</strong> Image too large to upload
          </p>
          <p className="pl-4">
            <strong>Solution:</strong> Compress image to under 1MB, or use smaller dimensions
          </p>
          <p className="mt-3">
            <strong>Issue:</strong> image_url field type not supported
          </p>
          <p className="pl-4">
            <strong>Solution:</strong> Change field type to TEXT:
            <code className="block mt-1 p-2 bg-ivory rounded text-chocolate">
              ALTER TABLE product_images ALTER COLUMN image_url TYPE TEXT;
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
