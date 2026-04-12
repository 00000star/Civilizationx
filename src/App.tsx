import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/ui/Layout";
import { PageTransition } from "./components/ui/PageTransition";
import { TreePage } from "./pages/TreePage";
import { TechDetailPage } from "./pages/TechDetailPage";
import { SearchPage } from "./pages/SearchPage";
import { AboutPage } from "./pages/AboutPage";
import { SurvivePage } from "./pages/SurvivePage";
import { AtlasPage } from "./pages/AtlasPage";
import { StatusPage } from "./pages/StatusPage";
import { ContributePage } from "./pages/ContributePage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route element={<PageTransition />}>
          <Route path="/" element={<TreePage />} />
          <Route path="/tech/:id" element={<TechDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/survive" element={<SurvivePage />} />
          <Route path="/atlas" element={<AtlasPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/contribute" element={<ContributePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
