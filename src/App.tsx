import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicRoutes, privateRoutes } from "./routes";
import { DefaultLayout } from "./layouts/DefaultLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

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
            </Routes>
        </Router>
    );
}

export default App;
