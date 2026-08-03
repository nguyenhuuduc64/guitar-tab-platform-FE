import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes, adminRoutes } from "./routes";
import { DefaultLayout } from "./layouts/user/DefaultLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminDefaultLayout from "./layouts/admin/AdminDefaultLayout";
import { ChordProvider } from "./context/ChordContext";
import WebSocketInitializer from "./components/common/WebSocketInitializer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    return (
        <ChordProvider>
            <Router>
                <WebSocketInitializer />
                <ToastContainer />
                <Routes>
                    {publicRoutes.map((route, index) => {
                        const Page = route.component;
                        const Layout = route.layout === null ? ({ children }: { children: React.ReactNode }) => <>{children}</> : DefaultLayout;
                        return (
                            <Route
                                key={`public-${index}`}
                                path={route.path}
                                element={
                                    <Layout>
                                        <Page />
                                    </Layout>
                                }
                            />
                        );
                    })}

                    {privateRoutes.map((route, index) => {
                        const Page = route.component;
                        return (
                            <Route
                                key={`private-${index}`}
                                path={route.path}
                                element={
                                    <DefaultLayout>
                                        <ProtectedRoute>
                                            <Page />
                                        </ProtectedRoute>
                                    </DefaultLayout>
                                }
                            />
                        );
                    })}

                    {adminRoutes.map((route, index) => {
                        const Page = route.component;
                        return (
                            <Route
                                key={`admin-${index}`}
                                path={route.path}
                                element={
                                    <AdminDefaultLayout>
                                        <ProtectedRoute allowedRoles={["admin"]}>
                                            <Page />
                                        </ProtectedRoute>
                                    </AdminDefaultLayout>
                                }
                            />
                        );
                    })}
                </Routes>
            </Router>
        </ChordProvider>
    );
}

export default App;
