// Translation dictionaries for English, Hindi, and Gujarati

export type Language = 'en' | 'hi' | 'gu';

export interface TranslationDictionary {
  // Navigation
  nav: {
    home: string;
    shop: string;
    collections: string;
    signatureCollections: string;
    customCreations: string;
    bookAppointment: string;
    ourStory: string;
    gallery: string;
    contact: string;
    cart: string;
    account: string;
    search: string;
    wishlist: string;
  };
  
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    view: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    reset: string;
    confirm: string;
    yes: string;
    no: string;
    or: string;
    and: string;
  };
  
  // Product
  product: {
    addToCart: string;
    outOfStock: string;
    inStock: string;
    limitedStock: string;
    onlyLeft: string;
    price: string;
    salePrice: string;
    quantity: string;
    size: string;
    color: string;
    material: string;
    description: string;
    details: string;
    reviews: string;
    relatedProducts: string;
    inquireOnWhatsApp: string;
    viewDetails: string;
    quickView: string;
    addWishlist: string;
    removeWishlist: string;
    share: string;
  };
  
  // Cart
  cart: {
    title: string;
    empty: string;
    emptyMessage: string;
    continueShopping: string;
    subtotal: string;
    shipping: string;
    free: string;
    total: string;
    checkout: string;
    remove: string;
    update: string;
    clear: string;
    items: string;
    item: string;
  };
  
  // Checkout
  checkout: {
    title: string;
    customerInfo: string;
    shippingAddress: string;
    paymentMethod: string;
    orderSummary: string;
    placeOrder: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    notes: string;
    orderNotes: string;
  };
  
  // Order
  order: {
    title: string;
    orderNumber: string;
    orderDate: string;
    status: string;
    pending: string;
    confirmed: string;
    processing: string;
    shipped: string;
    delivered: string;
    cancelled: string;
    trackOrder: string;
    viewOrder: string;
    downloadInvoice: string;
  };
  
  // Inquiry
  inquiry: {
    title: string;
    submit: string;
    success: string;
    successMessage: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    subject: string;
    category: string;
    productType: string;
    fabricPreference: string;
    designStyle: string;
    budget: string;
    preferredDate: string;
    referenceImage: string;
    instructions: string;
  };
  
  // Appointment
  appointment: {
    title: string;
    book: string;
    success: string;
    successMessage: string;
    date: string;
    time: string;
    type: string;
    description: string;
    communicationMethod: string;
    customDesign: string;
    weddingFestive: string;
    bulkOrder: string;
    productInquiry: string;
    generalConsultation: string;
  };
  
  // Admin
  admin: {
    dashboard: string;
    products: string;
    categories: string;
    orders: string;
    customers: string;
    inquiries: string;
    appointments: string;
    reports: string;
    settings: string;
    logout: string;
    overview: string;
    totalProducts: string;
    totalOrders: string;
    totalCustomers: string;
    totalRevenue: string;
    recentOrders: string;
    lowStock: string;
    pendingInquiries: string;
  };
  
  // Messages
  messages: {
    required: string;
    invalid: string;
    notFound: string;
    unauthorized: string;
    serverError: string;
    networkError: string;
    saved: string;
    deleted: string;
    updated: string;
    created: string;
    confirmDelete: string;
    noResults: string;
    tryAgain: string;
  };
  
  // Footer
  footer: {
    about: string;
    quickLinks: string;
    customerCare: string;
    getInTouch: string;
    followUs: string;
    newsletter: string;
    subscribe: string;
    emailPlaceholder: string;
    copyright: string;
    allRightsReserved: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    nav: {
      home: 'Home',
      shop: 'Shop',
      collections: 'Collections',
      signatureCollections: 'Signature Collections',
      customCreations: 'Custom Creations',
      bookAppointment: 'Book Appointment',
      ourStory: 'Our Story',
      gallery: 'Gallery',
      contact: 'Contact',
      cart: 'Cart',
      account: 'Account',
      search: 'Search',
      wishlist: 'Wishlist',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      view: 'View',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      or: 'or',
      and: 'and',
    },
    product: {
      addToCart: 'Add to Cart',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      limitedStock: 'Limited Stock',
      onlyLeft: 'Only {count} left',
      price: 'Price',
      salePrice: 'Sale Price',
      quantity: 'Quantity',
      size: 'Size',
      color: 'Color',
      material: 'Material',
      description: 'Description',
      details: 'Details',
      reviews: 'Reviews',
      relatedProducts: 'Related Products',
      inquireOnWhatsApp: 'Inquire on WhatsApp',
      viewDetails: 'View Details',
      quickView: 'Quick View',
      addWishlist: 'Add to Wishlist',
      removeWishlist: 'Remove from Wishlist',
      share: 'Share',
    },
    cart: {
      title: 'Shopping Cart',
      empty: 'Your cart is empty',
      emptyMessage: 'Add some beautiful handcrafted products to your cart',
      continueShopping: 'Continue Shopping',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      free: 'FREE',
      total: 'Total',
      checkout: 'Proceed to Checkout',
      remove: 'Remove',
      update: 'Update',
      clear: 'Clear Cart',
      items: 'items',
      item: 'item',
    },
    checkout: {
      title: 'Checkout',
      customerInfo: 'Customer Information',
      shippingAddress: 'Shipping Address',
      paymentMethod: 'Payment Method',
      orderSummary: 'Order Summary',
      placeOrder: 'Place Order',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      state: 'State',
      pincode: 'PIN Code',
      notes: 'Notes',
      orderNotes: 'Order Notes',
    },
    order: {
      title: 'Order',
      orderNumber: 'Order Number',
      orderDate: 'Order Date',
      status: 'Status',
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      trackOrder: 'Track Order',
      viewOrder: 'View Order',
      downloadInvoice: 'Download Invoice',
    },
    inquiry: {
      title: 'Inquiry',
      submit: 'Submit Inquiry',
      success: 'Inquiry Submitted',
      successMessage: 'Your inquiry has been submitted successfully. We will contact you soon.',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      subject: 'Subject',
      category: 'Category',
      productType: 'Product Type',
      fabricPreference: 'Fabric Preference',
      designStyle: 'Design Style',
      budget: 'Budget',
      preferredDate: 'Preferred Date',
      referenceImage: 'Reference Image',
      instructions: 'Instructions',
    },
    appointment: {
      title: 'Book Appointment',
      book: 'Book Now',
      success: 'Appointment Booked',
      successMessage: 'Your appointment has been booked successfully. We will confirm via WhatsApp.',
      date: 'Date',
      time: 'Time',
      type: 'Type',
      description: 'Description',
      communicationMethod: 'Communication Method',
      customDesign: 'Custom Design Consultation',
      weddingFestive: 'Wedding & Festive Orders',
      bulkOrder: 'Bulk Order Discussion',
      productInquiry: 'Product Inquiry',
      generalConsultation: 'General Consultation',
    },
    admin: {
      dashboard: 'Dashboard',
      products: 'Products',
      categories: 'Categories',
      orders: 'Orders',
      customers: 'Customers',
      inquiries: 'Inquiries',
      appointments: 'Appointments',
      reports: 'Reports',
      settings: 'Settings',
      logout: 'Logout',
      overview: 'Overview',
      totalProducts: 'Total Products',
      totalOrders: 'Total Orders',
      totalCustomers: 'Total Customers',
      totalRevenue: 'Total Revenue',
      recentOrders: 'Recent Orders',
      lowStock: 'Low Stock',
      pendingInquiries: 'Pending Inquiries',
    },
    messages: {
      required: 'This field is required',
      invalid: 'Invalid input',
      notFound: 'Not found',
      unauthorized: 'Unauthorized',
      serverError: 'Server error',
      networkError: 'Network error',
      saved: 'Saved successfully',
      deleted: 'Deleted successfully',
      updated: 'Updated successfully',
      created: 'Created successfully',
      confirmDelete: 'Are you sure you want to delete this?',
      noResults: 'No results found',
      tryAgain: 'Please try again',
    },
    footer: {
      about: 'About',
      quickLinks: 'Quick Links',
      customerCare: 'Customer Care',
      getInTouch: 'Get in Touch',
      followUs: 'Follow Us',
      newsletter: 'Newsletter',
      subscribe: 'Subscribe',
      emailPlaceholder: 'Your email',
      copyright: 'Copyright',
      allRightsReserved: 'All rights reserved',
    },
  },
  
  hi: {
    nav: {
      home: 'होम',
      shop: 'दुकान',
      collections: 'संग्रह',
      signatureCollections: 'विशेष संग्रह',
      customCreations: 'कस्टम क्रिएशंस',
      bookAppointment: 'अपॉइंटमेंट बुक करें',
      ourStory: 'हमारी कहानी',
      gallery: 'गैलरी',
      contact: 'संपर्क',
      cart: 'कार्ट',
      account: 'खाता',
      search: 'खोजें',
      wishlist: 'विशलिस्ट',
    },
    common: {
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      add: 'जोड़ें',
      view: 'देखें',
      close: 'बंद करें',
      back: 'वापस',
      next: 'अगला',
      previous: 'पिछला',
      submit: 'जमा करें',
      reset: 'रीसेट',
      confirm: 'पुष्टि करें',
      yes: 'हाँ',
      no: 'नहीं',
      or: 'या',
      and: 'और',
    },
    product: {
      addToCart: 'कार्ट में जोड़ें',
      outOfStock: 'स्टॉक ख़त्म',
      inStock: 'स्टॉक में',
      limitedStock: 'सीमित स्टॉक',
      onlyLeft: 'केवल {count} बचा',
      price: 'मूल्य',
      salePrice: 'बिक्री मूल्य',
      quantity: 'मात्रा',
      size: 'आकार',
      color: 'रंग',
      material: 'सामग्री',
      description: 'विवरण',
      details: 'विवरण',
      reviews: 'समीक्षा',
      relatedProducts: 'संबंधित उत्पाद',
      inquireOnWhatsApp: 'व्हाट्सएप पर पूछें',
      viewDetails: 'विवरण देखें',
      quickView: 'त्वरित दृश्य',
      addWishlist: 'विशलिस्ट में जोड़ें',
      removeWishlist: 'विशलिस्ट से हटाएं',
      share: 'शेयर करें',
    },
    cart: {
      title: 'शॉपिंग कार्ट',
      empty: 'आपका कार्ट खाली है',
      emptyMessage: 'अपने कार्ट में कुछ सुंदर हस्तनिर्मित उत्पाद जोड़ें',
      continueShopping: 'खरीदारी जारी रखें',
      subtotal: 'उप-कुल',
      shipping: 'शिपिंग',
      free: 'मुफ़्त',
      total: 'कुल',
      checkout: 'चेकआउट करें',
      remove: 'हटाएं',
      update: 'अपडेट करें',
      clear: 'कार्ट साफ़ करें',
      items: 'आइटम',
      item: 'आइटम',
    },
    checkout: {
      title: 'चेकआउट',
      customerInfo: 'ग्राहक जानकारी',
      shippingAddress: 'शिपिंग पता',
      paymentMethod: 'भुगतान विधि',
      orderSummary: 'ऑर्डर सारांश',
      placeOrder: 'ऑर्डर दें',
      fullName: 'पूरा नाम',
      email: 'ईमेल',
      phone: 'फ़ोन',
      address: 'पता',
      city: 'शहर',
      state: 'राज्य',
      pincode: 'पिन कोड',
      notes: 'नोट्स',
      orderNotes: 'ऑर्डर नोट्स',
    },
    order: {
      title: 'ऑर्डर',
      orderNumber: 'ऑर्डर नंबर',
      orderDate: 'ऑर्डर तिथि',
      status: 'स्थिति',
      pending: 'लंबित',
      confirmed: 'पुष्टि हुई',
      processing: 'प्रोसेसिंग',
      shipped: 'भेज दिया गया',
      delivered: 'डिलीवर हो गया',
      cancelled: 'रद्द',
      trackOrder: 'ऑर्डर ट्रैक करें',
      viewOrder: 'ऑर्डर देखें',
      downloadInvoice: 'चालान डाउनलोड करें',
    },
    inquiry: {
      title: 'पूछताछ',
      submit: 'पूछताछ जमा करें',
      success: 'पूछताछ जमा हुई',
      successMessage: 'आपकी पूछताछ सफलतापूर्वक जमा हो गई है। हम जल्द ही आपसे संपर्क करेंगे।',
      name: 'नाम',
      email: 'ईमेल',
      phone: 'फ़ोन',
      message: 'संदेश',
      subject: 'विषय',
      category: 'श्रेणी',
      productType: 'उत्पाद प्रकार',
      fabricPreference: 'कपड़ा पसंद',
      designStyle: 'डिज़ाइन शैली',
      budget: 'बजट',
      preferredDate: 'पसंदीदा तिथि',
      referenceImage: 'संदर्भ छवि',
      instructions: 'निर्देश',
    },
    appointment: {
      title: 'अपॉइंटमेंट बुक करें',
      book: 'अभी बुक करें',
      success: 'अपॉइंटमेंट बुक हुई',
      successMessage: 'आपकी अपॉइंटमेंट सफलतापूर्वक बुक हो गई है। हम व्हाट्सएप पर पुष्टि करेंगे।',
      date: 'तिथि',
      time: 'समय',
      type: 'प्रकार',
      description: 'विवरण',
      communicationMethod: 'संचार विधि',
      customDesign: 'कस्टम डिज़ाइन परामर्श',
      weddingFestive: 'शादी और त्योहार ऑर्डर',
      bulkOrder: 'थोक ऑर्डर चर्चा',
      productInquiry: 'उत्पाद पूछताछ',
      generalConsultation: 'सामान्य परामर्श',
    },
    admin: {
      dashboard: 'डैशबोर्ड',
      products: 'उत्पाद',
      categories: 'श्रेणियाँ',
      orders: 'ऑर्डर',
      customers: 'ग्राहक',
      inquiries: 'पूछताछ',
      appointments: 'अपॉइंटमेंट',
      reports: 'रिपोर्ट',
      settings: 'सेटिंग्स',
      logout: 'लॉगआउट',
      overview: 'अवलोकन',
      totalProducts: 'कुल उत्पाद',
      totalOrders: 'कुल ऑर्डर',
      totalCustomers: 'कुल ग्राहक',
      totalRevenue: 'कुल राजस्व',
      recentOrders: 'हाल के ऑर्डर',
      lowStock: 'कम स्टॉक',
      pendingInquiries: 'लंबित पूछताछ',
    },
    messages: {
      required: 'यह फ़ील्ड आवश्यक है',
      invalid: 'अमान्य इनपुट',
      notFound: 'नहीं मिला',
      unauthorized: 'अनधिकृत',
      serverError: 'सर्वर त्रुटि',
      networkError: 'नेटवर्क त्रुटि',
      saved: 'सफलतापूर्वक सहेजा गया',
      deleted: 'सफलतापूर्वक हटाया गया',
      updated: 'सफलतापूर्वक अपडेट किया गया',
      created: 'सफलतापूर्वक बनाया गया',
      confirmDelete: 'क्या आप वाकई इसे हटाना चाहते हैं?',
      noResults: 'कोई परिणाम नहीं मिला',
      tryAgain: 'कृपया पुनः प्रयास करें',
    },
    footer: {
      about: 'हमारे बारे में',
      quickLinks: 'त्वरित लिंक',
      customerCare: 'ग्राहक सेवा',
      getInTouch: 'संपर्क करें',
      followUs: 'हमें फॉलो करें',
      newsletter: 'न्यूज़लेटर',
      subscribe: 'सदस्यता लें',
      emailPlaceholder: 'आपका ईमेल',
      copyright: 'कॉपीराइट',
      allRightsReserved: 'सर्वाधिकार सुरक्षित',
    },
  },
  
  gu: {
    nav: {
      home: 'હોમ',
      shop: 'દુકાન',
      collections: 'સંગ્રહ',
      signatureCollections: 'વિશેષ સંગ્રહ',
      customCreations: 'કસ્ટમ ક્રિએશન્સ',
      bookAppointment: 'અપોઇન્ટમેન્ટ બુક કરો',
      ourStory: 'અમારી વાર્તા',
      gallery: 'ગેલેરી',
      contact: 'સંપર્ક',
      cart: 'કાર્ટ',
      account: 'ખાતું',
      search: 'શોધો',
      wishlist: 'વિશલિસ્ટ',
    },
    common: {
      loading: 'લોડ થઈ રહ્યું છે...',
      error: 'ભૂલ',
      success: 'સફળતા',
      save: 'સાચવો',
      cancel: 'રદ કરો',
      delete: 'કાઢી નાખો',
      edit: 'સંપાદિત કરો',
      add: 'ઉમેરો',
      view: 'જુઓ',
      close: 'બંધ કરો',
      back: 'પાછા',
      next: 'આગળ',
      previous: 'પાછળ',
      submit: 'સબમિટ કરો',
      reset: 'રીસેટ',
      confirm: 'પુષ્ટિ કરો',
      yes: 'હા',
      no: 'ના',
      or: 'અથવા',
      and: 'અને',
    },
    product: {
      addToCart: 'કાર્ટમાં ઉમેરો',
      outOfStock: 'સ્ટોક ખૂટ્યો',
      inStock: 'સ્ટોકમાં',
      limitedStock: 'મર્યાદિત સ્ટોક',
      onlyLeft: 'માત્ર {count} બાકી',
      price: 'કિંમત',
      salePrice: 'વેચાણ કિંમત',
      quantity: 'જથ્થો',
      size: 'કદ',
      color: 'રંગ',
      material: 'સામગ્રી',
      description: 'વર્ણન',
      details: 'વિગતો',
      reviews: 'સમીક્ષાઓ',
      relatedProducts: 'સંબંધિત ઉત્પાદનો',
      inquireOnWhatsApp: 'વ્હોટ્સએપ પર પૂછો',
      viewDetails: 'વિગતો જુઓ',
      quickView: 'ઝડપી જોવાનું',
      addWishlist: 'વિશલિસ્ટમાં ઉમેરો',
      removeWishlist: 'વિશલિસ્ટમાંથી કાઢો',
      share: 'શેર કરો',
    },
    cart: {
      title: 'શોપિંગ કાર્ટ',
      empty: 'તમારું કાર્ટ ખાલી છે',
      emptyMessage: 'તમારા કાર્ટમાં કેટલાક સુંદર હાથથી બનાવેલ ઉત્પાદનો ઉમેરો',
      continueShopping: 'ખરીદી ચાલુ રાખો',
      subtotal: 'ઉપ-કુલ',
      shipping: 'શિપિંગ',
      free: 'મફત',
      total: 'કુલ',
      checkout: 'ચેકઆઉટ કરો',
      remove: 'કાઢો',
      update: 'અપડેટ',
      clear: 'કાર્ટ સાફ કરો',
      items: 'વસ્તુઓ',
      item: 'વસ્તુ',
    },
    checkout: {
      title: 'ચેકઆઉટ',
      customerInfo: 'ગ્રાહક માહિતી',
      shippingAddress: 'શિપિંગ સરનામું',
      paymentMethod: 'ચુકવણી પદ્ધતિ',
      orderSummary: 'ઓર્ડર સારાંશ',
      placeOrder: 'ઓર્ડર આપો',
      fullName: 'પૂરું નામ',
      email: 'ઈમેલ',
      phone: 'ફોન',
      address: 'સરનામું',
      city: 'શહેર',
      state: 'રાજ્ય',
      pincode: 'પિન કોડ',
      notes: 'નોંધ',
      orderNotes: 'ઓર્ડર નોંધ',
    },
    order: {
      title: 'ઓર્ડર',
      orderNumber: 'ઓર્ડર નંબર',
      orderDate: 'ઓર્ડર તારીખ',
      status: 'સ્થિતિ',
      pending: 'બાકી',
      confirmed: 'પુષ્ટિ થઈ',
      processing: 'પ્રોસેસિંગ',
      shipped: 'મોકલી દીધું',
      delivered: 'પહોંચાડ્યું',
      cancelled: 'રદ',
      trackOrder: 'ઓર્ડર ટ્રેક કરો',
      viewOrder: 'ઓર્ડર જુઓ',
      downloadInvoice: 'ચલણ ડાઉનલોડ કરો',
    },
    inquiry: {
      title: 'પૂછપરછ',
      submit: 'પૂછપરછ સબમિટ કરો',
      success: 'પૂછપરછ સબમિટ થઈ',
      successMessage: 'તમારી પૂછપરછ સફળતાપૂર્વક સબમિટ થઈ ગઈ છે. અમે ટૂંક સમયમાં તમારો સંપર્ક કરીશું.',
      name: 'નામ',
      email: 'ઈમેલ',
      phone: 'ફોન',
      message: 'સંદેશ',
      subject: 'વિષય',
      category: 'શ્રેણી',
      productType: 'ઉત્પાદન પ્રકાર',
      fabricPreference: 'કાપડ પસંદગી',
      designStyle: 'ડિઝાઇન શૈલી',
      budget: 'બજેટ',
      preferredDate: 'પસંદગીની તારીખ',
      referenceImage: 'સંદર્ભ છબી',
      instructions: 'સૂચનાઓ',
    },
    appointment: {
      title: 'અપોઇન્ટમેન્ટ બુક કરો',
      book: 'હમણાં બુક કરો',
      success: 'અપોઇન્ટમેન્ટ બુક થઈ',
      successMessage: 'તમારી અપોઇન્ટમેન્ટ સફળતાપૂર્વક બુક થઈ ગઈ છે. અમે વ્હોટ્સએપ પર પુષ્ટિ કરીશું.',
      date: 'તારીખ',
      time: 'સમય',
      type: 'પ્રકાર',
      description: 'વર્ણન',
      communicationMethod: 'સંચાર પદ્ધતિ',
      customDesign: 'કસ્ટમ ડિઝાઇન પરामર્શ',
      weddingFestive: 'લગ્ન અને તહેવાર ઓર્ડર',
      bulkOrder: 'થોક ઓર્ડર ચર્ચા',
      productInquiry: 'ઉત્પાદન પૂછપરછ',
      generalConsultation: 'સામાન્ય પરामર્શ',
    },
    admin: {
      dashboard: 'ડેશબોર્ડ',
      products: 'ઉત્પાદનો',
      categories: 'શ્રેણીઓ',
      orders: 'ઓર્ડર',
      customers: 'ગ્રાહકો',
      inquiries: 'પૂછપરછ',
      appointments: 'અપોઇન્ટમેન્ટ',
      reports: 'અહેવાલ',
      settings: 'સેટિંગ્સ',
      logout: 'લોગઆઉટ',
      overview: 'અવલોકન',
      totalProducts: 'કુલ ઉત્પાદનો',
      totalOrders: 'કુલ ઓર્ડર',
      totalCustomers: 'કુલ ગ્રાહકો',
      totalRevenue: 'કુલ આવક',
      recentOrders: 'તાજેતરના ઓર્ડર',
      lowStock: 'ઓછો સ્ટોક',
      pendingInquiries: 'બાકી પૂછપરછ',
    },
    messages: {
      required: 'આ ફીલ્ડ જરૂરી છે',
      invalid: 'અમાન્ય ઇનપુટ',
      notFound: 'મળ્યું નથી',
      unauthorized: 'અનધિકૃત',
      serverError: 'સર્વર ભૂલ',
      networkError: 'નેટવર્ક ભૂલ',
      saved: 'સફળતાપૂર્વક સાચવ્યું',
      deleted: 'સફળતાપૂર્વક કાઢ્યું',
      updated: 'સફળતાપૂર્વક અપડેટ કર્યું',
      created: 'સફળતાપૂર્વક બનાવ્યું',
      confirmDelete: 'શું તમે ખરેખર આ કાઢી નાખવા માંગો છો?',
      noResults: 'કોઈ પરિણામ મળ્યું નથી',
      tryAgain: 'કૃપા કરીને ફરી પ્રયાસ કરો',
    },
    footer: {
      about: 'અમારા વિશે',
      quickLinks: 'ઝડપી લિંક્સ',
      customerCare: 'ગ્રાહક સેવા',
      getInTouch: 'સંપર્ક કરો',
      followUs: 'અમને ફોલો કરો',
      newsletter: 'ન્યૂઝલેટર',
      subscribe: 'સબસ્ક્રાઇબ',
      emailPlaceholder: 'તમારો ઈમેલ',
      copyright: 'કોપીરાઈટ',
      allRightsReserved: 'સર્વ અધિકાર સુરક્ષિત',
    },
  },
};
