import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout & Navigation (Kept static for instant header/navigation render)
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import MascotReaction from './components/mascot/MascotReaction';
import ScrollToTop from './components/common/ScrollToTop';
import RequireRole from './components/common/RequireRole';

// 24 Dynamic Route Imports (Code-Splitting)
// 1. Home
const HomePage = lazy(() => import('./pages/Home/HomePage'));
// 2. Explore Restaurants
const ExplorePage = lazy(() => import('./pages/Explore/ExplorePage'));
// 3. Restaurant Details
const RestaurantDetails = lazy(() => import('./pages/Restaurant/RestaurantDetails'));
// 4. Global Menu
const MenuPage = lazy(() => import('./pages/Menu/MenuPage'));
// 5. Food / Dish Details
const FoodDetailsPage = lazy(() => import('./pages/Food/FoodDetailsPage'));
// 6. Table Booking
const TableBookingPage = lazy(() => import('./pages/Booking/TableBookingPage'));
// 7. Booking Confirmation
const BookingConfirmationPage = lazy(() => import('./pages/Booking/BookingConfirmationPage'));
// 8. Customer Login
const CustomerLoginPage = lazy(() => import('./pages/Auth/CustomerLoginPage'));
// 9. Customer Register
const CustomerRegisterPage = lazy(() => import('./pages/Auth/CustomerRegisterPage'));
// 10. Owner Login
const OwnerLoginPage = lazy(() => import('./pages/Owner/OwnerLoginPage'));
// 11. Owner Register
const OwnerRegisterPage = lazy(() => import('./pages/Owner/OwnerRegisterPage'));
const OwnerPendingPage = lazy(() => import('./pages/Owner/OwnerPendingPage'));
// 12. Owner Dashboard
const OwnerDashboardPage = lazy(() => import('./pages/Owner/OwnerDashboardPage'));
// 13. Add Restaurant
const AddRestaurantPage = lazy(() => import('./pages/Owner/AddRestaurantPage'));
// 14. Edit Restaurant
const EditRestaurantPage = lazy(() => import('./pages/Owner/EditRestaurantPage'));
// 15. Manage Menu
const ManageMenuPage = lazy(() => import('./pages/Owner/ManageMenuPage'));
// 16. Manage Bookings
const ManageBookingsPage = lazy(() => import('./pages/Owner/ManageBookingsPage'));
// 17. Customer Profile
const CustomerProfilePage = lazy(() => import('./pages/Customer/CustomerProfilePage'));
// 18. My Bookings
const MyBookingsPage = lazy(() => import('./pages/Customer/MyBookingsPage'));
// 19. Favorite Restaurants
const FavoritesPage = lazy(() => import('./pages/Customer/FavoritesPage'));
// 20. Search Results
const SearchResultsPage = lazy(() => import('./pages/Search/SearchResultsPage'));
// 21. About
const AboutPage = lazy(() => import('./pages/About/AboutPage'));
// 22. Contact
const ContactPage = lazy(() => import('./pages/Contact/ContactPage'));
// 23. Help & FAQ
const HelpFAQPage = lazy(() => import('./pages/Help/HelpFAQPage'));
// 24. 404 Not Found
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'));

// Admin
const AdminLoginPage = lazy(() => import('./pages/Admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/Admin/AdminDashboardPage'));

const OWNER_ROLES = ['owner', 'admin'];

// Page level loading fallback
const PageFallback = () => (
  <div className="bab-page-loader" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div className="bab-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--color-primary, #c85a32)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default function App() {
  return (
    <div className="bab-app">
      <ScrollToTop />
      <Navbar />

      <main className="bab-app__main">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* 1. Home */}
            <Route path="/" element={<HomePage />} />

            {/* 2. Explore Restaurants (with aliases) */}
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/restaurants" element={<ExplorePage />} />

            {/* 3. Restaurant Details */}
            <Route path="/restaurants/:id" element={<RestaurantDetails />} />

            {/* 4. Global Menu */}
            <Route path="/menu" element={<MenuPage />} />

            {/* 5. Food / Dish Details */}
            <Route path="/food/:id" element={<FoodDetailsPage />} />
            <Route path="/menu/:id" element={<FoodDetailsPage />} />

            {/* 6. Table Booking */}
            <Route path="/restaurants/:id/book" element={<TableBookingPage />} />
            <Route path="/book/:id" element={<TableBookingPage />} />

            {/* 7. Booking Confirmation */}
            <Route path="/booking-confirmation/:id" element={<BookingConfirmationPage />} />
            <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />

            {/* 8. Customer Login */}
            <Route path="/login" element={<CustomerLoginPage />} />

            {/* 9. Customer Register */}
            <Route path="/register" element={<CustomerRegisterPage />} />

            {/* 10. Owner Login */}
            <Route path="/owner/login" element={<OwnerLoginPage />} />

            {/* 11. Owner Register */}
            <Route path="/owner/register" element={<OwnerRegisterPage />} />
            <Route path="/owner/pending" element={<OwnerPendingPage />} />

            {/* 12. Owner Dashboard */}
            <Route path="/owner/dashboard" element={<RequireRole roles={OWNER_ROLES} loginPath="/owner/login"><OwnerDashboardPage /></RequireRole>} />
            <Route path="/owner" element={<RequireRole roles={OWNER_ROLES} loginPath="/owner/login"><OwnerDashboardPage /></RequireRole>} />

            {/* 13. Add Restaurant */}
            <Route path="/owner/restaurants/new" element={<RequireRole roles={OWNER_ROLES} loginPath="/owner/login"><AddRestaurantPage /></RequireRole>} />

            {/* 14. Edit Restaurant */}
            <Route path="/owner/restaurants/:id/edit" element={<RequireRole roles={OWNER_ROLES} loginPath="/owner/login"><EditRestaurantPage /></RequireRole>} />
            <Route path="/owner/restaurants/edit" element={<RequireRole roles={OWNER_ROLES} loginPath="/owner/login"><EditRestaurantPage /></RequireRole>} />

            {/* 15. Manage Menu */}
            <Route path="/owner/menu" element={<RequireRole roles={OWNER_ROLES} loginPath="/owner/login"><ManageMenuPage /></RequireRole>} />
            <Route path="/owner/restaurants/:restaurantId/menu" element={<RequireRole roles={OWNER_ROLES} loginPath="/owner/login"><ManageMenuPage /></RequireRole>} />

            {/* 16. Manage Bookings */}
            <Route path="/owner/bookings" element={<RequireRole roles={OWNER_ROLES} loginPath="/owner/login"><ManageBookingsPage /></RequireRole>} />

            {/* 17. Customer Profile */}
            <Route path="/profile" element={<CustomerProfilePage />} />

            {/* 18. My Bookings */}
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/bookings" element={<MyBookingsPage />} />

            {/* 19. Favorite Restaurants */}
            <Route path="/favorites" element={<FavoritesPage />} />

            {/* 20. Search Results */}
            <Route path="/search" element={<SearchResultsPage />} />

            {/* 21. About */}
            <Route path="/about" element={<AboutPage />} />

            {/* 22. Contact */}
            <Route path="/contact" element={<ContactPage />} />

            {/* 23. Help & FAQ */}
            <Route path="/help" element={<HelpFAQPage />} />
            <Route path="/faq" element={<HelpFAQPage />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <RequireRole roles={['admin']} loginPath="/admin/login">
                  <AdminDashboardPage />
                </RequireRole>
              }
            />

            {/* 24. 404 Not Found Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Floating Interactive Mascot Assistant */}
      <MascotReaction />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Footer */}
      <Footer />
    </div>
  );
}