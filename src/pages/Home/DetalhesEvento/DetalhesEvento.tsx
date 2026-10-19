
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import type { Comentario, Evento, Presenca } from "../../../types/api";
import { comentarioService, eventoService, presencaService } from "../../../services/eventPlusservice";
import { Botao } from "../../../Components/botao/Botao";

import imagemPadrao from "../../../assets/banner-1.png";
import relogio from "../../../assets/Icons/relogio.svg";
import predio from "../../../assets/Icons/predio.svg";
import filtro from "../../../assets/Icons/filtro.svg";

import Header from "../../../Components/header/Header"
import Footer from "../../../Components/footer/Footer"

import "./DetalhesEvento.css"
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../context/auth";
import { getApiErrorMessage } from "../../../services/api";
import ModalConfirmacao from "../../../Components/modalConfirmacao/ModalConfirmacao";

export function DetalhesEvento() {
    const { id = "" } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { autenticado, usuario } = useAuth();

    const [evento, setEvento] = useState<any | null>(null);
    const [comentarios, setComentarios] = useState<any[]>([]);
    const [secaocomentarios, setSecaoComentarios] = useState(false);
    const [presenca, setPresenca] = useState<any | null>(null);
    const [presencaCarregada, setPresencaCarregada] = useState("");
    const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false);
    const [enviandoInscricao, setEnviandoInscricao] = useState(false);
    const [mensagemInscricao, setMensagemInscricao] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

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
        void carregar();
    }, [carregar]);

    useEffect(() => {
        let ativo = true;

        async function verificarPresenca() {
            if (!id || !usuario?.idUsuario) {
                setPresenca(null);
                setPresencaCarregada("");
                return;
            }

            const chave = `${usuario.idUsuario}:${id}`;
            setPresencaCarregada("");
            setPresenca(null);

            try {
                const presencas = await presencaService.listarPorUsuario(
                    usuario.idUsuario
                );

                if (!ativo) return;

                const encontrada = presencas.find(
                    (item: any) =>
                        item.idEvento === id && item.situacao === true
                );

                setPresenca(encontrada ?? null);
            } catch {
                if (ativo) {
                    setPresenca(null);
                }
            } finally {
                if (ativo) {
                    setPresencaCarregada(chave);
                }
            }
        }

        void verificarPresenca();

        return () => {
            ativo = false;
        };
    }, [id, usuario?.idUsuario]);

    const chavePresenca =
        usuario && id ? `${usuario.idUsuario}:${id}` : "";

    const checandoPresenca = Boolean(
        chavePresenca && presencaCarregada !== chavePresenca
    );



    async function inscrever() {
        if (!autenticado || !usuario) {
            navigate("/login", {
                state: { from: location.pathname }
            });
            return;
        }

        if (!evento || enviandoInscricao || checandoPresenca) return;

        setEnviandoInscricao(true);
        setMensagemInscricao("");

        try {
            const novaPresenca = await presencaService.cadastrar({
                situacao: true,
                idEvento: evento.idEvento,
                idUsuario: usuario.idUsuario
            });

            setPresenca(novaPresenca);
            setPresencaCarregada(chavePresenca);
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
                    <p>ID recebido: {id}</p>

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

                    {secaocomentarios ? (
                        <section>
                            <h2>Comentários</h2>

                            {comentarios.length > 0 ? (
                                comentarios.map((comentario) => (
                                    <article key={comentario.idComentario}>
                                        <p>
                                            {comentario.idUsuarioNavigation?.nome
                                                || "Usuário"}
                                        </p>
                                        <p>{comentario.descricao}</p>
                                    </article>
                                ))
                            ) : (
                                <p>Nenhum comentário disponível.</p>
                            )}
                        </section>
                    ) : (
                        <section>
                            <h2>Descrição do evento</h2>
                            <p>{evento?.descricao}</p>
                        </section>
                    )}
                </div>

                <div>
                    <h2>Informações principais</h2>
                    <hr />

                    <div>
                        <img src={relogio} alt="Data do evento" />
                        <span>{evento?.dataEvento}</span>
                    </div>

                    <div>
                        <img src={predio} alt="Instituição" />
                        <span>
                            {evento?.idInstituicaoNavigation?.nomeFantasia}
                        </span>
                    </div>

                    <div>
                        <img src={filtro} alt="Tipo de evento" />
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
                                    ? "Aguarde..."
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
                        onClick={() => {
                            if (presenca) {
                                setConfirmandoCancelamento(true);
                            } else {
                                void inscrever();
                            }
                        }}
                    />

                    {confirmandoCancelamento && presenca && (
                        <section>
                            <p>Deseja realmente cancelar sua inscrição?</p>
                            <button
                                type="button"
                                disabled={enviandoInscricao}
                                onClick={() => void cancelarInscricao()}
                            >
                                Confirmar cancelamento
                            </button>
                            <button
                                type="button"
                                disabled={enviandoInscricao}
                                onClick={() => setConfirmandoCancelamento(false)}
                            >
                                Voltar
                            </button>
                        </section>
                    )}

                    {mensagemInscricao && (
                        <p
                            className="detalhe-evento-mensagem"
                            role="status"
                        >
                            {mensagemInscricao}
                        </p>
                    )}
                </div>
                <ModalConfirmacao
                    show={confirmandoCancelamento}
                    titulo="Cancelar inscrição"
                    mensagem={`Deseja cancelar sua inscrição em "${evento?.nome || "este evento"}?"`}
                    textoConfirmar={enviandoInscricao ? "Cancelando..." : "Cancelar Inscrição"}
                    textoCancelar="Manter Inscrição"
                    onClose={() => {
                    if (!enviandoInscricao) setConfirmandoCancelamento(false);
                    }}
                    onConfirm={() => void cancelarInscricao()}
                />
            </main>

            <Footer />
        </>
    );
}

export default DetalhesEvento;