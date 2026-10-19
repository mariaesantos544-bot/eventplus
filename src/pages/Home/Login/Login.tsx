import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import logoEvent from "../../../assets/logo-event.svg";
import { Botao } from "../../../Components/botao/Botao";
import { useAuth } from "../../../context/auth";

import "./Login.css";
import Campo from "../../../Components/campo/Campo";
import { getApiErrorMessage } from "../../../services/api";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, autenticado } = useAuth();
    const [email, setEmail] = useState("danilo@gmail.com");
    const [senha, setSenha] = useState("admin1234");
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
        <main>
            <img src={logoEvent} alt="EventPlus logo" />

            <form className="login-form" onSubmit={entrar} noValidate>
                <div>
                    <label htmlFor="login-email">Email</label>
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

                <div>
                    <label htmlFor="login-senha">Senha</label>
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

                <Botao
                    texto={enviando ? "Entrando..." : "Entrar"}
                    type="submit"
                    disabled={enviando}
                />

                {erro ? (
                    <p className="login-erro" role="alert">
                        {erro}
                    </p>
                ) : null}
            </form>
        </main>
    );
}

export default Login;