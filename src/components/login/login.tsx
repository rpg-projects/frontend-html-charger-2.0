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
import "./login.css";

import { useSignIn } from "react-auth-kit";
import { useFormik } from "formik";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import * as Yup from "yup";

function Login(props: any) {
  const [error, setError] = useState("");
  const signIn = useSignIn();

  const navigate = useNavigate();

  const onSubmit = async (values: any) => {
    setError("");

    try {
      const loginBody = {
        player_id: values.player_id,
        password: values.password,
      };

      const response = await axios.post(
        "http://localhost:8080/auth/login",
        loginBody
      );

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

  const formik = useFormik({
    initialValues: {
      player_id: "",
      password: "",
    },
    onSubmit,
  });

  return (
    <Container>
      <LoginContainer className="login-container">
        <form onSubmit={formik.handleSubmit}>
          <HeadingXXLarge>HTML CHARGER</HeadingXXLarge>
          <ErrorText>{error}</ErrorText>
          <InputWrapper>
            <StyledInput
              name="player_id"
              value={formik.values.player_id}
              onChange={formik.handleChange}
              placeholder="player_id"
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
          <a href="/sign-up">criar uma conta</a>
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

export { Login };
