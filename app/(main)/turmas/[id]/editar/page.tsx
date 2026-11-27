'use client'
import { disciplinaService } from '@/services/disciplina-service'
import { professorService } from '@/services/professor-service'
import { turmaService } from '@/services/turma-service'
import { Disciplina, Professor } from '@/types/escola'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'

export default function EditarTurma({ params }: { params: { id: string } }) {
    const id = Number(params.id)
    const [nome, setNome] = useState('')
    const [disciplinaId, setDisciplinaId] = useState<number | null>(null)
    const [professorId, setProfessorId] = useState<number | null>(null)
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
    const [professores, setProfessores] = useState<Professor[]>([])
    const [buscando, setBuscando] = useState(false)
    const [carregando, setCarregando] = useState(false)
    const notificacao = useRef<Toast>(null)
    const router = useRouter()

    const buscarTurma = useCallback(async () => {
        setBuscando(true)
        try {
            // Busca as opções dos campos de seleção
            const disciplinasApi = await disciplinaService.listar()
            setDisciplinas(disciplinasApi)

            const professoresApi = await professorService.listar()
            setProfessores(professoresApi)

            // Busca os dados da turma que vamos editar
            const turma = await turmaService.buscarPorId(id)
            setNome(turma.nome)
            setDisciplinaId(turma.disciplina_id)
            setProfessorId(turma.professor_id)
        } catch {
            notificacao.current?.show({
                summary: 'Erro ao carregar os dados!',
                severity: 'warn',
                detail: 'Não foi possível carregar os dados da turma.'
            })
        } finally {
            setBuscando(false)
        }
    }, [id])

    useEffect(() => {
        buscarTurma()
    }, [buscarTurma])

    async function salvarTurma(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault()

        if (!disciplinaId || !professorId) {
            notificacao.current?.show({
                summary: 'Campos obrigatórios.',
                severity: 'warn',
                detail: 'Selecione a disciplina e o professor da turma.'
            })
            return
        }

        setCarregando(true)
        try {
            await turmaService.editar(id, {
                nome,
                disciplina_id: disciplinaId,
                professor_id: professorId
            })
            notificacao.current?.show({
                summary: 'Turma atualizada com sucesso!',
                severity: 'success',
                detail: 'Os dados da turma foram salvos.'
            })

            router.push('/turmas')
        } catch (erro) {
            notificacao.current?.show({
                summary: 'Erro ao atualizar a turma.',
                severity: 'error',
                detail: String(erro)
            })
        } finally {
            setCarregando(false)
        }
    }

    return (
        <div>
            <Toast ref={notificacao} />
            <h3>Editar turma</h3>
            <form onSubmit={salvarTurma} className="flex flex-column gap-2">
                <div className="flex flex-column gap-1">
                    <label htmlFor="nome" className="font-semibold">
                        Nome
                    </label>
                    <InputText
                        value={nome}
                        onChange={(evento) => setNome(evento.target.value)}
                        id="nome"
                        placeholder="Digite o nome da turma"
                        maxLength={100}
                    />
                </div>
                <div className="flex flex-column gap-1">
                    <label htmlFor="disciplina" className="font-semibold">
                        Disciplina
                    </label>
                    <Dropdown
                        value={disciplinaId}
                        onChange={(evento) => setDisciplinaId(evento.value)}
                        options={disciplinas}
                        optionLabel="nome"
                        optionValue="id"
                        id="disciplina"
                        placeholder="Selecione a disciplina da turma"
                    />
                </div>
                <div className="flex flex-column gap-1">
                    <label htmlFor="professor" className="font-semibold">
                        Professor
                    </label>
                    <Dropdown
                        value={professorId}
                        onChange={(evento) => setProfessorId(evento.value)}
                        options={professores}
                        optionLabel="nome"
                        optionValue="id"
                        id="professor"
                        placeholder="Selecione o professor da turma"
                    />
                </div>
                <div className="flex justify-content-end my-2 gap-2">
                    <Button
                        disabled={carregando}
                        label="Cancelar"
                        type="button"
                        severity="secondary"
                        outlined
                        icon="pi pi-times"
                        onClick={() => router.push('/turmas')}
                    />
                    <Button
                        loading={carregando}
                        disabled={buscando}
                        label="Salvar"
                        type="submit"
                        severity="success"
                        icon="pi pi-check-circle"
                    />
                </div>
            </form>
        </div>
    )
}
