import { graphqlRequest } from '@/lib/api/graphql';

const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
    }
  }
`;

const IS_EMAIL_AVAILABLE_QUERY = `
  query IsEmailAvailable($email: String!) {
    isEmailAvailable(email: $email)
  }
`;

const SEND_VERIFICATION_CODE_MUTATION = `
  mutation SendVerificationCode($input: SendVerificationCodeInput!) {
    sendVerificationCode(input: $input) {
      success
      message
    }
  }
`;

const VERIFY_CODE_AND_REGISTER_MUTATION = `
  mutation VerifyCodeAndRegister($input: VerifyCodeAndRegisterInput!) {
    verifyCodeAndRegister(input: $input) {
      accessToken
    }
  }
`;

const SEND_PASSWORD_RESET_CODE_MUTATION = `
  mutation SendPasswordResetCode($input: SendPasswordResetCodeInput!) {
    sendPasswordResetCode(input: $input) {
      success
      message
    }
  }
`;

const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
      message
    }
  }
`;

type AuthPayload = {
  accessToken: string;
};

type MessagePayload = {
  success: boolean;
  message: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type VerifyCodeAndRegisterInput = {
  code: string;
  email: string;
  name: string;
  password: string;
  birthDate: string;
  phone: string;
  cep: string;
  city: string;
  uf: string;
};

export type ResetPasswordInput = {
  code: string;
  email: string;
  password: string;
};

export async function loginRequest(input: LoginInput): Promise<string> {
  const data = await graphqlRequest<{ login: AuthPayload }, { input: LoginInput }>(LOGIN_MUTATION, {
    input,
  });

  return data.login.accessToken;
}

export async function isEmailAvailableRequest(email: string): Promise<boolean> {
  const data = await graphqlRequest<{ isEmailAvailable: boolean }, { email: string }>(
    IS_EMAIL_AVAILABLE_QUERY,
    {
      email: email.trim().toLowerCase(),
    },
  );

  return data.isEmailAvailable;
}

export async function sendVerificationCodeRequest(email: string): Promise<MessagePayload> {
  const data = await graphqlRequest<
    { sendVerificationCode: MessagePayload },
    { input: { email: string } }
  >(SEND_VERIFICATION_CODE_MUTATION, {
    input: { email: email.trim().toLowerCase() },
  });

  return data.sendVerificationCode;
}

export async function verifyCodeAndRegisterRequest(
  input: VerifyCodeAndRegisterInput,
): Promise<string> {
  const data = await graphqlRequest<
    { verifyCodeAndRegister: AuthPayload },
    { input: VerifyCodeAndRegisterInput }
  >(VERIFY_CODE_AND_REGISTER_MUTATION, { input });

  return data.verifyCodeAndRegister.accessToken;
}

export async function sendPasswordResetCodeRequest(email: string): Promise<MessagePayload> {
  const data = await graphqlRequest<
    { sendPasswordResetCode: MessagePayload },
    { input: { email: string } }
  >(SEND_PASSWORD_RESET_CODE_MUTATION, {
    input: { email: email.trim().toLowerCase() },
  });

  return data.sendPasswordResetCode;
}

export async function resetPasswordRequest(input: ResetPasswordInput): Promise<MessagePayload> {
  const data = await graphqlRequest<
    { resetPassword: MessagePayload },
    { input: ResetPasswordInput }
  >(RESET_PASSWORD_MUTATION, {
    input: {
      ...input,
      email: input.email.trim().toLowerCase(),
    },
  });

  return data.resetPassword;
}
