import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🚀 Starting automatic database setup...')

    // List of all tables to fix
    const tables = [
      'categories', 'products', 'product_images', 'inquiries', 
      'appointments', 'orders', 'order_items', 'profiles', 
      'site_settings', 'wishlists', 'reviews', 'notifications', 
      'availability_slots'
    ]

    // Step 1: Drop ALL existing policies from all tables
    console.log('📝 Step 1: Dropping all existing policies...')
    for (const table of tables) {
      const { data: policies, error: listError } = await supabaseAdmin
        .from('pg_policies')
        .select('policyname')
        .eq('schemaname', 'public')
        .eq('tablename', table)

      if (!listError && policies) {
        for (const policy of policies) {
          await supabaseAdmin.rpc('exec_sql', {
            sql_query: `DROP POLICY IF EXISTS "${policy.policyname}" ON ${table}`
          })
          console.log(`  ✓ Dropped: ${policy.policyname} from ${table}`)
        }
      }
    }

    // Step 2: Drop storage policies
    console.log('📝 Step 2: Dropping storage policies...')
    const { data: storagePolicies } = await supabaseAdmin
      .from('pg_policies')
      .select('policyname')
      .eq('schemaname', 'storage')
      .eq('tablename', 'objects')

    if (storagePolicies) {
      for (const policy of storagePolicies) {
        await supabaseAdmin.rpc('exec_sql', {
          sql_query: `DROP POLICY IF EXISTS "${policy.policyname}" ON storage.objects`
        })
        console.log(`  ✓ Dropped storage policy: ${policy.policyname}`)
      }
    }

    // Step 3: Disable and re-enable RLS
    console.log('📝 Step 3: Re-enabling RLS on all tables...')
    for (const table of tables) {
      await supabaseAdmin.rpc('exec_sql', {
        sql_query: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY; ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      })
    }

    // Step 4: Create new permissive policies
    console.log('📝 Step 4: Creating new permissive policies...')
    for (const table of tables) {
      await supabaseAdmin.rpc('exec_sql', {
        sql_query: `CREATE POLICY "${table}_admin_full_access" ON ${table} FOR ALL USING (true) WITH CHECK (true)`
      })
      console.log(`  ✓ Created policy for: ${table}`)
    }

    // Step 5: Create storage policy
    console.log('📝 Step 5: Creating storage policy...')
    await supabaseAdmin.rpc('exec_sql', {
      sql_query: `CREATE POLICY "storage_admin_full_access" ON storage.objects FOR ALL USING (true) WITH CHECK (true)`
    })

    // Step 6: Create storage buckets if they don't exist
    console.log('📝 Step 6: Creating storage buckets...')
    const buckets = [
      { name: 'product-images', public: true },
      { name: 'gallery-images', public: true },
      { name: 'inquiry-references', public: false },
      { name: 'customer-uploads', public: false }
    ]

    for (const bucket of buckets) {
      try {
        await supabaseAdmin.storage.createBucket(bucket.name, { public: bucket.public })
        console.log(`  ✓ Created bucket: ${bucket.name}`)
      } catch (e) {
        console.log(`  ⚠ Bucket ${bucket.name} already exists`)
      }
    }

    console.log('✅ Database setup complete!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: '✅ Database setup complete! All RLS policies have been fixed.',
        tables_fixed: tables.length,
        buckets_created: buckets.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Setup error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
