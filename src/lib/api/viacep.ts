import { formatCep, onlyDigits } from '@/lib/masks';

export type ViaCepAddress = {
  cep: string;
  city: string;
  uf: string;
};

type ViaCepResponse = {
  cep?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export { formatCep, onlyDigits };

export async function lookupCep(cep: string): Promise<ViaCepAddress> {
  const digits = onlyDigits(cep);

  if (digits.length !== 8) {
    throw new Error('CEP inválido.');
  }

  let response: Response;

  try {
    response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  } catch {
    throw new Error('Não foi possível consultar o CEP.');
  }

  if (!response.ok) {
    throw new Error('Não foi possível consultar o CEP.');
  }

  const data = (await response.json()) as ViaCepResponse;

  if (data.erro || !data.localidade || !data.uf) {
    throw new Error('CEP não encontrado.');
  }

  return {
    cep: formatCep(digits),
    city: data.localidade,
    uf: data.uf.toUpperCase(),
  };
}
