
import { Link, useParams } from "react-router-dom"
import type { Evento } from "../../../types/api";
import { eventoService } from "../../../services/eventPlusservice";

import imagemPadrao from "../../assets/banner-1.png"

import Header from "../../../Components/header/Header"
import Footer from "../../../Components/footer/Footer"

import "./DetalhesEvento.css"
import { useEffect, useState } from "react";


function DetalhesEvento() {
    const { id = "" } = useParams();

    const [evento, setEvento] = useState<Evento | null>(null);
    const [secaocomentarios, setSecaoComentarios] = useState<boolean>(false);

    useEffect(() => {
        async function carregar() {
            if (!id) return;

            const dados = await eventoService.buscar(id);

            setEvento(dados);
        }

        void carregar();
    }, [id]);

    function mostrarEvento() {
        console.log(evento)
    }

    return (
        <>
            <Header />
            <main>
                <img src={evento?.imagemUrl || imagemPadrao} alt="Banner do evento" />
                <h1>{evento?.nome}</h1>
                <p>ID recebido: {id}</p>
                <button onClick={() => setSecaoComentarios(false)}>Sobre o Evento</button>
                <button onClick={() => setSecaoComentarios(true)}>Comentários</button>
                {secaocomentarios ? <h2>Comentários</h2> : <h2>Descrição do evento</h2>}
            </main>
            <Footer />
        </>
    )
}

export default DetalhesEvento;