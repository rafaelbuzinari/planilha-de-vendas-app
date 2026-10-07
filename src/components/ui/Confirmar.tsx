import { Botao } from './Botao'
import { Modal } from './Modal'

interface Props {
  aberto: boolean
  titulo: string
  mensagem: string
  textoConfirmar: string
  aoConfirmar: () => void
  aoCancelar: () => void
}

/** Pergunta "Tem certeza?" antes de ações que não dá para desfazer */
export function Confirmar({ aberto, titulo, mensagem, textoConfirmar, aoConfirmar, aoCancelar }: Props) {
  return (
    <Modal
      titulo={titulo}
      aberto={aberto}
      aoFechar={aoCancelar}
      tamanho="pequeno"
      rodape={
        <>
          <Botao variante="secundaria" className="flex-1" onClick={aoCancelar}>
            Voltar
          </Botao>
          <Botao variante="perigo" className="flex-1" onClick={aoConfirmar}>
            {textoConfirmar}
          </Botao>
        </>
      }
    >
      <p className="text-suave">{mensagem}</p>
    </Modal>
  )
}
