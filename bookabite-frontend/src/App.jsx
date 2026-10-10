import React, { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Layout & Navigation
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import ScrollToTop from './components/common/ScrollToTop';
import SteamMark from './components/layout/SteamMark';

const HomePage = lazy(() => import('./pages/Home/HomePage'));
const ExplorePage = lazy(() => import('./pages/Explore/ExplorePage'));
const RestaurantDetails = lazy(() => import('./pages/Restaurant/RestaurantDetails'));
const MenuPage = lazy(() => import('./pages/Menu/MenuPage'));
const FoodDetailsPage = lazy(() => import('./pages/Food/FoodDetailsPage'));
const TableBookingPage = lazy(() => import('./pages/Booking/TableBookingPage'));
const BookingConfirmationPage = lazy(() => import('./pages/Booking/BookingConfirmationPage'));
const CustomerLoginPage = lazy(() => import('./pages/Auth/CustomerLoginPage'));
const LoginOptionsPage = lazy(() => import('./pages/Auth/LoginOptionsPage'));
const CustomerRegisterPage = lazy(() => import('./pages/Auth/CustomerRegisterPage'));
const PasswordRecoveryPage = lazy(() => import('./pages/Auth/PasswordRecoveryPage'));
const OwnerLoginPage = lazy(() => import('./pages/Owner/OwnerLoginPage'));
const OwnerRegisterPage = lazy(() => import('./pages/Owner/OwnerRegisterPage'));
const OwnerPendingPage = lazy(() => import('./pages/Owner/OwnerPendingPage'));
const OwnerDashboardPage = lazy(() => import('./pages/Owner/OwnerDashboardPage'));
const OwnerReportsPage = lazy(() => import('./pages/Owner/OwnerReportsPage'));
const OwnerBillingPage = lazy(() => import('./pages/Owner/OwnerBillingPage'));
const RestaurantTableStatusPage = lazy(() => import('./pages/Owner/RestaurantTableStatusPage'));
const ManageTablesPage = lazy(() => import('./pages/Owner/ManageTablesPage'));
const AddRestaurantPage = lazy(() => import('./pages/Owner/AddRestaurantPage'));
const EditRestaurantPage = lazy(() => import('./pages/Owner/EditRestaurantPage'));
const ManageMenuPage = lazy(() => import('./pages/Owner/ManageMenuPage'));
const ManageBookingsPage = lazy(() => import('./pages/Owner/ManageBookingsPage'));
const CustomerProfilePage = lazy(() => import('./pages/Customer/CustomerProfilePage'));
const MyBookingsPage = lazy(() => import('./pages/Customer/MyBookingsPage'));
const FavoritesPage = lazy(() => import('./pages/Customer/FavoritesPage'));
const SearchResultsPage = lazy(() => import('./pages/Search/SearchResultsPage'));
const AboutPage = lazy(() => import('./pages/About/AboutPage'));
const ContactPage = lazy(() => import('./pages/Contact/ContactPage'));
const HelpFAQPage = lazy(() => import('./pages/Help/HelpFAQPage'));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'));
const AdminLoginPage = lazy(() => import('./pages/Admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/Admin/AdminDashboardPage'));

import RequireRole from './components/common/RequireRole';

const OWNER_ROLES = ['owner', 'admin'];

export default function App() {
  const location = useLocation();

  return (
    <div className="bab-app">
      <ScrollToTop />
      <Navbar />

      <main className="bab-app__main">
        <div key={location.pathname} className="bab-page-transition">
          <span className="bab-page-transition__steam">
            <SteamMark size={36} animate />
          </span>
          <Suspense fallback={<div role="status" style={{ minHeight: '40vh', display: 'grid', placeItems: 'center', color: 'var(--bab-text-muted)' }}>Loading page…</div>}>
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
          <Route path="/login" element={<LoginOptionsPage />} />
          <Route path="/login/customer" element={<CustomerLoginPage />} />

          {/* 9. Customer Register */}
          <Route path="/register" element={<CustomerRegisterPage />} />
          <Route path="/forgot-password" element={<PasswordRecoveryPage />} />

          {/* 10. Owner Login */}
          <Route path="/owner/login" element={<OwnerLoginPage />} />

          {/* 11. Owner Register */}
          <Route path="/owner/register" element={<OwnerRegisterPage />} />
          <Route path="/owner/pending" element={<OwnerPendingPage />} />

          {/* 12. Owner Dashboard */}
          <Route path="/owner/dashboard" element={<RequireRole roles={OWNER_ROLES} loginPath="/owner/login"><OwnerDashboardPage /></RequireRole>} />
          <Route path="/owner" element={<RequireRole roles={OWNER_ROLES} loginPath="/owner/login"><OwnerDashboardPage /></RequireRole>} />
          <Route path="/owner/restaurants/:id/manage-tables" element={<RequireRole roles={OWNER_ROLES} loginPath="/owner/login"><ManageTablesPage /></RequireRole>} />
<Route path="/admin/restaurants/:id/manage-tables" element={<RequireRole roles={['admin']} loginPath="/admin/login"><ManageTablesPage /></RequireRole>} />
          <Route path="/owner/reports" element={<RequireRole roles={OWNER_ROLES} loginPath="/owner/login"><OwnerReportsPage /></RequireRole>} />
          <Route path="/owner/billing" element={<RequireRole roles={OWNER_ROLES} loginPath="/owner/login"><OwnerBillingPage /></RequireRole>} />
          <Route path="/owner/restaurants/:id/tables" element={<RequireRole roles={OWNER_ROLES} loginPath="/owner/login"><RestaurantTableStatusPage /></RequireRole>} />
          <Route path="/admin/restaurants/:id/tables" element={<RequireRole roles={['admin']} loginPath="/admin/login"><RestaurantTableStatusPage /></RequireRole>} />

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
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Footer */}
      <Footer />
    </div>
  );
}