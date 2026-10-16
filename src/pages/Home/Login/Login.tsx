import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logoEvent from "../../assets/logo-event.svg";
import { Botao } from "../../../Components/botao/Botao";
import { useAuth } from "../../../context/auth";

import "./Login.css";

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

    return (
        <main>
            <img src={logoEvent} alt="EventPlus logo" />

            <div>
                <label htmlFor="email">email</label>
                <input 
                    type="email" 
                    name="email" 
                    placeholder="digite seu email..." 
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </div>

            <div>
                <label htmlFor="senha">senha</label>
                <input 
                    type="password" 
                    name="senha" 
                    placeholder="digite sua senha..." 
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                />
            </div>

            <Botao texto={enviando ? "Entrando..." : "Entrar"} type="submit" disabled={enviando} />
        </main>
    );
}

export default Login;