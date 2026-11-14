import { useState, type FormEvent } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { api, type User } from "../../lib/api";

interface LoginProps {
    onAuthenticated: (user: User, token: string) => void;
}

export default function Login({ onAuthenticated }: LoginProps) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setIsPending(true);
        const form = new FormData(event.currentTarget);
        try {
            const response = isRegistering
                ? await api.register({
                      name: String(form.get("name")),
                      email: String(form.get("email")),
                      password: String(form.get("password")),
                      password_confirmation: String(
                          form.get("password_confirmation"),
                      ),
                  })
                : await api.login({
                      email: String(form.get("email")),
                      password: String(form.get("password")),
                  });
            onAuthenticated(response.user, response.token);
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Tidak dapat masuk. Coba lagi.",
            );
        } finally {
            setIsPending(false);
        }
    }

    return (
        <main className="auth-screen">
            <section className="auth-card" aria-labelledby="auth-title">
                <a className="brand brand-centered" href="/" aria-label="Rasa">
                    <span className="brand-mark">R</span>
                    <span>
                        rasa<span className="brand-dot">.</span>
                    </span>
                </a>
                <p className="eyebrow centered">TOKO MAKANAN PILIHAN</p>
                <h1 id="auth-title">
                    {isRegistering
                        ? "Buat akun baru"
                        : "Selamat datang kembali"}
                </h1>
                <p className="muted centered auth-copy">
                    {isRegistering
                        ? "Daftar untuk mulai memilih menu favorit."
                        : "Masuk untuk melihat menu dan mengelola keranjang Anda."}
                </p>
                {error && (
                    <div className="alert alert-error" role="alert">
                        {error}
                    </div>
                )}
                <form className="form-stack" onSubmit={handleSubmit}>
                    {isRegistering && (
                        <label>
                            Nama lengkap
                            <input
                                name="name"
                                autoComplete="name"
                                required
                                placeholder="Nama Anda"
                            />
                        </label>
                    )}
                    <label>
                        Email
                        <input
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="nama@email.com"
                        />
                    </label>
                    <label>
                        Password
                        <input
                            name="password"
                            type="password"
                            autoComplete={
                                isRegistering
                                    ? "new-password"
                                    : "current-password"
                            }
                            minLength={8}
                            required
                            placeholder="Minimal 8 karakter"
                        />
                    </label>
                    {isRegistering && (
                        <label>
                            Konfirmasi password
                            <input
                                name="password_confirmation"
                                type="password"
                                autoComplete="new-password"
                                minLength={8}
                                required
                                placeholder="Ulangi password"
                            />
                        </label>
                    )}
                    <button
                        className="button button-primary button-wide"
                        type="submit"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <LoaderCircle size={18} className="spin" />
                        ) : (
                            <>
                                {isRegistering ? "Daftar" : "Masuk"}{" "}
                                <ArrowRight size={17} />
                            </>
                        )}
                    </button>
                </form>
                <p className="switch-auth">
                    {isRegistering ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
                    <button
                        className="text-button"
                        type="button"
                        onClick={() => {
                            setIsRegistering((value) => !value);
                            setError("");
                        }}
                    >
                        {isRegistering ? "Masuk" : "Daftar"}
                    </button>
                </p>
                <p className="auth-foot">
                    Akun baru terdaftar sebagai pelanggan. Hak admin diatur dari
                    backend.
                </p>
            </section>
        </main>
    );
}
