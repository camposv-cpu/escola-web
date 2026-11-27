'use client'
import { disciplinaService } from '@/services/disciplina-service'
import { turmaService } from '@/services/turma-service'
import { Disciplina, TurmaComRelacoes } from '@/types/escola'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { DataTable } from 'primereact/datatable'
import { Toast } from 'primereact/toast'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function Turmas() {
    const [turmas, setTurmas] = useState<TurmaComRelacoes[]>([])
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
    const router = useRouter()
    const [carregando, setCarregando] = useState(false)
    const notificacao = useRef<Toast>(null)

    const buscarTurmas = useCallback(async () => {
        setCarregando(true)
        try {
            const turmasApi = await turmaService.listar()
            setTurmas(turmasApi)

            // A lista de turmas não traz o nome da disciplina, então buscamos as disciplinas também
            const disciplinasApi = await disciplinaService.listar()
            setDisciplinas(disciplinasApi)
        } catch {
            notificacao.current?.show({
                summary: 'Erro ao carregar os dados!',
                severity: 'warn',
                detail: 'Não foi possível carregar os dados das turmas.'
            })
        } finally {
            setCarregando(false)
        }
    }, [])

    const confirmarDelecao = async (id: number) => {
        try {
            await turmaService.deletar(id)

            notificacao.current?.show({
                summary: 'Turma deletada com sucesso!',
                severity: 'success',
                detail: 'A turma foi deletada da base de dados.'
            })

            setTurmas((antigas) => antigas.filter((t) => t.id !== id))
        } catch (erro) {
            notificacao.current?.show({
                summary: 'Erro ao deletar a turma.',
                severity: 'error',
                detail: String(erro)
            })
        }
    }

    useEffect(() => {
        buscarTurmas()
    }, [buscarTurmas])

    async function deletarTurma(turma: any) {
        confirmDialog({
            header: 'Tem certeza que deseja apagar essa turma?',
            message: `Ao excluir a turma ${turma.nome}, não será possível recuperar os dados.`,
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancelar',
            acceptLabel: 'Deletar',
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check-circle',
            rejectClassName: 'p-button-danger p-button-text',
            accept: () => confirmarDelecao(turma.id)
        })
    }

    function nomeDaDisciplina(disciplinaId: number) {
        const disciplina = disciplinas.find((d) => d.id === disciplinaId)
        return disciplina ? disciplina.nome : '-'
    }

    return (
        <div>
            <ConfirmDialog />
            <Toast ref={notificacao} />
            <section className="flex justify-content-end">
                <Button icon="pi pi-plus" outlined label="Cadastrar turma" onClick={() => router.push('/turmas/cadastrar')}></Button>
            </section>
            <DataTable
                emptyMessage="Nenhuma turma encontrada"
                value={turmas}
                loading={carregando}
                size="small"
                rowHover
                rowClassName={() => 'cursor-pointer'}
                onRowClick={(evento) => router.push(`/turmas/${evento.data.id}`)}
            >
                <Column header="Nome" field="nome"></Column>
                <Column header="Disciplina" body={(turma) => nomeDaDisciplina(turma.disciplina_id)}></Column>
                <Column header="Professor" body={(turma) => turma.professor.nome}></Column>
                <Column header="Qtd. de alunos" body={(turma) => turma.alunos.length}></Column>
                <Column
                    header="Opções"
                    className="max-w-10rem"
                    body={(turma) => {
                        return (
                            <div>
                                <Button
                                    icon="pi pi-pencil"
                                    label="Editar"
                                    rounded
                                    size="small"
                                    text
                                    severity="info"
                                    title="Editar turma"
                                    onClick={(evento) => {
                                        // Impede que o clique no botão também abra os detalhes da turma
                                        evento.stopPropagation()
                                        router.push(`/turmas/${turma.id}/editar`)
                                    }}
                                />
                                <Button
                                    icon="pi pi-trash"
                                    rounded
                                    label="Deletar"
                                    size="small"
                                    text
                                    severity="danger"
                                    title="Deletar turma"
                                    onClick={(evento) => {
                                        evento.stopPropagation()
                                        deletarTurma(turma)
                                    }}
                                />
                            </div>
                        )
                    }}
                ></Column>
            </DataTable>
        </div>
    )
}
