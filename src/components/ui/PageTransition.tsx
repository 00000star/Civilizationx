import { Outlet } from "react-router-dom";

export function PageTransition() {
  return (
    <div className="flex min-h-0 min-h-full flex-1 flex-col">
      <Outlet />
    </div>
  );
}
