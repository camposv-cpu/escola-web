'use client'
import { professorService } from '@/services/professor-service'
import { ProfessorComRelacoes } from '@/types/escola'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { DataTable } from 'primereact/datatable'
import { Toast } from 'primereact/toast'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function Professores() {
    const [professores, setProfessores] = useState<ProfessorComRelacoes[]>([])
    const router = useRouter()
    const [carregando, setCarregando] = useState(false)
    const [deletando, setDeletando] = useState(false)
    const notificacao = useRef<Toast>(null)

    const buscarProfessores = useCallback(async () => {
        setCarregando(true)
        try {
            const professoresApi = await professorService.listar()
            setProfessores(professoresApi)
        } catch {
            notificacao.current?.show({
                summary: 'Erro ao carregar os dados!',
                severity: 'warn',
                detail: 'Não foi possível carregar os dados dos professores.'
            })
        } finally {
            setCarregando(false)
        }
    }, [])

    const confirmarDelecao = async (id: number) => {
        setDeletando(true)
        try {
            await professorService.deletar(id)

            notificacao.current?.show({
                summary: 'Professor deletado com sucesso!',
                severity: 'success',
                detail: 'O professor foi deletado da base de dados.'
            })

            setProfessores((antigos) => antigos.filter((a) => a.id !== id))
        } catch (erro) {
            notificacao.current?.show({
                summary: 'Erro ao deletar o professor.',
                severity: 'error',
                detail: String(erro)
            })
        } finally {
            setDeletando(false)
        }
    }

    useEffect(() => {
        buscarProfessores()
    }, [buscarProfessores])

    async function deletarProfessor(professor: any) {
        confirmDialog({
            header: 'Tem certeza que deseja apagar esse professor?',
            message: `Ao excluir o professor ${professor.nome}, não será possível recuperar os dados.`,
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancelar',
            acceptLabel: 'Deletar',
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check-circle',
            acceptClassName: `${deletando ? 'p-disabled p-button-loading p-button-loading-left' : ''}`,
            rejectClassName: `${deletando ? 'p-disabled p-button-loading p-button-loading-left' : ''} p-button-danger p-button-text`,
            accept: () => confirmarDelecao(professor.id)
        })
    }

    return (
        <div>
            <ConfirmDialog />
            <Toast ref={notificacao} />
            <section className="flex justify-content-end">
                <Button
                    icon="pi pi-plus"
                    outlined
                    label="Cadastrar professor"
                    onClick={() => router.push('/professores/cadastrar')}
                ></Button>
            </section>
            <DataTable emptyMessage="Nenhum professor encontrado" value={professores} loading={carregando} size="small">
                <Column header="Matricula" field="matricula"></Column>
                <Column header="Nome" field="nome"></Column>
                <Column
                    header="Data Nascimento"
                    field="nascimento"
                    body={(professor) => new Date(professor.nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                ></Column>
                <Column header="E-mail" field="email"></Column>
                <Column
                    header="Opções"
                    className="max-w-10rem"
                    body={(professor) => {
                        return (
                            <div>
                                <Button
                                    icon="pi pi-pencil"
                                    label="Editar"
                                    rounded
                                    size="small"
                                    text
                                    severity="info"
                                    title="Editar professor"
                                    onClick={() => router.push(`/professores/${professor.id}/editar`)}
                                />
                                <Button
                                    icon="pi pi-trash"
                                    rounded
                                    label="Deletar"
                                    size="small"
                                    text
                                    severity="danger"
                                    title="Deletar professor"
                                    onClick={() => deletarProfessor(professor)}
                                />
                            </div>
                        )
                    }}
                ></Column>
            </DataTable>
        </div>
    )
}
