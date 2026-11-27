'use client'
import { alunoService } from '@/services/aluno-service'
import { disciplinaService } from '@/services/disciplina-service'
import { matriculaService } from '@/services/matricula-service'
import { turmaService } from '@/services/turma-service'
import { Aluno, Disciplina, TurmaComRelacoes } from '@/types/escola'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Column } from 'primereact/column'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function DetalhesTurma({ params }: { params: { id: string } }) {
    const id = Number(params.id)
    const [turma, setTurma] = useState<TurmaComRelacoes | null>(null)
    const [disciplina, setDisciplina] = useState<Disciplina | null>(null)
    const [todosAlunos, setTodosAlunos] = useState<Aluno[]>([])
    const [alunoSelecionado, setAlunoSelecionado] = useState<number | null>(null)
    const [carregando, setCarregando] = useState(false)
    const [matriculando, setMatriculando] = useState(false)
    const notificacao = useRef<Toast>(null)
    const router = useRouter()

    const buscarTurma = useCallback(async () => {
        setCarregando(true)
        try {
            const turmaApi = await turmaService.buscarPorId(id)
            setTurma(turmaApi)

            // A turma só traz o id da disciplina, então buscamos a disciplina para mostrar o nome
            const disciplinaApi = await disciplinaService.buscarPorId(turmaApi.disciplina_id)
            setDisciplina(disciplinaApi)

            // Busca todos os alunos para mostrar as opções de matrícula
            const alunosApi = await alunoService.listar()
            setTodosAlunos(alunosApi)
        } catch {
            notificacao.current?.show({
                summary: 'Erro ao carregar os dados!',
                severity: 'warn',
                detail: 'Não foi possível carregar os dados da turma.'
            })
        } finally {
            setCarregando(false)
        }
    }, [id])

    useEffect(() => {
        buscarTurma()
    }, [buscarTurma])

    // Só mostra no campo de seleção os alunos que ainda não estão na turma
    const alunosDisponiveis = todosAlunos.filter((aluno) => {
        const jaMatriculado = turma?.alunos.some((alunoDaTurma) => alunoDaTurma.id === aluno.id)
        return !jaMatriculado
    })

    async function matricularAluno() {
        if (!alunoSelecionado) {
            notificacao.current?.show({
                summary: 'Selecione um aluno.',
                severity: 'warn',
                detail: 'Escolha o aluno que será matriculado na turma.'
            })
            return
        }

        setMatriculando(true)
        try {
            await matriculaService.criar({
                turma_id: id,
                aluno_id: alunoSelecionado
            })
            notificacao.current?.show({
                summary: 'Aluno matriculado com sucesso!',
                severity: 'success',
                detail: 'O aluno foi adicionado à turma.'
            })
            setAlunoSelecionado(null)

            // Busca a turma de novo para atualizar a lista de alunos
            await buscarTurma()
        } catch (erro) {
            notificacao.current?.show({
                summary: 'Erro ao matricular o aluno.',
                severity: 'error',
                detail: String(erro)
            })
        } finally {
            setMatriculando(false)
        }
    }

    const confirmarRemocao = async (alunoId: number) => {
        try {
            await matriculaService.deletar({
                turma_id: id,
                aluno_id: alunoId
            })
            notificacao.current?.show({
                summary: 'Aluno removido com sucesso!',
                severity: 'success',
                detail: 'O aluno foi retirado da turma.'
            })

            await buscarTurma()
        } catch (erro) {
            notificacao.current?.show({
                summary: 'Erro ao remover o aluno.',
                severity: 'error',
                detail: String(erro)
            })
        }
    }

    function removerAluno(aluno: any) {
        confirmDialog({
            header: 'Tem certeza que deseja remover esse aluno da turma?',
            message: `O aluno ${aluno.nome} deixará de fazer parte da turma ${turma?.nome}.`,
            icon: 'pi pi-exclamation-triangle',
            rejectLabel: 'Cancelar',
            acceptLabel: 'Remover',
            rejectIcon: 'pi pi-times',
            acceptIcon: 'pi pi-check-circle',
            rejectClassName: 'p-button-danger p-button-text',
            accept: () => confirmarRemocao(aluno.id)
        })
    }

    return (
        <div>
            <ConfirmDialog />
            <Toast ref={notificacao} />
            <section className="flex justify-content-between align-items-center">
                <h3 className="m-0">Turma {turma?.nome}</h3>
                <div className="flex gap-2">
                    <Button icon="pi pi-arrow-left" label="Voltar" severity="secondary" outlined onClick={() => router.push('/turmas')} />
                    <Button icon="pi pi-pencil" label="Editar" outlined onClick={() => router.push(`/turmas/${id}/editar`)} />
                </div>
            </section>

            <div className="grid my-3">
                <div className="col-12 md:col-4">
                    <Card title="Disciplina" className="h-full">
                        <p className="m-0 font-semibold">{disciplina?.nome ?? '-'}</p>
                        <p className="m-0 text-color-secondary">Código: {disciplina?.codigo ?? '-'}</p>
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card title="Professor" className="h-full">
                        <p className="m-0 font-semibold">{turma?.professor.nome ?? '-'}</p>
                        <p className="m-0 text-color-secondary">{turma?.professor.email ?? '-'}</p>
                    </Card>
                </div>
                <div className="col-12 md:col-4">
                    <Card title="Alunos" className="h-full">
                        <p className="m-0 font-semibold">{turma ? turma.alunos.length : '-'}</p>
                        <p className="m-0 text-color-secondary">matriculados</p>
                    </Card>
                </div>
            </div>

            <h4>Alunos da turma</h4>
            <div className="flex gap-2 mb-3">
                <Dropdown
                    value={alunoSelecionado}
                    onChange={(evento) => setAlunoSelecionado(evento.value)}
                    options={alunosDisponiveis}
                    optionLabel="nome"
                    optionValue="id"
                    placeholder="Selecione um aluno para matricular"
                    emptyMessage="Todos os alunos já estão na turma"
                    filter
                    className="flex-1"
                />
                <Button icon="pi pi-user-plus" label="Matricular" severity="success" loading={matriculando} onClick={matricularAluno} />
            </div>
            <DataTable emptyMessage="Nenhum aluno matriculado nesta turma" value={turma?.alunos} loading={carregando} size="small">
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
                            <Button
                                icon="pi pi-user-minus"
                                rounded
                                label="Remover"
                                size="small"
                                text
                                severity="danger"
                                title="Remover aluno da turma"
                                onClick={() => removerAluno(aluno)}
                            />
                        )
                    }}
                ></Column>
            </DataTable>
        </div>
    )
}
