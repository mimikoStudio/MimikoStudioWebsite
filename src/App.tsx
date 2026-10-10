import { HashRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { I18nProvider } from './i18n/I18nContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingWhatsAppButton from './components/FloatingWhatsAppButton';
import Home from './pages/Home';
import Collections from './pages/Collections';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import CustomCreations from './pages/CustomCreations';
import BookAppointment from './pages/BookAppointment';
import OurStory from './pages/OurStory';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import SetupGuide from './pages/SetupGuide';
import DatabaseSetup from './pages/DatabaseSetup';
import SignatureCollections from './pages/SignatureCollections';

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <HashRouter>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-ivory">
              <Routes>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/setup" element={<DatabaseSetup />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/setup" element={<SetupGuide />} />
                <Route path="/db-setup" element={<DatabaseSetup />} />
                <Route
                  path="/*"
                  element={
                    <>
                      <Navbar />
                      <main className="flex-1">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/collections" element={<Collections />} />
                          <Route path="/signature-collections" element={<SignatureCollections />} />
                          <Route path="/shop" element={<Shop />} />
                          <Route path="/product/:slug" element={<ProductDetail />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/custom-creations" element={<CustomCreations />} />
                          <Route path="/book-appointment" element={<BookAppointment />} />
                          <Route path="/our-story" element={<OurStory />} />
                          <Route path="/gallery" element={<Gallery />} />
                          <Route path="/contact" element={<Contact />} />
                        </Routes>
                      </main>
                      <Footer />
                      <FloatingWhatsAppButton />
                    </>
                  }
                />
              </Routes>
            </div>
          </CartProvider>
        </HashRouter>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
