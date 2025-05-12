
import { CardWithForm } from "@/components/Card";
import DashboardProtectedRoute from "@/HOC/dashboardProtectRoutes";



export default function Dashboard() {
  return (
    <DashboardProtectedRoute>
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <CardWithForm />
    </div>
    </DashboardProtectedRoute>
  );
}