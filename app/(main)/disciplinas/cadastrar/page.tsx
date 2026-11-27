'use client'
import { disciplinaService } from '@/services/disciplina-service'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { FormEvent, useRef, useState } from 'react'

export default function CadastrarDisciplina() {
    const [codigo, setCodigo] = useState('')
    const [nome, setNome] = useState('')
    const [carregando, setCarregando] = useState(false)
    const notificacao = useRef<Toast>(null)
    const router = useRouter()

    async function salvarDisciplina(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault()
        setCarregando(true)
        try {
            await disciplinaService.criar({
                codigo,
                nome
            })
            notificacao.current?.show({
                summary: 'Disciplina cadastrada com sucesso!',
                severity: 'success',
                detail: 'A disciplina foi salva na base de dados.'
            })
            setCodigo('')
            setNome('')

            router.push('/disciplinas')
        } catch (erro) {
            notificacao.current?.show({
                summary: 'Erro ao cadastrar a disciplina.',
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
            <h3>Cadastrar nova disciplina</h3>
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
                    <Button disabled={carregando} label="Limpar" type="reset" severity="warning" icon="pi pi-eraser" />
                    <Button loading={carregando} label="Cadastrar" type="submit" severity="success" icon="pi pi-check-circle" />
                </div>
            </form>
        </div>
    )
}
