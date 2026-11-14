import { useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router";
import Login from "./pages/auth/Login";
import Store from "./pages/store/Store";
import Cart from "./pages/cart/Cart";
import AdminProducts from "./pages/admin/AdminProducts";
import type { User } from "./lib/api";

interface AuthState {
    user: User;
    token: string;
}

function readAuth(): AuthState | null {
    const token = localStorage.getItem("rasa-token");
    const rawUser = localStorage.getItem("rasa-user");
    if (!token || !rawUser) return null;
    try {
        return { token, user: JSON.parse(rawUser) as User };
    } catch {
        localStorage.removeItem("rasa-token");
        localStorage.removeItem("rasa-user");
        return null;
    }
}

export default function App() {
    const [auth, setAuth] = useState<AuthState | null>(readAuth);
    const navigate = useNavigate();

    function handleAuthenticated(user: User, token: string) {
        localStorage.setItem("rasa-token", token);
        localStorage.setItem("rasa-user", JSON.stringify(user));
        setAuth({ user, token });
        navigate("/menu", { replace: true });
    }

    function handleLogout() {
        localStorage.removeItem("rasa-token");
        localStorage.removeItem("rasa-user");
        setAuth(null);
        navigate("/login", { replace: true });
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    auth ? (
                        <Navigate to="/menu" replace />
                    ) : (
                        <Login onAuthenticated={handleAuthenticated} />
                    )
                }
            />
            <Route
                path="/menu"
                element={
                    auth ? (
                        <Store user={auth.user} onLogout={handleLogout} />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/cart"
                element={
                    auth ? (
                        <Cart user={auth.user} onLogout={handleLogout} />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
            <Route
                path="/admin/products"
                element={
                    !auth ? (
                        <Navigate to="/login" replace />
                    ) : auth.user.role === "admin" ? (
                        <AdminProducts
                            user={auth.user}
                            onLogout={handleLogout}
                        />
                    ) : (
                        <Navigate to="/menu" replace />
                    )
                }
            />
            <Route
                path="/"
                element={<Navigate to={auth ? "/menu" : "/login"} replace />}
            />
            <Route
                path="*"
                element={<Navigate to={auth ? "/menu" : "/login"} replace />}
            />
        </Routes>
    );
}
