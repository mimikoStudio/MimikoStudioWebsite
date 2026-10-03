import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Key, Globe, Shield, CheckCircle, ArrowLeft } from 'lucide-react';

export default function SetupGuide() {
  return (
    <div className="min-h-screen bg-ivory pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-champagne hover:text-espresso transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <h1 className="font-heading text-4xl font-light text-espresso mb-4">Setup Guide</h1>
        <div className="gold-divider w-24 mb-8" />
        <p className="text-espresso/60 mb-12">
          Follow these steps to configure your Mimiko Studio website with Supabase backend.
        </p>

        {/* Step 1 */}
        <div className="bg-pearl border border-beige/20 rounded-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-champagne text-pearl flex items-center justify-center text-sm font-bold">1</div>
            <h2 className="font-heading text-xl text-espresso flex items-center gap-2">
              <Database size={18} className="text-champagne" /> Create a Supabase Project
            </h2>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-espresso/70 ml-4">
            <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-champagne underline">supabase.com</a> and create an account</li>
            <li>Create a new project — note your project URL and password</li>
            <li>Wait for the project to finish initializing</li>
          </ol>
        </div>

        {/* Step 2 */}
        <div className="bg-pearl border border-beige/20 rounded-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-champagne text-pearl flex items-center justify-center text-sm font-bold">2</div>
            <h2 className="font-heading text-xl text-espresso flex items-center gap-2">
              <Key size={18} className="text-champagne" /> Get Your API Keys
            </h2>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-espresso/70 ml-4">
            <li>In your Supabase dashboard, go to <strong>Settings → API</strong></li>
            <li>Copy your <strong>Project URL</strong> (e.g., <code className="bg-ivory px-1 rounded">https://xxxxx.supabase.co</code>)</li>
            <li>Copy your <strong>anon/public key</strong></li>
            <li>Never share your service_role key — it's not needed in the frontend</li>
          </ol>
        </div>

        {/* Step 3 */}
        <div className="bg-pearl border border-beige/20 rounded-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-champagne text-pearl flex items-center justify-center text-sm font-bold">3</div>
            <h2 className="font-heading text-xl text-espresso flex items-center gap-2">
              <Shield size={18} className="text-champagne" /> Configure Environment Variables
            </h2>
          </div>
          <p className="text-sm text-espresso/70 mb-4">Create a <code className="bg-ivory px-2 py-0.5 rounded">.env</code> file in the project root:</p>
          <pre className="bg-espresso text-pearl/80 p-4 rounded-sm text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
          </pre>
          <p className="text-xs text-espresso/50 mt-3">
            ⚠️ Never commit .env files to Git. The .gitignore file should already exclude them.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-pearl border border-beige/20 rounded-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-champagne text-pearl flex items-center justify-center text-sm font-bold">4</div>
            <h2 className="font-heading text-xl text-espresso flex items-center gap-2">
              <Database size={18} className="text-champagne" /> Run Database Migrations
            </h2>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-espresso/70 ml-4">
            <li>In Supabase dashboard, go to <strong>SQL Editor</strong></li>
            <li>Copy the contents of <code className="bg-ivory px-1 rounded">supabase/migrations/001_initial_schema.sql</code></li>
            <li>Paste and run the SQL in the editor</li>
            <li>Verify all tables were created in the <strong>Table Editor</strong></li>
          </ol>
        </div>

        {/* Step 5 */}
        <div className="bg-pearl border border-beige/20 rounded-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-champagne text-pearl flex items-center justify-center text-sm font-bold">5</div>
            <h2 className="font-heading text-xl text-espresso flex items-center gap-2">
              <Globe size={18} className="text-champagne" /> Deploy to GitHub Pages
            </h2>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-espresso/70 ml-4">
            <li>Push your code to a GitHub repository</li>
            <li>Go to <strong>Settings → Pages</strong> in your repository</li>
            <li>Set source to <strong>GitHub Actions</strong></li>
            <li>Add repository secrets: <code className="bg-ivory px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-ivory px-1 rounded">VITE_SUPABASE_ANON_KEY</code></li>
            <li>Push to <code className="bg-ivory px-1 rounded">main</code> branch to trigger deployment</li>
          </ol>
        </div>

        {/* Step 6 */}
        <div className="bg-pearl border border-beige/20 rounded-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-champagne text-pearl flex items-center justify-center text-sm font-bold">6</div>
            <h2 className="font-heading text-xl text-espresso flex items-center gap-2">
              <Shield size={18} className="text-champagne" /> Create Admin User
            </h2>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-espresso/70 ml-4">
            <li>In Supabase, go to <strong>Authentication → Users</strong></li>
            <li>Add a new user with your admin email and password</li>
            <li>In the <code className="bg-ivory px-1 rounded">profiles</code> table, set the user's role to <code className="bg-ivory px-1 rounded">admin</code></li>
            <li>Now you can log in at <code className="bg-ivory px-1 rounded">#/admin/login</code></li>
          </ol>
        </div>

        {/* Storage Buckets */}
        <div className="bg-pearl border border-beige/20 rounded-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-champagne text-pearl flex items-center justify-center text-sm font-bold">7</div>
            <h2 className="font-heading text-xl text-espresso">Create Storage Buckets</h2>
          </div>
          <p className="text-sm text-espresso/70 mb-4">In Supabase <strong>Storage</strong>, create these buckets:</p>
          <ul className="space-y-2 text-sm text-espresso/70 ml-4">
            <li className="flex items-center gap-2"><CheckCircle size={12} className="text-champagne" /> <code className="bg-ivory px-1 rounded">product-images</code> (public)</li>
            <li className="flex items-center gap-2"><CheckCircle size={12} className="text-champagne" /> <code className="bg-ivory px-1 rounded">gallery-images</code> (public)</li>
            <li className="flex items-center gap-2"><CheckCircle size={12} className="text-champagne" /> <code className="bg-ivory px-1 rounded">inquiry-references</code> (private)</li>
            <li className="flex items-center gap-2"><CheckCircle size={12} className="text-champagne" /> <code className="bg-ivory px-1 rounded">customer-uploads</code> (private)</li>
          </ul>
        </div>

        {/* Completion */}
        <div className="bg-gradient-to-br from-espresso to-chocolate rounded-sm p-8 text-center">
          <CheckCircle size={32} className="text-champagne mx-auto mb-4" />
          <h2 className="font-heading text-2xl text-pearl mb-2">You're All Set!</h2>
          <p className="text-pearl/60 text-sm mb-6">
            Your Mimiko Studio website is ready to go. Start adding products and managing your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-luxury !border-champagne !text-champagne">View Website</Link>
            <Link to="/admin/login" className="btn-luxury-filled">Admin Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
