import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/ui/Layout";
import { LoadingState } from "./components/ui/LoadingState";
import { PageTransition } from "./components/ui/PageTransition";

const TreePage = lazy(() =>
  import("./pages/TreePage").then((mod) => ({ default: mod.TreePage }))
);
const TechDetailPage = lazy(() =>
  import("./pages/TechDetailPage").then((mod) => ({ default: mod.TechDetailPage }))
);
const SearchPage = lazy(() =>
  import("./pages/SearchPage").then((mod) => ({ default: mod.SearchPage }))
);
const FoundationsPage = lazy(() =>
  import("./pages/FoundationsPage").then((mod) => ({ default: mod.FoundationsPage }))
);
const PathfinderPage = lazy(() =>
  import("./pages/PathfinderPage").then((mod) => ({ default: mod.PathfinderPage }))
);
const SurvivePage = lazy(() =>
  import("./pages/SurvivePage").then((mod) => ({ default: mod.SurvivePage }))
);
const AtlasPage = lazy(() =>
  import("./pages/AtlasPage").then((mod) => ({ default: mod.AtlasPage }))
);
const StatusPage = lazy(() =>
  import("./pages/StatusPage").then((mod) => ({ default: mod.StatusPage }))
);
const ContributePage = lazy(() =>
  import("./pages/ContributePage").then((mod) => ({ default: mod.ContributePage }))
);
const AboutPage = lazy(() =>
  import("./pages/AboutPage").then((mod) => ({ default: mod.AboutPage }))
);

export default function App() {
  return (
    <Suspense fallback={<LoadingState label="Loading Codex module..." />}>
      <Routes>
        <Route element={<Layout />}>
          <Route element={<PageTransition />}>
            <Route path="/" element={<TreePage />} />
            <Route path="/tech/:id" element={<TechDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/foundations" element={<FoundationsPage />} />
            <Route path="/pathfinder" element={<PathfinderPage />} />
            <Route path="/survive" element={<SurvivePage />} />
            <Route path="/atlas" element={<AtlasPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
