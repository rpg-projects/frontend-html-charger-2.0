import { Button } from "baseui/button";
import { Input } from "baseui/input";
import styled from "styled-components";
import {
  HeadingXXLarge,
  HeadingXLarge,
  HeadingLarge,
  HeadingMedium,
  HeadingSmall,
  HeadingXSmall,
} from "baseui/typography";
import {
  Container,
  ErrorText,
  LoginContainer,
  InputWrapper,
  StyledInput,
} from "../commons";
import "./index.css";

import { useSignIn } from "react-auth-kit";
import { useFormik } from "formik";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

function Register(props: any) {
  const [error, setError] = useState("");
  const signIn = useSignIn();

  const navigate = useNavigate();

  const onSubmit = async (values: any) => {
    setError("");

    try {
      console.log("values :>> ", values);

      if (!values.password || !values.passwordConfirm) {
        throw new Error();
      } else if (values.password !== values.passwordConfirm) {
        throw new Error();
      }

      const response = await axios.post("http://localhost:8080/users", values);

      //salva nos cookies e autentica
      signIn({
        token: response.data.token,
        expiresIn: 3600,
        tokenType: "Bearer",
        authState: {
          id: response.data.id,
          email: values.email,
        },
      });

      navigate("/");
    } catch (err) {
      if (err && err instanceof AxiosError)
        setError(err.response?.data.message);
      else if (err && err instanceof Error) setError(err.message);

      console.log("Error: ", err);
    }
  };

  // const SignupSchema = Yup.object().shape({
  //   email: Yup.string().email("Email inválido").required("Campo obrigatório"),
  //   password: Yup.string().required("A senha é obrigatória"),
  //   passwordConfirm: Yup.string().oneOf(
  //     [Yup.ref("password"), null],
  //     "Senhas diferentes"
  //   ),
  // });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
    onSubmit,
  });

  return (
    <Container>
      <LoginContainer className="login-container">
        <form onSubmit={formik.handleSubmit}>
          <HeadingXXLarge>Registrar</HeadingXXLarge>
          <ErrorText>{error}</ErrorText>
          <InputWrapper>
            <StyledInput
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              placeholder="email"
              clearOnEscape
              size="large"
              type="email"
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
          <InputWrapper>
            <StyledInput
              name="passwordConfirm"
              value={formik.values.passwordConfirm}
              onChange={formik.handleChange}
              placeholder="confirmar senha"
              clearOnEscape
              size="large"
              type="password"
            />
          </InputWrapper>
          <InputWrapper>
            <Button
              className="login-button"
              size="large"
              kind="primary"
              isLoading={formik.isSubmitting}
            >
              ENTRAR
            </Button>
          </InputWrapper>
        </form>
      </LoginContainer>
    </Container>
  );
}

export { Register };
