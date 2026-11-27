'use client'
import { disciplinaService } from '@/services/disciplina-service'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'

export default function EditarDisciplina({ params }: { params: { id: string } }) {
    const id = Number(params.id)
    const [codigo, setCodigo] = useState('')
    const [nome, setNome] = useState('')
    const [buscando, setBuscando] = useState(false)
    const [carregando, setCarregando] = useState(false)
    const notificacao = useRef<Toast>(null)
    const router = useRouter()

    const buscarDisciplina = useCallback(async () => {
        setBuscando(true)
        try {
            const disciplina = await disciplinaService.buscarPorId(id)
            setCodigo(disciplina.codigo)
            setNome(disciplina.nome)
        } catch {
            notificacao.current?.show({
                summary: 'Erro ao carregar os dados!',
                severity: 'warn',
                detail: 'Não foi possível carregar os dados da disciplina.'
            })
        } finally {
            setBuscando(false)
        }
    }, [id])

    useEffect(() => {
        buscarDisciplina()
    }, [buscarDisciplina])

    async function salvarDisciplina(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault()
        setCarregando(true)
        try {
            await disciplinaService.editar(id, {
                codigo,
                nome
            })
            notificacao.current?.show({
                summary: 'Disciplina atualizada com sucesso!',
                severity: 'success',
                detail: 'Os dados da disciplina foram salvos.'
            })

            router.push('/disciplinas')
        } catch (erro) {
            notificacao.current?.show({
                summary: 'Erro ao atualizar a disciplina.',
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
            <h3>Editar disciplina</h3>
            <form onSubmit={salvarDisciplina} className="flex flex-column gap-2">
                <div className="flex flex-column gap-1">
                    <label htmlFor="codigo" className="font-semibold">
                        Código
                    </label>
                    <InputText
                        value={codigo}
                        onChange={(evento) => setCodigo(evento.target.value)}
                        id="codigo"
                        placeholder="Digite o código da disciplina"
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
                        placeholder="Digite o nome da disciplina"
                        maxLength={100}
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
                        onClick={() => router.push('/disciplinas')}
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
