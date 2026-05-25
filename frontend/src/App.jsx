import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import ClientDashboard from "./pages/client/ClientDashboard";
import Inventory from "./pages/client/Inventory";
import Orders from "./pages/client/Orders";
import ClientAnalytics from "./pages/client/ClientAnalytics";
import ClientAlerts from "./pages/client/ClientAlerts";
import Profile from "./pages/client/Profile";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Companies from "./pages/admin/Companies";
import UsersPage from "./pages/admin/UsersPage";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminAlerts from "./pages/admin/AdminAlerts";
import AdminSettings from "./pages/admin/AdminSettings";

import DashboardLayout from "./components/layout/DashboardLayout";
import useAuth from "./hooks/useAuth";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return isAdmin ? children : <Navigate to="/dashboard" replace />;
}

function ClientPage({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function AdminPage({ children }) {
  return (
    <AdminRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </AdminRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ClientPage>
              <ClientDashboard />
            </ClientPage>
          }
        />
        <Route
          path="/inventory"
          element={
            <ClientPage>
              <Inventory />
            </ClientPage>
          }
        />
        <Route
          path="/orders"
          element={
            <ClientPage>
              <Orders />
            </ClientPage>
          }
        />
        <Route
          path="/analytics"
          element={
            <ClientPage>
              <ClientAnalytics />
            </ClientPage>
          }
        />
        <Route
          path="/alerts"
          element={
            <ClientPage>
              <ClientAlerts />
            </ClientPage>
          }
        />
        <Route
          path="/profile"
          element={
            <ClientPage>
              <Profile />
            </ClientPage>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminPage>
              <AdminDashboard />
            </AdminPage>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <AdminPage>
              <Companies />
            </AdminPage>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminPage>
              <UsersPage />
            </AdminPage>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminPage>
              <AdminAnalytics />
            </AdminPage>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <AdminPage>
              <AdminActivity />
            </AdminPage>
          }
        />
        <Route
          path="/admin/alerts"
          element={
            <AdminPage>
              <AdminAlerts />
            </AdminPage>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminPage>
              <AdminSettings />
            </AdminPage>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// import { BrowserRouter, Routes, Route } from "react-router-dom";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<div style={{color:"white"}}>HOME WORKING</div>} />
//       </Routes>
//     </BrowserRouter>
//   );
// }
