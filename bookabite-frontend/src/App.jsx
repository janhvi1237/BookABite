import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout & Navigation
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import MascotReaction from './components/mascot/MascotReaction';
import ScrollToTop from './components/common/ScrollToTop';

// 24 Production Pages
// 1. Home
import HomePage from './pages/Home/HomePage';
// 2. Explore Restaurants
import ExplorePage from './pages/Explore/ExplorePage';
// 3. Restaurant Details
import RestaurantDetails from './pages/Restaurant/RestaurantDetails';
// 4. Global Menu
import MenuPage from './pages/Menu/MenuPage';
// 5. Food / Dish Details
import FoodDetailsPage from './pages/Food/FoodDetailsPage';
// 6. Table Booking
import TableBookingPage from './pages/Booking/TableBookingPage';
// 7. Booking Confirmation
import BookingConfirmationPage from './pages/Booking/BookingConfirmationPage';
// 8. Customer Login
import CustomerLoginPage from './pages/Auth/CustomerLoginPage';
import LoginOptionsPage from './pages/Auth/LoginOptionsPage';
// 9. Customer Register
import CustomerRegisterPage from './pages/Auth/CustomerRegisterPage';
import PasswordRecoveryPage from './pages/Auth/PasswordRecoveryPage';
// 10. Owner Login
import OwnerLoginPage from './pages/Owner/OwnerLoginPage';
// 11. Owner Register
import OwnerRegisterPage from './pages/Owner/OwnerRegisterPage';
import OwnerPendingPage from './pages/Owner/OwnerPendingPage';
// 12. Owner Dashboard
import OwnerDashboardPage from './pages/Owner/OwnerDashboardPage';
import OwnerReportsPage from './pages/Owner/OwnerReportsPage';
import OwnerBillingPage from './pages/Owner/OwnerBillingPage';
import RestaurantTableStatusPage from './pages/Owner/RestaurantTableStatusPage';
import ManageTablesPage from './pages/Owner/ManageTablesPage';
// 13. Add Restaurant
import AddRestaurantPage from './pages/Owner/AddRestaurantPage';
// 14. Edit Restaurant
import EditRestaurantPage from './pages/Owner/EditRestaurantPage';
// 15. Manage Menu
import ManageMenuPage from './pages/Owner/ManageMenuPage';
// 16. Manage Bookings
import ManageBookingsPage from './pages/Owner/ManageBookingsPage';
// 17. Customer Profile
import CustomerProfilePage from './pages/Customer/CustomerProfilePage';
// 18. My Bookings
import MyBookingsPage from './pages/Customer/MyBookingsPage';
// 19. Favorite Restaurants
import FavoritesPage from './pages/Customer/FavoritesPage';
// 20. Search Results
import SearchResultsPage from './pages/Search/SearchResultsPage';
// 21. About
import AboutPage from './pages/About/AboutPage';
// 22. Contact
import ContactPage from './pages/Contact/ContactPage';
// 23. Help & FAQ
import HelpFAQPage from './pages/Help/HelpFAQPage';
// 24. 404 Not Found
import NotFoundPage from './pages/NotFound/NotFoundPage';

// Admin + page guard
import AdminLoginPage from './pages/Admin/AdminLoginPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import RequireRole from './components/common/RequireRole';

const OWNER_ROLES = ['owner', 'admin'];

export default function App() {
  return (
    <div className="bab-app">
      <ScrollToTop />
      <Navbar />

      <main className="bab-app__main">
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