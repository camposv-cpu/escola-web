'use client'
import { cursoService } from '@/services/curso-service'
import { disciplinaService } from '@/services/disciplina-service'
import { Disciplina } from '@/types/escola'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { MultiSelect } from 'primereact/multiselect'
import { Toast } from 'primereact/toast'
import { FormEvent, useEffect, useRef, useState } from 'react'

export default function CadastrarCurso() {
    const [codigo, setCodigo] = useState('')
    const [nome, setNome] = useState('')
    const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState<number[]>([])
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
    const [carregando, setCarregando] = useState(false)
    const notificacao = useRef<Toast>(null)
    const router = useRouter()

    // Busca as disciplinas para mostrar as opções no campo de seleção
    useEffect(() => {
        async function buscarDisciplinas() {
            try {
                const disciplinasApi = await disciplinaService.listar()
                setDisciplinas(disciplinasApi)
            } catch {
                notificacao.current?.show({
                    summary: 'Erro ao carregar os dados!',
                    severity: 'warn',
                    detail: 'Não foi possível carregar as disciplinas.'
                })
            }
        }
        buscarDisciplinas()
    }, [])

    async function salvarCurso(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault()
        setCarregando(true)
        try {
            const cursoCriado = await cursoService.criar({
                codigo,
                nome
            })

            // Depois de criar o curso, vinculamos cada disciplina escolhida a ele
            for (const disciplinaId of disciplinasSelecionadas) {
                await cursoService.adicionarDisciplina(cursoCriado.id, disciplinaId)
            }

            notificacao.current?.show({
                summary: 'Curso cadastrado com sucesso!',
                severity: 'success',
                detail: 'O curso foi salvo na base de dados.'
            })
            setCodigo('')
            setNome('')
            setDisciplinasSelecionadas([])

            router.push('/cursos')
        } catch (erro) {
            notificacao.current?.show({
                summary: 'Erro ao cadastrar o curso.',
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
            <h3>Cadastrar novo curso</h3>
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
                    <Button disabled={carregando} label="Limpar" type="reset" severity="warning" icon="pi pi-eraser" />
                    <Button loading={carregando} label="Cadastrar" type="submit" severity="success" icon="pi pi-check-circle" />
                </div>
            </form>
        </div>
    )
}
