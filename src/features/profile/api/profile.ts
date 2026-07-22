import { graphqlRequest } from '@/lib/api/graphql';

export type MeUser = {
  id: number;
  name: string;
  email: string;
  cpf: string | null;
  tokenBalance: number;
  avatarUrl: string | null;
  birthDate: string | null;
  phone: string | null;
  cep: string | null;
  city: string | null;
  uf: string | null;
  activeTeamId: number | null;
};

export type UpdateMyProfileInput = {
  avatarUrl?: string | null;
  name?: string;
  birthDate?: string | null;
  phone?: string | null;
  cep?: string | null;
  city?: string | null;
  uf?: string | null;
};

const ME_FIELDS = `
  id
  name
  email
  cpf
  tokenBalance
  avatarUrl
  birthDate
  phone
  cep
  city
  uf
  activeTeamId
`;

const ME_QUERY = `
  query Me {
    me {
      ${ME_FIELDS}
    }
  }
`;

const UPDATE_MY_PROFILE_MUTATION = `
  mutation UpdateMyProfile($input: UpdateMyProfileInput!) {
    updateMyProfile(input: $input) {
      ${ME_FIELDS}
    }
  }
`;

export async function fetchMe(token: string): Promise<MeUser> {
  const data = await graphqlRequest<{ me: MeUser }>(ME_QUERY, undefined, token);
  return data.me;
}

export async function updateMyProfile(
  token: string,
  input: UpdateMyProfileInput,
): Promise<MeUser> {
  const data = await graphqlRequest<
    { updateMyProfile: MeUser },
    { input: UpdateMyProfileInput }
  >(UPDATE_MY_PROFILE_MUTATION, { input }, token);

  return data.updateMyProfile;
}

export async function updateMyAvatar(token: string, avatarUrl: string): Promise<MeUser> {
  return updateMyProfile(token, { avatarUrl });
}

export function formatProfileSubtitle(
  user: Pick<MeUser, 'city' | 'uf' | 'tokenBalance'>,
): string {
  const location =
    user.city && user.uf
      ? `${user.city}, ${user.uf.toUpperCase()}`
      : user.city || (user.uf ? user.uf.toUpperCase() : null);

  const tokens =
    typeof user.tokenBalance === 'number'
      ? ` • ${user.tokenBalance} token${user.tokenBalance === 1 ? '' : 's'}`
      : '';

  return location
    ? `Pessoa / Atleta • ${location}${tokens}`
    : `Pessoa / Atleta${tokens}`;
}

/** Converte ISO date da API para dd/mm/yyyy */
export function isoToBirthDateDisplay(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
      return '';
    }
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear());
  return `${day}/${month}/${year}`;
}
