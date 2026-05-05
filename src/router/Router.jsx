import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "../pages/Home"
import Login from "../pages/Login"
import Register from "../pages/Register"
import Explore from "../pages/Explore"
import ProjectDetail from "../pages/ProjectDetail"
import DashboardStudent from "../pages/DashboardStudent"
import DashboardInvestor from "../pages/DashboardInverstor"
import Publish from "../pages/Publish"
import Collaboration from "../pages/Collaboration"
import Messages from "../pages/Messages"
import Notification from "../pages/Notification"
import ProfileStudent from "../pages/ProfileStudent"
import ProfileInvestor from "../pages/ProfileInverstor"
import Admin from "../pages/Admin"

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                {/* public */}
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                {/* AUTH*/}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/*STUDENT*/}
                <Route path="/student/dashboard" element={<DashboardStudent />} />
                <Route path="/publish" element={<Publish />} />
                <Route path="/collaboration" element={<Collaboration />} />
                {/*INVESTOR*/}
                <Route path="/investor/dashboard" element={<DashboardInvestor />} />

                {/*COMMUNICATION*/}
                <Route path="/messages" element={<Messages />} />
                <Route path="/notifications" element={<Notification />} />
                {/*PROFILE*/}
                <Route path="/profile/student" element={<ProfileStudent />} />
                <Route path="/profile/investor" element={<ProfileInvestor />} />
                {/* ADMIN*/}
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </BrowserRouter>
    )

}