'use client'
import { cursoService } from '@/services/curso-service'
import { CursoComDisciplinas } from '@/types/escola'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { DataTable } from 'primereact/datatable'
import { Toast } from 'primereact/toast'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function Cursos() {
    const [cursos, setCursos] = useState<CursoComDisciplinas[]>([])
    const router = useRouter()
    const [carregando, setCarregando] = useState(false)
    const notificacao = useRef<Toast>(null)

    const buscarCursos = useCallback(async () => {
        setCarregando(true)
        try {
            const cursosApi = await cursoService.listar()
            setCursos(cursosApi)
        } catch {
            notificacao.current?.show({
                summary: 'Erro ao carregar os dados!',
                severity: 'warn',
                detail: 'Não foi possível carregar os dados dos cursos.'
            })
        } finally {
            setCarregando(false)
        }
    }, [])

    const confirmarDelecao = async (id: number) => {
        try {
            await cursoService.deletar(id)

            notificacao.current?.show({
                summary: 'Curso deletado com sucesso!',
                severity: 'success',
                detail: 'O curso foi deletado da base de dados.'
            })

            setCursos((antigos) => antigos.filter((c) => c.id !== id))
        } catch (erro) {
            notificacao.current?.show({
                summary: 'Erro ao deletar o curso.',
                severity: 'error',
                detail: String(erro)
            })
        }
    }

    useEffect(() => {
        buscarCursos()
    }, [buscarCursos])

    async function deletarCurso(curso: any) {
        confirmDialog({
            header: 'Tem certeza que deseja apagar esse curso?',
            message: `Ao excluir o curso ${curso.nome}, não será possível recuperar os dados.`,
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancelar',
            acceptLabel: 'Deletar',
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check-circle',
            rejectClassName: 'p-button-danger p-button-text',
            accept: () => confirmarDelecao(curso.id)
        })
    }

    return (
        <div>
            <ConfirmDialog />
            <Toast ref={notificacao} />
            <section className="flex justify-content-end">
                <Button icon="pi pi-plus" outlined label="Cadastrar curso" onClick={() => router.push('/cursos/cadastrar')}></Button>
            </section>
            <DataTable emptyMessage="Nenhum curso encontrado" value={cursos} loading={carregando} size="small">
                <Column header="Código" field="codigo"></Column>
                <Column header="Nome" field="nome"></Column>
                <Column
                    header="Disciplinas"
                    body={(curso) => curso.disciplinas.map((disciplina: any) => disciplina.nome).join(', ')}
                ></Column>
                <Column
                    header="Opções"
                    className="max-w-10rem"
                    body={(curso) => {
                        return (
                            <div>
                                <Button
                                    icon="pi pi-pencil"
                                    label="Editar"
                                    rounded
                                    size="small"
                                    text
                                    severity="info"
                                    title="Editar curso"
                                    onClick={() => router.push(`/cursos/${curso.id}/editar`)}
                                />
                                <Button
                                    icon="pi pi-trash"
                                    rounded
                                    label="Deletar"
                                    size="small"
                                    text
                                    severity="danger"
                                    title="Deletar curso"
                                    onClick={() => deletarCurso(curso)}
                                />
                            </div>
                        )
                    }}
                ></Column>
            </DataTable>
        </div>
    )
}
