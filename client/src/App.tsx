import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ErrorRoute from "./routes/error";
import { LeafletProvider } from "./components/Leaflet/context/LeafletContext";
import MapRoute from "./routes/map";
import Root from "./routes/root";
import AuthDialogRoute from "./routes/authDialog";
import SearchOverlayRoute from "./routes/searchOverlay";
import RegisterDialogRoute from "./routes/registerDialog";
import { UserContextProvider } from "./contexts/UserContext";
import AdminRoute from "./routes/admin";
import { User } from "./types/user";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorRoute />,
    children: [
      {
        path: "/",
        element: <MapRoute />,
        errorElement: <ErrorRoute />,
      },
      {
        path: "admin",
        element: <AdminRoute />,
        errorElement: <ErrorRoute />,
      },
      {
        path: "map",
        element: <MapRoute />,
        errorElement: <ErrorRoute />,
      },
      {
        path: "auth",
        element: <AuthDialogRoute />,
        errorElement: <ErrorRoute />,
      },
      {
        path: "search",
        element: <SearchOverlayRoute />,
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
  const user: User = {
    id: "0",
    name: "Testovaci User",
    email: "test@test.com",
    role: "default",
    createdAt: "",
    updatedAt: "",
  };

  return (
    <UserContextProvider user={user}>
      <LeafletProvider>
        <RouterProvider router={router} />
      </LeafletProvider>
    </UserContextProvider>
  );
}

export default App;
