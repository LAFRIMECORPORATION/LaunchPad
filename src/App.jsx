import { useApp } from "./context/AppContext";
import { Navbar, Sidebar, Toast } from "./components/UI";

// --- pages---//
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Explore from "./pages/Explore"
import ProjectDetail from "./pages/ProjectDetail"
import DashboardStudent from "./pages/DashboardStudent"
import DashboardInvestor from "./pages/DashboardInverstor"
import Publish from "./pages/Publish"
import Collaboration from "./pages/Collaboration"
import Messages from "./pages/Messages"
import Notification from "./pages/Notification"
import ProfileStudent from "./pages/ProfileStudent"
import ProfileInvestor from "./pages/ProfileInverstor"
import Admin from "./pages/Admin"
import SavedProjects from "./pages/SavedProjects";
import InvestorRequests from "./pages/InvestorRequests";
import BottomNav from "./components/BottomNav";
import KycVerification   from "./pages/KycVerification";
import FeedPage          from "./pages/FeedPage";
import BadgesPage        from "./pages/BadgesPage";
import AppointmentsPage  from "./pages/AppointmentsPage";
import PaymentPage       from "./pages/PaymentPage";
import DueDiligencePage  from "./pages/DueDiligencePage";
import ForumPage         from "./pages/ForumPage";
import AcademyPage       from "./pages/AcademyPage";

// route map//
const ROUTES = {
  "home": Home,
  "login": Login,
  "register": Register,
  "dashboard-student": DashboardStudent,
  "dashboard-investor": DashboardInvestor,
  "publish": Publish,
  "explore": Explore,
  "project-detail": ProjectDetail,
  "collaboration": Collaboration,
  "team-space": Collaboration,
  "messages": Messages,
  "notifications": Notification,
  "profile-student": ProfileStudent,
  "profile-investor": ProfileInvestor,
  "saved-projects": SavedProjects,
  "investor-requests": InvestorRequests,
  "admin": Admin,
  "kyc-verification":   KycVerification,
  "feed":               FeedPage,
  "badges":             BadgesPage,
  "appointments":       AppointmentsPage,
  "payment":            PaymentPage,
  "due-diligence":      DueDiligencePage,
  "forum":              ForumPage,
  "academy":            AcademyPage,
};
// pages sans navbar //
const AUTH_PAGES = ["login", "register"];

//  pages sans sidebar //
const NO_SIDEBAR_PAGES = [
  "home", "login", "register", "explore", "project-detail", "publish", "collaboration", "team-space", "profile-student", "profile-investor", "messages",
];
//(ces pages ont leur propre BackButton donc pas besoin de sidebar investor request et saved projects)

// pages sans paddind sur app-main // 

const FULL_BLEED_PAGES = ["messages", "home"];

export default function App() {
  const { currentPage, currentUser, navigate } = useApp();

  const PageComponent = ROUTES[currentPage] || Home;
  const isAuthPage = AUTH_PAGES.includes(currentPage);
  const showSidebar = currentUser && !NO_SIDEBAR_PAGES.includes(currentPage);
  const isFullBleed = FULL_BLEED_PAGES.includes(currentPage);


  // ── Protection des routes ──
  const publicPages = ["home", "login", "register", "project-detail"]
  const isPublic = publicPages.includes(currentPage);

  // si page protegé et pas connecté login

  if (!isPublic && !currentUser) {
    navigate("login")
    return null
  }


  // auth pages : layout sans navbar ni sidebar

  if (isAuthPage) {
    return (
      <div className="app-shell">

        <PageComponent />
        <Toast />

      </div>
    );
  }

  return (
    <div className="app-shell">

      <Navbar />

      <div className="app-body" >
        {showSidebar && <Sidebar />}

        <main className="app-main" style={isFullBleed ? { padding: 0 } : {}} >
          <PageComponent /> 
        </main>

      </div>

      {/* backbutton personalisé*/}

      {currentUser && <BottomNav />}

      <Toast />

    </div>
  )
}