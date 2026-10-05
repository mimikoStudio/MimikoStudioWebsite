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
          message: `❌ product_images 表不存在或无法访问: ${error.message}`,
        });
      } else {
        testResults.push({
          test: 'Table exists',
          status: 'success',
          message: '✅ product_images 表存在',
        });
      }
    } catch (err: any) {
      testResults.push({
        test: 'Table exists',
        status: 'error',
        message: `❌ 检查表时出错: ${err.message}`,
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
          message: `❌ 无法获取图片数量: ${error.message}`,
        });
      } else {
        testResults.push({
          test: 'Image count',
          status: 'success',
          message: `✅ 当前有 ${count || 0} 张图片`,
        });
      }
    } catch (err: any) {
      testResults.push({
        test: 'Image count',
        status: 'error',
        message: `❌ 获取图片数量时出错: ${err.message}`,
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
          message: '⚠️ 没有产品可以测试插入',
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
            message: `❌ 无法插入图片: ${error.message}`,
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
            message: '✅ 可以插入图片',
          });
        }
      }
    } catch (err: any) {
      testResults.push({
        test: 'Insert permission',
        status: 'error',
        message: `❌ 测试插入时出错: ${err.message}`,
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
          message: `❌ 无法获取产品数量: ${error.message}`,
        });
      } else {
        testResults.push({
          test: 'Products count',
          status: 'success',
          message: `✅ 当前有 ${count || 0} 个产品`,
        });
      }
    } catch (err: any) {
      testResults.push({
        test: 'Products count',
        status: 'error',
        message: `❌ 获取产品数量时出错: ${err.message}`,
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  const fixImageUpload = async () => {
    setFixing(true);

    try {
      // This would require running SQL via Supabase REST API
      // For now, we'll provide instructions
      alert(
        '🔧 修复步骤：\n\n' +
        '1. 打开 Supabase SQL Editor\n' +
        '2. 运行以下 SQL：\n\n' +
        'ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;\n\n' +
        'ALTER TABLE product_images \n' +
        'ALTER COLUMN image_url TYPE TEXT;\n\n' +
        '3. 返回此页面重新测试\n\n' +
        'SQL Editor 链接：\n' +
        'https://supabase.com/dashboard/project/zshfxzdtosfvtngctftn/sql'
      );
    } catch (err: any) {
      alert(`❌ 修复失败: ${err.message}`);
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
          图片上传诊断工具
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
                诊断中...
              </>
            ) : (
              <>🔍 运行诊断</>
            )}
          </button>
          {hasErrors && (
            <button
              onClick={fixImageUpload}
              disabled={fixing}
              className="btn-primary flex items-center gap-2"
            >
              🔧 查看修复步骤
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
                        查看详情
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
                ✅ 所有测试通过！图片上传功能正常。
              </p>
            )}
            {hasErrors && (
              <div>
                <p className="text-blush font-medium mb-2">
                  ❌ 发现 {results.filter(r => r.status === 'error').length} 个问题
                </p>
                <p className="text-sm text-coffee/70">
                  请点击"查看修复步骤"按钮获取修复说明。
                </p>
              </div>
            )}
            {!allSuccess && !hasErrors && (
              <p className="text-gold font-medium">
                ⚠️ 有一些警告，但功能可能仍然正常。
              </p>
            )}
          </div>
        </div>
      )}

      {/* Initial State */}
      {results.length === 0 && !testing && (
        <div className="text-center py-8">
          <Database size={48} className="mx-auto text-coffee/20 mb-4" />
          <p className="text-coffee/60 mb-2">点击"运行诊断"检查图片上传功能</p>
          <p className="text-xs text-coffee/40">
            这将检查表结构、权限和插入功能
          </p>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 pt-6 border-t border-beige/20">
        <h4 className="text-sm font-medium text-chocolate mb-3">💡 常见问题</h4>
        <div className="space-y-2 text-xs text-coffee/60">
          <p>
            <strong>问题：</strong> product_images 表中没有记录
          </p>
          <p className="pl-4">
            <strong>解决方案：</strong> 运行 SQL 禁用 RLS：
            <code className="block mt-1 p-2 bg-ivory rounded text-chocolate">
              ALTER TABLE product_images DISABLE ROW LEVEL SECURITY;
            </code>
          </p>
          <p className="mt-3">
            <strong>问题：</strong> 图片太大无法上传
          </p>
          <p className="pl-4">
            <strong>解决方案：</strong> 压缩图片到 1MB 以下，或使用更小的尺寸
          </p>
          <p className="mt-3">
            <strong>问题：</strong> image_url 字段类型不支持
          </p>
          <p className="pl-4">
            <strong>解决方案：</strong> 修改字段类型为 TEXT：
            <code className="block mt-1 p-2 bg-ivory rounded text-chocolate">
              ALTER TABLE product_images ALTER COLUMN image_url TYPE TEXT;
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
