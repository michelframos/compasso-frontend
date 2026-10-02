import { useState } from 'react';

import api from '@/shared/lib/axios';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';



export const useMatriculaTransfer = (onSuccess?: () => void) => {

  const [isLoading, setIsLoading] = useState(false);



  const transferirAluno = async (matriculaId: number, novaTurmaId: number, motivo: string) => {

    try {

      setIsLoading(true);

      

      // No backend, a transferência é um PUT no endpoint da matrícula

      // enviando o novo id_turma e o motivo_transferencia (que o model captura no boot)

      await api.put(`/matriculas/${matriculaId}`, {

        id_turma: String(novaTurmaId),

        motivo_transferencia: motivo,

      });



      toast.success('Aluno transferido com sucesso!');

      if (onSuccess) onSuccess();

    } catch (err: unknown) {

      toast.error(getErrorMessage(err, 'Erro ao transferir aluno'));

      console.error('Error transferring matricula:', err);

      throw err;

    } finally {

      setIsLoading(false);

    }

  };



  return {

    transferirAluno,

    isLoading,

  };

};
