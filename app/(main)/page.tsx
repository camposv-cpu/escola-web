'use client'
import { alunoService } from '@/services/aluno-service'
import { cursoService } from '@/services/curso-service'
import { disciplinaService } from '@/services/disciplina-service'
import { professorService } from '@/services/professor-service'
import { turmaService } from '@/services/turma-service'
import { AlunoComRelacoes, CursoComDisciplinas, DisciplinaComCursos, ProfessorComRelacoes, TurmaComRelacoes } from '@/types/escola'
import { useRouter } from 'next/navigation'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Toast } from 'primereact/toast'
import { useCallback, useEffect, useRef, useState } from 'react'

export default function HomePage() {
    const [alunos, setAlunos] = useState<AlunoComRelacoes[]>([])
    const [professores, setProfessores] = useState<ProfessorComRelacoes[]>([])
    const [cursos, setCursos] = useState<CursoComDisciplinas[]>([])
    const [disciplinas, setDisciplinas] = useState<DisciplinaComCursos[]>([])
    const [turmas, setTurmas] = useState<TurmaComRelacoes[]>([])
    const [carregando, setCarregando] = useState(false)
    const notificacao = useRef<Toast>(null)
    const router = useRouter()

    const buscarDados = useCallback(async () => {
        setCarregando(true)
        try {
            const alunosApi = await alunoService.listar()
            setAlunos(alunosApi)

            const professoresApi = await professorService.listar()
            setProfessores(professoresApi)

            const cursosApi = await cursoService.listar()
            setCursos(cursosApi)

            const disciplinasApi = await disciplinaService.listar()
            setDisciplinas(disciplinasApi)

            const turmasApi = await turmaService.listar()
            setTurmas(turmasApi)
        } catch {
            notificacao.current?.show({
                summary: 'Erro ao carregar os dados!',
                severity: 'warn',
                detail: 'Não foi possível carregar as informações da escola.'
            })
        } finally {
            setCarregando(false)
        }
    }, [])

    useEffect(() => {
        buscarDados()
    }, [buscarDados])

    // Cada item vira um cartão com a quantidade de registros e um link para a página
    const resumo = [
        { titulo: 'Alunos', quantidade: alunos.length, icone: 'pi pi-graduation-cap', rota: '/alunos' },
        { titulo: 'Professores', quantidade: professores.length, icone: 'pi pi-id-card', rota: '/professores' },
        { titulo: 'Cursos', quantidade: cursos.length, icone: 'pi pi-book', rota: '/cursos' },
        { titulo: 'Disciplinas', quantidade: disciplinas.length, icone: 'pi pi-list', rota: '/disciplinas' },
        { titulo: 'Turmas', quantidade: turmas.length, icone: 'pi pi-users', rota: '/turmas' }
    ]

    function nomeDaDisciplina(disciplinaId: number) {
        const disciplina = disciplinas.find((d) => d.id === disciplinaId)
        return disciplina ? disciplina.nome : '-'
    }

    return (
        <div className="grid">
            <Toast ref={notificacao} />

            <div className="col-12">
                <h3 className="mb-1">Bem-vindo ao sistema da escola</h3>
                <p className="text-color-secondary">Veja abaixo um resumo dos dados cadastrados.</p>
            </div>

            {resumo.map((item) => (
                <div key={item.titulo} className="col-12 md:col-6 lg:col">
                    <div className="card mb-0 cursor-pointer" onClick={() => router.push(item.rota)}>
                        <div className="flex justify-content-between align-items-center">
                            <div>
                                <span className="block text-color-secondary font-medium mb-2">{item.titulo}</span>
                                <span className="text-900 font-semibold text-2xl">{carregando ? '...' : item.quantidade}</span>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-primary border-round"
                                style={{ width: '2.5rem', height: '2.5rem' }}
                            >
                                <i className={`${item.icone} text-xl`}></i>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div className="col-12 xl:col-7">
                <div className="card h-full">
                    <h5>Turmas</h5>
                    <DataTable
                        emptyMessage="Nenhuma turma cadastrada"
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
                    </DataTable>
                </div>
            </div>

            <div className="col-12 xl:col-5">
                <div className="card h-full">
                    <h5>Cursos</h5>
                    <DataTable emptyMessage="Nenhum curso cadastrado" value={cursos} loading={carregando} size="small">
                        <Column header="Código" field="codigo"></Column>
                        <Column header="Nome" field="nome"></Column>
                        <Column header="Qtd. de disciplinas" body={(curso) => curso.disciplinas.length}></Column>
                    </DataTable>
                </div>
            </div>
        </div>
    )
}
