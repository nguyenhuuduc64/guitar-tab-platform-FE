import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes, adminRoutes } from "./routes";
import { DefaultLayout } from "./layouts/user/DefaultLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminDefaultLayout from "./layouts/admin/AdminDefaultLayout";
function App() {
    return (
        <Router>
            <Routes>
                {publicRoutes.map((route, index) => {
                    const Page = route.component;
                    return (
                        <Route
                            key={`public-${index}`}
                            path={route.path}
                            element={
                                <DefaultLayout>
                                    <Page />
                                </DefaultLayout>
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
                                <ProtectedRoute>
                                    <DefaultLayout>
                                        <Page />
                                    </DefaultLayout>
                                </ProtectedRoute>
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
                                <ProtectedRoute>
                                    <AdminDefaultLayout>
                                        <Page />
                                    </AdminDefaultLayout>
                                </ProtectedRoute>
                            }
                        />
                    );
                })}
            </Routes>
        </Router>
    );
}

export default App;
