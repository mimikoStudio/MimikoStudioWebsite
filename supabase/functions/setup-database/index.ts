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
    // Create Supabase admin client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting database setup...')

    // Step 1: Create is_admin function
    console.log('Step 1: Creating is_admin function...')
    const { error: funcError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION is_admin()
        RETURNS BOOLEAN 
        LANGUAGE plpgsql 
        SECURITY DEFINER
        SET search_path = public
        AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
          );
        END;
        $$;
      `
    })

    if (funcError && !funcError.message.includes('already exists')) {
      console.log('Function creation note:', funcError.message)
    }

    // Step 2: Create storage buckets
    console.log('Step 2: Creating storage buckets...')
    const buckets = [
      { id: 'product-images', name: 'product-images', public: true },
      { id: 'gallery-images', name: 'gallery-images', public: true },
      { id: 'inquiry-references', name: 'inquiry-references', public: false },
      { id: 'customer-uploads', name: 'customer-uploads', public: false }
    ]

    for (const bucket of buckets) {
      const { error: bucketError } = await supabaseAdmin.storage.createBucket(bucket.name, {
        public: bucket.public
      })
      if (bucketError && !bucketError.message.includes('already exists')) {
        console.log('Bucket creation note:', bucketError.message)
      }
    }

    // Step 3: Setup RLS policies for all tables
    console.log('Step 3: Setting up RLS policies...')
    const tables = [
      'categories', 'products', 'product_images', 'inquiries', 
      'appointments', 'orders', 'order_items', 'profiles', 
      'site_settings', 'wishlists', 'reviews', 'notifications', 
      'availability_slots'
    ]

    for (const table of tables) {
      // Disable and re-enable RLS
      await supabaseAdmin.rpc('exec_sql', {
        sql: `
          ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;
          ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;
        `
      })

      // Drop existing policies
      await supabaseAdmin.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${table}_all" ON ${table};`
      })

      // Create permissive policy
      await supabaseAdmin.rpc('exec_sql', {
        sql: `CREATE POLICY "${table}_all" ON ${table} FOR ALL USING (true) WITH CHECK (true);`
      })
    }

    // Step 4: Setup storage policies
    console.log('Step 4: Setting up storage policies...')
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
        DROP POLICY IF EXISTS "storage_authenticated_write" ON storage.objects;
        
        CREATE POLICY "storage_public_read" 
        ON storage.objects FOR SELECT 
        USING (true);
        
        CREATE POLICY "storage_authenticated_write" 
        ON storage.objects FOR ALL 
        USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');
      `
    })

    // Step 5: Seed default categories
    console.log('Step 5: Seeding default categories...')
    const categories = [
      { name: 'Hand-Painted Clothing', slug: 'clothing', description: 'T-shirts, kurtis, sarees, dupattas, denim jackets & more', display_order: 1 },
      { name: 'Designer Bags', slug: 'bags', description: 'Tote bags, canvas bags, sling bags, pouches & laptop sleeves', display_order: 2 },
      { name: 'Home Decor', slug: 'home-decor', description: 'Cushion covers, table runners, wall hangings & more', display_order: 3 },
      { name: 'Fashion Accessories', slug: 'accessories', description: 'Hand-painted shoes, caps, scarves & headbands', display_order: 4 },
      { name: 'Personalized Gifts', slug: 'gifts', description: 'Custom gift bags, aprons, bookmarks & pouches', display_order: 5 },
      { name: 'Small Handmade Creations', slug: 'small-creations', description: 'Scrunchies, hair bows, fabric earrings & keychains', display_order: 6 }
    ]

    for (const category of categories) {
      await supabaseAdmin
        .from('categories')
        .upsert(category, { onConflict: 'slug' })
    }

    // Step 6: Seed default site settings
    console.log('Step 6: Seeding default site settings...')
    const settings = [
      { setting_key: 'site_name', setting_value: 'Mimiko Studio' },
      { setting_key: 'site_tagline', setting_value: 'Paint ♥ Create ♥ Be You' },
      { setting_key: 'whatsapp_number', setting_value: '+917874291924' },
      { setting_key: 'instagram_handle', setting_value: '@mimiko.studio24' },
      { setting_key: 'instagram_url', setting_value: 'https://www.instagram.com/mimiko.studio24/' },
      { setting_key: 'shipping_fee', setting_value: '99' },
      { setting_key: 'free_shipping_minimum', setting_value: '1999' },
      { setting_key: 'currency', setting_value: 'INR' }
    ]

    for (const setting of settings) {
      await supabaseAdmin
        .from('site_settings')
        .upsert(setting, { onConflict: 'setting_key' })
    }

    console.log('✅ Database setup complete!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Database setup completed successfully!' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Setup error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
