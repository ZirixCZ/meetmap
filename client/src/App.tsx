import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ErrorRoute from "./routes/error";
import { LeafletProvider } from "./components/Leaflet/context/LeafletContext";
import MapRoute from "./routes/map";
import Root from "./routes/root";
import AuthDialogRoute from "./routes/authDialog";
import SearchOverlayRoute from "./routes/searchOverlay";
import RegisterDialogRoute from "./routes/registerDialog";
import { UserContextProvider, useUser } from "./contexts/UserContext";
import AdminRoute from "./routes/admin";
import { User } from "./types/user";
import { RightCornerDialogProvider } from "./contexts/RightCornerDialogOpened";
import { apiUrl } from "./Constants/constants";
import { useEffect } from "react";
import AuthGuard from "./authGuard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorRoute />,
    children: [
      {
        path: "/",
        element: <>
        <AuthGuard/>
        <MapRoute /></>,
        errorElement: <ErrorRoute />,
      },
      {
        path: "admin",

        element: <><AuthGuard/><AdminRoute /></>,
        errorElement: <ErrorRoute />,
      },
      {
        path: "map",
        element: <>
        <AuthGuard/>
        <MapRoute /></>,
        errorElement: <ErrorRoute />,
      },
      {
        path: "auth",
        element: <AuthDialogRoute />,
        errorElement: <ErrorRoute />,
      },
      {
        path: "search",
        element: <>
        <AuthGuard/>
        <SearchOverlayRoute /></>,
        errorElement: <ErrorRoute />,
      },
      {
        path: "auth/register",
        element: <RegisterDialogRoute />,
        errorElement: <ErrorRoute />,
      },
    ],
  },
]);

function App() {
  return (
    <UserContextProvider user={null} token={null}>
      <RightCornerDialogProvider>
        <LeafletProvider>
          <RouterProvider router={router} />
        </LeafletProvider>
      </RightCornerDialogProvider>
    </UserContextProvider>
  );
}

export default App;
