import { API_URL } from '@/lib/api/config';

export class ApiError extends Error {
  readonly status?: number;
  readonly graphqlErrors?: { message: string }[];

  constructor(message: string, options?: { status?: number; graphqlErrors?: { message: string }[] }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.graphqlErrors = options?.graphqlErrors;
  }
}

type GraphQLError = {
  message: string;
  extensions?: {
    code?: string;
    originalError?: {
      message?: string | string[];
      statusCode?: number;
    };
  };
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

function resolveGraphQLErrorMessage(error?: GraphQLError): string {
  const original = error?.extensions?.originalError?.message;

  if (Array.isArray(original) && original.length > 0) {
    return original.join(' ');
  }

  if (typeof original === 'string' && original.trim()) {
    return original;
  }

  return error?.message ?? 'Erro na API.';
}

export async function graphqlRequest<TData, TVariables extends Record<string, unknown> = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
  token?: string | null,
): Promise<TData> {
  let response: Response;

  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new ApiError('Não foi possível conectar à API. Verifique se o servidor está rodando.');
  }

  let payload: GraphQLResponse<TData>;

  try {
    payload = (await response.json()) as GraphQLResponse<TData>;
  } catch {
    throw new ApiError('Resposta inválida da API.', { status: response.status });
  }

  if (!response.ok || payload.errors?.length) {
    const graphError = payload.errors?.[0];
    const status = graphError?.extensions?.originalError?.statusCode ?? response.status;
    throw new ApiError(resolveGraphQLErrorMessage(graphError), {
      status,
      graphqlErrors: payload.errors?.map((item) => ({ message: item.message })),
    });
  }

  if (!payload.data) {
    throw new ApiError('Resposta vazia da API.');
  }

  return payload.data;
}
