'use client'
import { alunoService } from '@/services/aluno-service'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Nullable } from 'primereact/ts-helpers'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'

export default function EditarAluno({ params }: { params: { id: string } }) {
    const id = Number(params.id)
    const [matricula, setMatricula] = useState('')
    const [nome, setNome] = useState('')
    const [nascimento, setNascimento] = useState<Nullable<Date>>(null)
    const [email, setEmail] = useState('')
    const [buscando, setBuscando] = useState(false)
    const [carregando, setCarregando] = useState(false)
    const notificacao = useRef<Toast>(null)
    const router = useRouter()

    const buscarAluno = useCallback(async () => {
        setBuscando(true)
        try {
            const aluno = await alunoService.buscarPorId(id)
            setMatricula(aluno.matricula)
            setNome(aluno.nome)
            // A API devolve a data como texto, ex.: 2003-05-10T00:00:00.000Z
            // Usamos só a parte da data para o calendário não mostrar o dia anterior por causa do fuso horário.
            setNascimento(new Date(aluno.nascimento.slice(0, 10) + 'T00:00:00'))
            setEmail(aluno.email)
        } catch {
            notificacao.current?.show({
                summary: 'Erro ao carregar os dados!',
                severity: 'warn',
                detail: 'Não foi possível carregar os dados do aluno.'
            })
        } finally {
            setBuscando(false)
        }
    }, [id])

    useEffect(() => {
        buscarAluno()
    }, [buscarAluno])

    async function salvarAluno(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault()

        if (!nascimento) {
            notificacao.current?.show({
                summary: 'Data de nascimento obrigatória.',
                severity: 'warn',
                detail: 'Informe a data de nascimento do aluno.'
            })
            return
        }

        setCarregando(true)
        try {
            await alunoService.editar(id, {
                matricula,
                nome,
                nascimento,
                email
            })
            notificacao.current?.show({
                summary: 'Aluno atualizado com sucesso!',
                severity: 'success',
                detail: 'Os dados do aluno foram salvos.'
            })

            router.push('/alunos')
        } catch (erro) {
            notificacao.current?.show({
                summary: 'Erro ao atualizar o aluno.',
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
            <h3>Editar aluno</h3>
            <form onSubmit={salvarAluno} className="flex flex-column gap-2">
                <div className="flex flex-column gap-1">
                    <label htmlFor="matricula" className="font-semibold">
                        Matricula
                    </label>
                    <InputText
                        value={matricula}
                        onChange={(evento) => setMatricula(evento.target.value)}
                        id="matricula"
                        placeholder="Digite a matricula do aluno"
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
                        placeholder="Digite o nome do aluno"
                        maxLength={100}
                    />
                </div>
                <div className="flex flex-column gap-1">
                    <label htmlFor="nascimento" className="font-semibold">
                        Data de nascimento
                    </label>
                    <Calendar
                        value={nascimento}
                        onChange={(evento) => setNascimento(evento.value)}
                        id="nascimento"
                        mask="99/99/9999"
                        maxDate={new Date()}
                        dateFormat="dd/mm/yy"
                        placeholder="Digite a data de nascimento do aluno"
                    />
                </div>
                <div className="flex flex-column gap-1">
                    <label htmlFor="email" className="font-semibold">
                        E-mail
                    </label>
                    <InputText
                        value={email}
                        onChange={(evento) => setEmail(evento.target.value)}
                        id="email"
                        placeholder="Digite o e-mail do aluno"
                        type="email"
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
                        onClick={() => router.push('/alunos')}
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
