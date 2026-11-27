'use client'
import { cursoService } from '@/services/curso-service'
import { disciplinaService } from '@/services/disciplina-service'
import { Disciplina } from '@/types/escola'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { MultiSelect } from 'primereact/multiselect'
import { Toast } from 'primereact/toast'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'

export default function EditarCurso({ params }: { params: { id: string } }) {
    const id = Number(params.id)
    const [codigo, setCodigo] = useState('')
    const [nome, setNome] = useState('')
    const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<number[]>([])
    // Guarda as disciplinas que o curso já tinha, para saber o que mudou ao salvar
    const [disciplinasAntigas, setDisciplinasAntigas] = useState<number[]>([])
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
    const [buscando, setBuscando] = useState(false)
    const [carregando, setCarregando] = useState(false)
    const notificacao = useRef<Toast>(null)
    const router = useRouter()

    const buscarCurso = useCallback(async () => {
        setBuscando(true)
        try {
            const disciplinasApi = await disciplinaService.listar()
            setDisciplinas(disciplinasApi)

            const curso = await cursoService.buscarPorId(id)
            setCodigo(curso.codigo)
            setNome(curso.nome)

            const idsDasDisciplinas = curso.disciplinas.map((disciplina) => disciplina.id)
            setDisciplinasSelecionadas(idsDasDisciplinas)
            setDisciplinasAntigas(idsDasDisciplinas)
        } catch {
            notificacao.current?.show({
                summary: 'Erro ao carregar os dados!',
                severity: 'warn',
                detail: 'Não foi possível carregar os dados do curso.'
            })
        } finally {
            setBuscando(false)
        }
    }, [id])

    useEffect(() => {
        buscarCurso()
    }, [buscarCurso])

    async function salvarCurso(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault()
        setCarregando(true)
        try {
            await cursoService.editar(id, {
                codigo,
                nome
            })

            // Vincula as disciplinas que foram marcadas agora
            for (const disciplinaId of disciplinasSelecionadas) {
                if (!disciplinasAntigas.includes(disciplinaId)) {
                    await cursoService.adicionarDisciplina(id, disciplinaId)
                }
            }

            // Remove as disciplinas que foram desmarcadas
            for (const disciplinaId of disciplinasAntigas) {
                if (!disciplinasSelecionadas.includes(disciplinaId)) {
                    await cursoService.removerDisciplina(id, disciplinaId)
                }
            }

            notificacao.current?.show({
                summary: 'Curso atualizado com sucesso!',
                severity: 'success',
                detail: 'Os dados do curso foram salvos.'
            })

            router.push('/cursos')
        } catch (erro) {
            notificacao.current?.show({
                summary: 'Erro ao atualizar o curso.',
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
            <h3>Editar curso</h3>
            <form onSubmit={salvarCurso} className="flex flex-column gap-2">
                <div className="flex flex-column gap-1">
                    <label htmlFor="codigo" className="font-semibold">
                        Código
                    </label>
                    <InputText
                        value={codigo}
                        onChange={(evento) => setCodigo(evento.target.value)}
                        id="codigo"
                        placeholder="Digite o código do curso"
                        maxLength={10}
                    />
                </div>
                <div className="flex flex-column gap-1">
                    <label htmlFor="nome" className="font-semibold">
                        Nome
                    </label>
                    <InputText
                        value={nome}
                        onChange={(evento) => setNome(evento.target.value)}
                        id="nome"
                        placeholder="Digite o nome do curso"
                        maxLength={100}
                    />
                </div>
                <div className="flex flex-column gap-1">
                    <label htmlFor="disciplinas" className="font-semibold">
                        Disciplinas
                    </label>
                    <MultiSelect
                        value={disciplinasSelecionadas}
                        onChange={(evento) => setDisciplinasSelecionadas(evento.value)}
                        options={disciplinas}
                        optionLabel="nome"
                        optionValue="id"
                        id="disciplinas"
                        placeholder="Selecione as disciplinas do curso"
                        display="chip"
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
                        onClick={() => router.push('/cursos')}
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
