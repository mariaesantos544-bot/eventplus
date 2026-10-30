
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import logoEvent from "../../assets/logo-event.svg";
import { Botao } from "../../Components/botao/Botao";
import { useAuth } from "../../context/auth";

import "./Login.css";
import Campo from "../../Components/campo/Campo";
import { getApiErrorMessage } from "../../services/api";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, autenticado } = useAuth();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        if (autenticado) navigate("/home", { replace: true });
    }, [autenticado, navigate]);

    async function entrar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");
        setEnviando(true);

        try {
            await login({ email: email.trim(), senha });

            const state = location.state as { from?: string } | null;
            navigate(state?.from || "/home", { replace: true });
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main className="login-page">
            <div className="login-container">

                <img
                    src={logoEvent}
                    alt="EventPlus"
                    className="login-logo"
                />

                <form
                    className="login-form"
                    onSubmit={entrar}
                    noValidate
                >
                    <div className="login-campo">
                        <label
                            className="visually-hidden"
                            htmlFor="login-email"
                        >
                            Email
                        </label>

                        <Campo
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Login"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="login-campo">
                        <label
                            className="visually-hidden"
                            htmlFor="login-senha"
                        >
                            Senha
                        </label>

                        <Campo
                            id="login-senha"
                            type="password"
                            value={senha}
                            onChange={(event) => setSenha(event.target.value)}
                            placeholder="Senha"
                            autoComplete="current-password"
                            minLength={6}
                            required
                        />
                    </div>

                    <a href="#" className="login-esqueceu"
                        onClick={(event) => event.preventDefault()}>
                        Esqueceu a senha?
                    </a>

                    {erro && (
                        <p className="login-erro" role="alert">
                            {erro}
                        </p>
                    )}

                    <div className="login-botao-container">
                        <Botao
                            texto={enviando ? "Entrando..." : "Entrar"}
                            type="submit"
                            disabled={enviando}
                        />
                    </div>

                </form>
            </div>
        </main>
    );
}

export default Login;
