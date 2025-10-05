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
import "./register.css";

import { useSignIn } from "react-auth-kit";
import { useFormik } from "formik";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { FloatingAuthImage } from "../FloatingAuthImage";

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
          player_id: values.player_id,
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
  //   player_id: Yup.string().player_id("player_id inválido").required("Campo obrigatório"),
  //   password: Yup.string().required("A senha é obrigatória"),
  //   passwordConfirm: Yup.string().oneOf(
  //     [Yup.ref("password"), null],
  //     "Senhas diferentes"
  //   ),
  // });

  const formik = useFormik({
    initialValues: {
      player_id: "",
      password: "",
      passwordConfirm: "",
    },
    onSubmit,
  });

  return (
    <Container className="register-body">
      <LoginContainer>
        <form onSubmit={formik.handleSubmit}>
          <HeadingXXLarge>Registrar</HeadingXXLarge>
          <ErrorText>{error}</ErrorText>
          <InputWrapper>
            <StyledInput
              name="player_id"
              value={formik.values.player_id}
              onChange={formik.handleChange}
              placeholder="Id de player"
              clearOnEscape
              size="large"
              type="player_id"
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
            <Button size="large" kind="primary" isLoading={formik.isSubmitting}>
              ENTRAR
            </Button>
          </InputWrapper>
        </form>
      </LoginContainer>

      <FloatingAuthImage />
    </Container>
  );
}

export { Register };
