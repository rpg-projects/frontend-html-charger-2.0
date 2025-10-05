import "./login.css";
import { Button } from "baseui/button";
import { Input } from "baseui/input";
import {
  Container,
  ErrorText,
  LoginContainer,
  InputWrapper,
  StyledInput,
} from "../commons";
import { HeadingXXLarge } from "baseui/typography";

import { useSignIn } from "react-auth-kit";
import { useFormik } from "formik";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import image from "../../assets/login-and-register.png";
import { FloatingAuthImage } from "../FloatingAuthImage";

function Login() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const signIn = useSignIn();
  const navigate = useNavigate();

  const onSubmit = async (values: any) => {
    setError("");
    setLoading(true);

    try {
      const loginBody = {
        player_id: values.player_id,
        password: values.password,
      };

      const response = await axios.post(
        "http://localhost:8080/auth/login",
        loginBody
      );

      console.log("response :>> ", response);

      // autentica e salva nos cookies
      signIn({
        token: response.data.token,
        expiresIn: 60 * 60 * 24 * 365 * 10,
        tokenType: "Bearer",
        authState: {
          player_id: values.player_id,
          token: response.data.token,
        },
      });

      navigate("/");
    } catch (err) {
      console.error("Erro no login:", err);

      if (err instanceof AxiosError) {
        if (err.response) {
          const status = err.response.status;

          if (status === 400) {
            setError("Usuário ou senha incorretos.");
          } else if (!err.response.data) {
            setError("Erro no servidor. Tente novamente mais tarde.");
          } else {
            setError("Erro ao fazer login.");
          }
        } else {
          setError("Não foi possível conectar ao servidor.");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      player_id: "",
      password: "",
    },
    onSubmit,
  });

  return (
    <Container className="login-body">
      <LoginContainer>
        <form className="form" onSubmit={formik.handleSubmit}>
          <HeadingXXLarge>HTML CHARGER</HeadingXXLarge>

          {/* Exibe mensagem de erro */}
          {error && <ErrorText>{error}</ErrorText>}

          <InputWrapper>
            <StyledInput
              name="player_id"
              value={formik.values.player_id}
              onChange={formik.handleChange}
              placeholder="player_id"
              clearOnEscape
              size="large"
              type="text"
            />
          </InputWrapper>

          <InputWrapper>
            <StyledInput
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              placeholder="senha"
              clearOnEscape
              size="large"
              type="password"
            />
          </InputWrapper>

          <a href="/sign-up">criar uma conta</a>

          <InputWrapper>
            <Button
              size="large"
              kind="primary"
              isLoading={loading}
              type="submit"
            >
              ENTRAR
            </Button>
          </InputWrapper>
        </form>
      </LoginContainer>
      <FloatingAuthImage />
    </Container>
  );
}

export { Login };
