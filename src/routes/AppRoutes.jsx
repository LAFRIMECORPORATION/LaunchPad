import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  AUTH_PAGES,
  FULL_BLEED_PAGES,
  NO_SIDEBAR_PAGES,
  PUBLIC_PAGES,
  getPageFromPath,
} from '../config/routes';
import { Navbar, Sidebar, Toast } from '../components/UI';
import BottomNav from '../components/BottomNav';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Explore from '../pages/Explore';
import ProjectDetail from '../pages/ProjectDetail';
import DashboardStudent from '../pages/DashboardStudent';
import DashboardInvestor from '../pages/DashboardInverstor';
import Publish from '../pages/Publish';
import Collaboration from '../pages/Collaboration';
import Messages from '../pages/Messages';
import Notification from '../pages/Notification';
import ProfileStudent from '../pages/ProfileStudent';
import ProfileInvestor from '../pages/ProfileInverstor';
import Admin from '../pages/Admin';
import SavedProjects from '../pages/SavedProjects';
import InvestorRequests from '../pages/InvestorRequests';
import KycVerification from '../pages/KycVerification';
import FeedPage from '../pages/FeedPage';
import BadgesPage from '../pages/BadgesPage';
import AppointmentsPage from '../pages/AppointmentsPage';
import PaymentPage from '../pages/PaymentPage';
import DueDiligencePage from '../pages/DueDiligencePage';
import ForumPage from '../pages/ForumPage';
import AcademyPage from '../pages/AcademyPage';

function ProtectedRoute({ children }) {
  const { currentUser, authLoading } = useApp();
  const { pathname } = useLocation();
  const page = getPageFromPath(pathname);
  const isPublic = PUBLIC_PAGES.includes(page);

  if (authLoading) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Chargement…</p>
      </div>
    );
  }

  if (!isPublic && !currentUser) {
    return <Navigate to="/login" replace state={{ from: pathname }} />;
  }

  return children;
}

function AppLayout({ children }) {
  const { currentUser } = useApp();
  const { pathname } = useLocation();
  const page = getPageFromPath(pathname);
  const isAuthPage = AUTH_PAGES.includes(page);
  const showSidebar = currentUser && !NO_SIDEBAR_PAGES.includes(page);
  const isFullBleed = FULL_BLEED_PAGES.includes(page);

  if (isAuthPage) {
    return (
      <div className="app-shell">
        {children}
        <Toast />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        {showSidebar && <Sidebar />}
        <main className="app-main" style={isFullBleed ? { padding: 0 } : {}}>
          {children}
        </main>
      </div>
      {currentUser && <BottomNav />}
      <Toast />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/dashboard/student" element={<DashboardStudent />} />
          <Route path="/dashboard/investor" element={<DashboardInvestor />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/collaboration" element={<Collaboration />} />
          <Route path="/team-space" element={<Collaboration />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notification />} />
          <Route path="/profile/student" element={<ProfileStudent />} />
          <Route path="/profile/investor" element={<ProfileInvestor />} />
          <Route path="/saved" element={<SavedProjects />} />
          <Route path="/investor-requests" element={<InvestorRequests />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/kyc" element={<KycVerification />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/due-diligence" element={<DueDiligencePage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/academy" element={<AcademyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </ProtectedRoute>
  );
}
