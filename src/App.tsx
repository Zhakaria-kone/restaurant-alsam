import { Outlet } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";
function App() {
  return (
    <Layout>
      <Outlet />
      <Toaster richColors position="top-right" />
    </Layout>
  );
}
export default App;