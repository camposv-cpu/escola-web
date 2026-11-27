'use client'
import { disciplinaService } from '@/services/disciplina-service'
import { DisciplinaComCursos } from '@/types/escola'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { DataTable } from 'primereact/datatable'
import { Toast } from 'primereact/toast'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function Disciplinas() {
    const [disciplinas, setDisciplinas] = useState<DisciplinaComCursos[]>([])
    const router = useRouter()
    const [carregando, setCarregando] = useState(false)
    const notificacao = useRef<Toast>(null)

    const buscarDisciplinas = useCallback(async () => {
        setCarregando(true)
        try {
            const disciplinasApi = await disciplinaService.listar()
            setDisciplinas(disciplinasApi)
        } catch {
            notificacao.current?.show({
                summary: 'Erro ao carregar os dados!',
                severity: 'warn',
                detail: 'Não foi possível carregar os dados das disciplinas.'
            })
        } finally {
            setCarregando(false)
        }
    }, [])

    const confirmarDelecao = async (id: number) => {
        try {
            await disciplinaService.deletar(id)

            notificacao.current?.show({
                summary: 'Disciplina deletada com sucesso!',
                severity: 'success',
                detail: 'A disciplina foi deletada da base de dados.'
            })

            setDisciplinas((antigas) => antigas.filter((d) => d.id !== id))
        } catch (erro) {
            notificacao.current?.show({
                summary: 'Erro ao deletar a disciplina.',
                severity: 'error',
                detail: String(erro)
            })
        }
    }

    useEffect(() => {
        buscarDisciplinas()
    }, [buscarDisciplinas])

    async function deletarDisciplina(disciplina: any) {
        confirmDialog({
            header: 'Tem certeza que deseja apagar essa disciplina?',
            message: `Ao excluir a disciplina ${disciplina.nome}, não será possível recuperar os dados.`,
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancelar',
            acceptLabel: 'Deletar',
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check-circle',
            rejectClassName: 'p-button-danger p-button-text',
            accept: () => confirmarDelecao(disciplina.id)
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
                    label="Cadastrar disciplina"
                    onClick={() => router.push('/disciplinas/cadastrar')}
                ></Button>
            </section>
            <DataTable emptyMessage="Nenhuma disciplina encontrada" value={disciplinas} loading={carregando} size="small">
                <Column header="Código" field="codigo"></Column>
                <Column header="Nome" field="nome"></Column>
                <Column header="Cursos" body={(disciplina) => disciplina.cursos.map((curso: any) => curso.nome).join(', ')}></Column>
                <Column
                    header="Opções"
                    className="max-w-10rem"
                    body={(disciplina) => {
                        return (
                            <div>
                                <Button
                                    icon="pi pi-pencil"
                                    label="Editar"
                                    rounded
                                    size="small"
                                    text
                                    severity="info"
                                    title="Editar disciplina"
                                    onClick={() => router.push(`/disciplinas/${disciplina.id}/editar`)}
                                />
                                <Button
                                    icon="pi pi-trash"
                                    rounded
                                    label="Deletar"
                                    size="small"
                                    text
                                    severity="danger"
                                    title="Deletar disciplina"
                                    onClick={() => deletarDisciplina(disciplina)}
                                />
                            </div>
                        )
                    }}
                ></Column>
            </DataTable>
        </div>
    )
}
