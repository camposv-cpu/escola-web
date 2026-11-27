'use client'
import { professorService } from '@/services/professor-service'
import { useRouter } from 'next/navigation'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Nullable } from 'primereact/ts-helpers'
import { FormEvent, useRef, useState } from 'react'

export default function CadastrarProfessor() {
    const [matricula, setMatricula] = useState('')
    const [nome, setNome] = useState('')
    const [nascimento, setNascimento] = useState<Nullable<Date>>(null)
    const [email, setEmail] = useState('')
    const [carregando, setCarregando] = useState(false)
    const notificacao = useRef<Toast>(null)
    const router = useRouter()

    async function salvarProfessor(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault()

        if (!nascimento) {
            notificacao.current?.show({
                summary: 'Data de nascimento obrigatória.',
                severity: 'warn',
                detail: 'Informe a data de nascimento do professor.'
            })
            return
        }

        setCarregando(true)
        try {
            await professorService.criar({
                matricula,
                nome,
                nascimento,
                email
            })
            notificacao.current?.show({
                summary: 'Professor cadastrado com sucesso!',
                severity: 'success',
                detail: 'O professor foi salvo na base de dados.'
            })
            setMatricula('')
            setNome('')
            setNascimento(null)
            setEmail('')

            router.push('/professores')
        } catch (erro) {
            notificacao.current?.show({
                summary: 'Erro ao cadastrar o professor.',
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
            <h3>Cadastrar novo professor</h3>
            <form onSubmit={salvarProfessor} className="flex flex-column gap-2">
                <div className="flex flex-column gap-1">
                    <label htmlFor="matricula" className="font-semibold">
                        Matricula
                    </label>
                    <InputText
                        value={matricula}
                        onChange={(evento) => setMatricula(evento.target.value)}
                        id="matricula"
                        placeholder="Digite a matricula do professor"
                        maxLength={10}
                    />
                </div>
                <div className="flex flex-column  gap-1">
                    <label htmlFor="nome" className="font-semibold">
                        Nome
                    </label>
                    <InputText
                        value={nome}
                        onChange={(evento) => setNome(evento.target.value)}
                        id="nome"
                        placeholder="Digite o nome do professor"
                        maxLength={100}
                    />
                </div>
                <div className="flex flex-column  gap-1">
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
                        placeholder="Digite a data de nascimento do professor"
                    />
                </div>
                <div className="flex flex-column  gap-1">
                    <label htmlFor="email" className="font-semibold">
                        E-mail
                    </label>
                    <InputText
                        value={email}
                        onChange={(evento) => setEmail(evento.target.value)}
                        id="email"
                        placeholder="Digite o e-mail do professor"
                        type="email"
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
