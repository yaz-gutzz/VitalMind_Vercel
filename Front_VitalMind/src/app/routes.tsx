import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import { Root } from "./components/Root";
import { AdminRoot } from "./components/AdminRoot";
import { Outlet, useLocation, useNavigate, Navigate } from "react-router";
import OnboardingFlow from "./components/OnboardingFlow";

const MedicationDetailScreen = lazy(() => import("./components/screens/MedicationDetailScreen").then((module) => ({default: module.MedicationDetailScreen,})));
const EditMedicationScreen = lazy(() => import("./components/screens/EditMedicationScreen").then((module) => ({default: module.EditMedicationScreen, })));
const SplashScreen = lazy(() => import("./components/screens/SplashScreen").then((module) => ({ default: module.SplashScreen })));
const AuthScreen = lazy(() => import("./components/screens/AuthScreen").then((module) => ({ default: module.AuthScreen })));
const DashboardScreen = lazy(() => import("./components/screens/DashboardScreen").then((module) => ({ default: module.DashboardScreen })));
const ResumenScreen = lazy(() => import("./components/screens/ResumenScreen").then((module) => ({ default: module.ResumenScreen })));
const SymptomsScreen = lazy(() => import("./components/screens/SymptomsScreen").then((module) => ({default: module.SymptomsScreen})));
const RecomendacionesIAScreen = lazy(() => import("./components/screens/RecomendacionesIAScreen").then((module) => ({ default: module.RecomendacionesIAScreen })));
const ChatbotScreen = lazy(() => import("./components/screens/ChatbotScreen").then((module) => ({ default: module.ChatbotScreen })));
const HabitosScreen = lazy(() => import("./components/screens/HabitosScreen").then((module) => ({ default: module.HabitosScreen })));
const GraficasScreen = lazy(() => import("./components/screens/GraficasScreen").then((module) => ({ default: module.GraficasScreen })));
const NotificacionesScreen = lazy(() => import("./components/screens/NotificacionesScreen").then((module) => ({ default: module.NotificacionesScreen })));
const ProfileScreen = lazy(() => import("./components/screens/ProfileScreen").then((module) => ({ default: module.ProfileScreen })));
const MedicalHistoryScreen = lazy(() => import("./components/screens/MedicalHistoryScreen").then((module) => ({ default: module.MedicalHistoryScreen })));
const MedicamentosScreen = lazy(() => import("./components/screens/MedicamentosScreen").then((module) => ({ default: module.MedicamentosScreen })));
const CitasScreen = lazy(() => import("./components/screens/CitasScreen").then((module) => ({ default: module.CitasScreen })));

const AdminDashboardScreen = lazy(() => import("./components/screens/admin/AdminDashboardScreen").then((module) => ({ default: module.AdminDashboardScreen })));
const AdminUsersScreen = lazy(() => import("./components/screens/admin/AdminUsersScreen").then((module) => ({ default: module.AdminUsersScreen })));
const AdminReportsScreen = lazy(() => import("./components/screens/admin/AdminReportsScreen").then((module) => ({ default: module.AdminReportsScreen })));
const AdminNotificationsScreen = lazy(() => import("./components/screens/admin/AdminNotificationsScreen").then((module) => ({ default: module.AdminNotificationsScreen })));
const AdminSettingsScreen = lazy(() => import("./components/screens/admin/AdminSettingsScreen").then((module) => ({ default: module.AdminSettingsScreen })));

function OnboardingScreen() {
  const navigate = useNavigate();

  return (
    <OnboardingFlow
      onComplete={() => {
        localStorage.setItem("hasOnboarded", "true");
        navigate("/auth");
      }}
    />
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true,                element: <SplashScreen /> },
      { path: "splash",             element: <SplashScreen /> },
      { path: "onboarding",         element: <OnboardingScreen /> },
      { path: "auth",               element: <AuthScreen /> },
      { path: "dashboard",          element: <DashboardScreen /> },
      { path: "resumen",            element: <ResumenScreen /> },
      { path:"registro",            element:<SymptomsScreen/>},
      { path: "ia",                 element: <RecomendacionesIAScreen /> },
      { path: "chatbot",            element: <ChatbotScreen /> },
      { path: "habitos",            element: <HabitosScreen /> },
      { path: "graficas",           element: <GraficasScreen /> },
      { path: "notificaciones",     element: <NotificacionesScreen /> },
      { path: "profile",            element: <ProfileScreen /> },
      { path: "medical-history",    element: <MedicalHistoryScreen /> },
      { path: "medicamentos",       element: <MedicamentosScreen /> },
      { path: "medicamentos/:id",   element: <MedicationDetailScreen /> },
      { path: "citas",              element: <CitasScreen /> },
      { path: "medicamentos/:id/edit", element: <EditMedicationScreen /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminRoot />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard",          element: <AdminDashboardScreen /> },
      { path: "users",              element: <AdminUsersScreen /> },
      { path: "reports",            element: <AdminReportsScreen /> },
      { path: "notifications",      element: <AdminNotificationsScreen /> },
      { path: "settings",           element: <AdminSettingsScreen /> },
    ],
  },
]);
