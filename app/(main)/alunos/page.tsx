'use client'
import { alunoService } from '@/services/aluno-service'
import { AlunoComRelacoes } from '@/types/escola'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { DataTable } from 'primereact/datatable'
import { Toast } from 'primereact/toast'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function Alunos() {
    const [alunos, setAlunos] = useState<AlunoComRelacoes[]>([])
    const router = useRouter()
    const [carregando, setCarregando] = useState(false)
    const [deletando, setDeletando] = useState(false)
    const notificacao = useRef<Toast>(null)

    const buscarAlunos = useCallback(async () => {
        setCarregando(true)
        try {
            const alunosApi = await alunoService.listar()
            setAlunos(alunosApi)
        } catch {
            notificacao.current?.show({
                summary: 'Erro ao carregar os dados!',
                severity: 'warn',
                detail: 'Não foi possível carregar os dados dos alunos.'
            })
        } finally {
            setCarregando(false)
        }
    }, [])

    const confirmarDelecao = async (id: number) => {
        setDeletando(true)
        try {
            await alunoService.deletar(id)

            notificacao.current?.show({
                summary: 'Aluno deletado com sucesso!',
                severity: 'success',
                detail: 'O aluno foi deletado da base de dados.'
            })

            setAlunos((antigos) => antigos.filter((a) => a.id !== id))
        } catch (erro) {
            notificacao.current?.show({
                summary: 'Erro ao deletar o aluno.',
                severity: 'error',
                detail: String(erro)
            })
        } finally {
            setDeletando(false)
        }
    }

    useEffect(() => {
        buscarAlunos()
    }, [buscarAlunos])

    async function deletarAluno(aluno: any) {
        confirmDialog({
            header: 'Tem certeza que deseja apagar esse aluno?',
            message: `Ao excluir o aluno ${aluno.nome}, não será possível recuperar os dados.`,
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancelar',
            acceptLabel: 'Deletar',
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check-circle',
            acceptClassName: `${deletando ? 'p-disabled p-button-loading p-button-loading-left' : ''}`,
            rejectClassName: `${deletando ? 'p-disabled p-button-loading p-button-loading-left' : ''} p-button-danger p-button-text`,
            accept: () => confirmarDelecao(aluno.id)
        })
    }

    return (
        <div>
            <ConfirmDialog />
            <Toast ref={notificacao} />
            <section className="flex justify-content-end">
                <Button icon="pi pi-plus" outlined label="Cadastrar aluno" onClick={() => router.push('/alunos/cadastrar')}></Button>
            </section>
            <DataTable emptyMessage="Nenhum aluno encontrado" value={alunos} loading={carregando} size="small">
                <Column header="Matricula" field="matricula"></Column>
                <Column header="Nome" field="nome"></Column>
                <Column
                    header="Data Nascimento"
                    field="nascimento"
                    body={(aluno) => new Date(aluno.nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                ></Column>
                <Column header="E-mail" field="email"></Column>
                <Column
                    header="Opções"
                    className="max-w-10rem"
                    body={(aluno) => {
                        return (
                            <div>
                                <Button
                                    icon="pi pi-pencil"
                                    label="Editar"
                                    rounded
                                    size="small"
                                    text
                                    severity="info"
                                    title="Editar aluno"
                                    onClick={() => router.push(`/alunos/${aluno.id}/editar`)}
                                />
                                <Button
                                    icon="pi pi-trash"
                                    rounded
                                    label="Deletar"
                                    size="small"
                                    text
                                    severity="danger"
                                    title="Deletar aluno"
                                    onClick={() => deletarAluno(aluno)}
                                />
                            </div>
                        )
                    }}
                ></Column>
            </DataTable>
        </div>
    )
}
