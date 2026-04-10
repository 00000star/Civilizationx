import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/ui/Layout";
import { TreePage } from "./pages/TreePage";
import { TechDetailPage } from "./pages/TechDetailPage";
import { SearchPage } from "./pages/SearchPage";
import { AboutPage } from "./pages/AboutPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TreePage />} />
        <Route path="/tech/:id" element={<TechDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Layout>
  );
}
