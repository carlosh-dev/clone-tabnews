import { NotFoundError, UnauthorazedError } from "infra/errors.js";
import password from "./password.js";
import user from "./user.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    let storedUser = await findByEmail(providedEmail);

    await validadePasword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorazedError) {
      throw new UnauthorazedError({
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados estão corretos.",
      });
    }

    throw error;
  }

  async function findByEmail(providedEmail) {
    let storedUser;

    try {
      storedUser = await user.findOneByEmail(providedEmail);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new UnauthorazedError({
          message: "Email não confere.",
          action: "Verifique se esse dado está correto.",
        });
      }

      throw error;
    }

    return storedUser;
  }

  async function validadePasword(providedPassword, storedPassword) {
    const correctPasswordMatch = await password.compare(
      providedPassword,
      storedPassword,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorazedError({
        message: "Senha não confere.",
        action: "Verifique se esse dado está correto.",
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
