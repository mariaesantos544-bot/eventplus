import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import type { Comentario, Evento, MensagemModeracao, Presenca } from "../../types/api";
import { comentarioService, eventoService, presencaService } from "../../services/eventPlusservice";
import { Botao } from "../../Components/botao/Botao";

import imagemPadrao from "../../assets/banner-1.png";
import relogio from "../../assets/Icons/relogio.svg";
import predio from "../../assets/Icons/predio.svg";
import filtro from "../../assets/Icons/filtro.svg";
import enviar from "../../assets/Icons/enviar.svg";

import Header from "../../Components/header/Header";
import Footer from "../../Components/footer/Footer";

import "./DetalhesEvento.css";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../context/auth";
import { getApiErrorMessage } from "../../services/api";
import ModalConfirmacao from "../../Components/modalConfirmacao/ModalConfirmacao";
import Campo from "../../Components/campo/Campo";

export function formatarData(value: string) {
    const data = new Date(value);

    return Number.isNaN(data.getTime())
        ? "Data não informada"
        : new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }).format(data);
}

export function formatarHora(value: string) {
    const data = new Date(value);

    return Number.isNaN(data.getTime())
        ? "Horário não informado"
        : new Intl.DateTimeFormat("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        }).format(data);
}

function DetalhesEvento() {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { autenticado, usuario } = useAuth();

    const [evento, setEvento] = useState<Evento | null>(null);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [secaoComentarios, setSecaoComentarios] = useState<boolean>(false);
    const [presenca, setPresenca] = useState<Presenca | null>(null);
    const [presencaCarregada, setPresencaCarregada] = useState("");
    const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);
    const [enviandoInscricao, setEnviandoInscricao] = useState(false);
    const [mensagemInscricao, setMensagemInscricao] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const [novoComentario, setNovoComentario] = useState("");
    const [mensagemComentario, setMensagemComentario] = useState("");
    const [enviandoComentario, setEnviandoComentario] = useState(false);

    const carregar = useCallback(async () => {
        if (!id) return;

        setCarregando(true);
        setErro("");

        try {
            const [eventoAtual, comentariosAtuais] = await Promise.all([
                eventoService.buscar(id),
                comentarioService.listarPorEvento(id)
            ]);

            setEvento(eventoAtual);
            setComentarios(comentariosAtuais);
        } catch (error) {
            setErro(getApiErrorMessage(error));
        } finally {
            setCarregando(false);
        }
    }, [id]);

    useEffect(() => {
        const timeout = window.setTimeout(() => void carregar(), 0);

        return () => window.clearTimeout(timeout);
    }, [carregar]);

    useEffect(() => {
        if (!usuario || !id) {
            setPresenca(null);
            setPresencaCarregada("");
            return;
        }

        const chave = `${usuario.idUsuario}:${id}`;
        let ativo = true;

        setPresencaCarregada("");

        presencaService
            .listarPorUsuario(usuario.idUsuario)
            .then((items) => {
                if (ativo) {
                    setPresenca(
                        items.find(
                            (item) =>
                                item.idEvento === id && item.situacao === true
                        ) ?? null
                    );
                }
            })
            .catch(() => {
                if (ativo) setPresenca(null);
            })
            .finally(() => {
                if (ativo) setPresencaCarregada(chave);
            });

        return () => {
            ativo = false;
        };
    }, [id, usuario]);

    function exigirLogin() {
        if (autenticado) return false;

        navigate("/login", {
            state: { from: location.pathname }
        });

        return true;
    }

    async function inscrever() {
        if (exigirLogin() || !usuario || !evento || presenca) return;

        setEnviandoInscricao(true);
        setMensagemInscricao("");

        try {
            const novaPresenca = await presencaService.cadastrar({
                situacao: true,
                idEvento: evento.idEvento,
                idUsuario: usuario.idUsuario
            });

            setPresenca(novaPresenca);
            setMensagemInscricao("Inscrição realizada com sucesso.");
        } catch (error) {
            setMensagemInscricao(getApiErrorMessage(error));
        } finally {
            setEnviandoInscricao(false);
        }
    }

    async function cancelarInscricao() {
        if (!presenca || enviandoInscricao) return;

        setEnviandoInscricao(true);
        setMensagemInscricao("");

        try {
            await presencaService.excluir(presenca.idPresenca);

            setPresenca(null);
            setMensagemInscricao("Inscrição cancelada com sucesso.");
        } catch (error) {
            setMensagemInscricao(getApiErrorMessage(error));
        } finally {
            setConfirmandoCancelamento(false);
            setEnviandoInscricao(false);
        }
    }

    async function comentar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (exigirLogin() || !usuario || !evento || !novoComentario.trim()) {
            return;
        }

        if (enviandoComentario) return;

        setEnviandoComentario(true);
        setMensagemComentario("");

        try {
            const response = await comentarioService.cadastrar({
                descricao: novoComentario.trim(),
                idEvento: evento.idEvento,
                idUsuario: usuario.idUsuario
            });

            if ("mensagem" in response) {
                setMensagemComentario(
                    (response as MensagemModeracao).mensagem
                );
            } else {
                setComentarios((items) => [...items, response]);
                setMensagemComentario("Comentário publicado.");
                setNovoComentario("");
            }
        } catch (error) {
            setMensagemComentario(getApiErrorMessage(error));
        } finally {
            setEnviandoComentario(false);
        }
    }

    const chavePresenca =
        usuario && id ? `${usuario.idUsuario}:${id}` : "";

    const checandoPresenca = Boolean(
        chavePresenca && presencaCarregada !== chavePresenca
    );

    return (
        <>
            <Header />

            <main>
                <img
                    src={evento?.imagemUrl || imagemPadrao}
                    alt="Banner do evento"
                />

                <h1>
                    {carregando
                        ? "Carregando evento..."
                        : evento?.nome || "Evento não encontrado"}
                </h1>

                {erro && <p role="alert">{erro}</p>}

                <div>
                    <button
                        type="button"
                        onClick={() => setSecaoComentarios(false)}
                    >
                        Sobre o Evento
                    </button>

                    <button
                        type="button"
                        onClick={() => setSecaoComentarios(true)}
                    >
                        Comentários
                    </button>

                    {secaoComentarios ? (
                        <>
                            <h2>Comentários</h2>

                            <div className="detalhe-evento-comentarios">
                                <form onSubmit={comentar}>
                                    <label
                                        className="visually-hidden"
                                        htmlFor="novo-comentario"
                                    >
                                        Comentar
                                    </label>

                                    <Campo
                                        id="novo-comentario"
                                        value={novoComentario}
                                        maxLength={200}
                                        placeholder="Escreva seu comentário..."
                                        onChange={(event) =>
                                            setNovoComentario(event.target.value)
                                        }
                                    />

                                    <button
                                        type="submit"
                                        aria-label="Enviar comentário"
                                        disabled={
                                            enviandoComentario ||
                                            !novoComentario.trim()
                                        }
                                    >
                                        <img src={enviar} alt="" />
                                    </button>
                                </form>

                                {mensagemComentario && (
                                    <p
                                        className="detalhe-evento-mensagem"
                                        role="status"
                                    >
                                        {mensagemComentario}
                                    </p>
                                )}

                                {comentarios.length > 0 ? (
                                    comentarios.map((comentario) => (
                                        <article key={comentario.idComentario}>
                                            <p>
                                                {comentario.idUsuarioNavigation?.nome ||
                                                    "Usuário"}
                                            </p>

                                            <p>{comentario.descricao}</p>
                                        </article>
                                    ))
                                ) : (
                                    <p>Nenhum comentário publicado.</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <h2>Sobre o Evento</h2>
                            <p>{evento?.descricao}</p>
                        </>
                    )}
                </div>

                <div>
                    <h2>Informações principais</h2>
                    <hr />

                    <div>
                        <img src={relogio} alt="" />
                        <span>
                            {evento?.dataEvento
                                ? `${formatarData(evento.dataEvento)} às ${formatarHora(evento.dataEvento)}`
                                : "Data não informada"}
                        </span>
                    </div>

                    <div>
                        <img src={predio} alt="" />
                        <span>
                            {evento?.idInstituicaoNavigation?.nomeFantasia}
                        </span>
                    </div>

                    <div>
                        <img src={filtro} alt="" />
                        <span>
                            {evento?.idTipoEventoNavigation?.titulo}
                        </span>
                    </div>

                    <Botao
                        className={
                            presenca ? "detalhe-evento-cancelar" : ""
                        }
                        texto={
                            checandoPresenca
                                ? "Verificando inscrição..."
                                : enviandoInscricao
                                    ? "Inscrevendo..."
                                    : presenca
                                        ? "Cancelar inscrição"
                                        : "Se inscrever"
                        }
                        type="button"
                        disabled={
                            checandoPresenca ||
                            enviandoInscricao ||
                            carregando ||
                            !evento
                        }
                        onClick={() =>
                            presenca
                                ? setConfirmandoCancelamento(true)
                                : void inscrever()
                        }
                    />

                    {mensagemInscricao ? (
                        <p
                            className="detalhe-evento-mensagem"
                            role="status"
                        >
                            {mensagemInscricao}
                        </p>
                    ) : null}
                </div>

                <ModalConfirmacao
                    show={confirmandoCancelamento}
                    titulo="Cancelar inscrição"
                    mensagem={`Deseja cancelar sua inscrição em "${evento?.nome || "este evento"}"?`}
                    textoConfirmar={
                        enviandoInscricao
                            ? "Cancelando..."
                            : "Cancelar inscrição"
                    }
                    textoCancelar="Manter inscrição"
                    onClose={() => {
                        if (!enviandoInscricao) {
                            setConfirmandoCancelamento(false);
                        }
                    }}
                    onConfirm={() => void cancelarInscricao()}
                />
            </main>

            <Footer />
        </>
    );
}

export default DetalhesEvento;