import { HashRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Collections from './pages/Collections';
import Shop from './pages/Shop';
import CustomCreations from './pages/CustomCreations';
import BookAppointment from './pages/BookAppointment';
import OurStory from './pages/OurStory';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import SetupGuide from './pages/SetupGuide';

function App() {
  return (
    <HashRouter>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-ivory">
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/setup" element={<SetupGuide />} />
            <Route
              path="/*"
              element={
                <>
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/collections" element={<Collections />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/custom-creations" element={<CustomCreations />} />
                      <Route path="/book-appointment" element={<BookAppointment />} />
                      <Route path="/our-story" element={<OurStory />} />
                      <Route path="/gallery" element={<Gallery />} />
                      <Route path="/contact" element={<Contact />} />
                    </Routes>
                  </main>
                  <Footer />
                  <WhatsAppButton />
                </>
              }
            />
          </Routes>
        </div>
      </CartProvider>
    </HashRouter>
  );
}

export default App;
