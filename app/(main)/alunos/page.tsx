import { api } from "@/lib/axios";
import { alunoService } from "@/services/aluno-service";
import { AlunoComRelacoes } from "@/types/escola";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import {useState}from "react";

export default function Alunos() {

    const [alunos,setAlunos]= useState<AlunoComRelacoes[]>([])
useEffct(()=>{
  async function buscarAlunos(){
    const alunosApi =await alunoService.listar()
   setAlunos(alunosApi)
  }
   buscarAlunos()
},[])
    return (
        <DataTable emptyMessage="Nenhum aluno encontrado"
        value={alunos}>
            <Column header="Matricula" field="matricula"></Column>
            <Column header="Nome" field="nome"></Column>
            <Column header="Data Nascimento" field="nacimento"
            body={(alumo) => new Date(aluno.nacimento)
                .toLocaleDateString("pt-BR",{timeZone:"UTC"})
            }></Column>
            <Column header="E-mail" field="email"></Column>
        </DataTable>
    )
}