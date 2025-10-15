import { Input } from "baseui/input";
import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4rem 4rem 8rem 4rem;
  margin-bottom: 160px;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(15, 15, 15, 0.6);
  background-color: rgba(0, 0, 0, 0.4); /* Black background with 50% opacity */

  @media (max-width: 1024px) {
    padding: 2rem 2rem 4rem 2rem;
    margin-right: 100px;
  }

  @media (max-width: 768px) {
    padding: 2rem 2rem 4rem 2rem;
    margin-right: 100px;
    margin-bottom: 160px;
  }

  @media (max-width: 460px) {
    padding: 1rem 1rem 2rem 1rem;
    margin-right: 0px;
    margin-bottom: 260px;
    justify-content: center;
    align-items: center;
  }
`;

export const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 1rem 0;
`;

export const StyledInput = styled(Input)`
  width: 100%;
  margin-bottom: 20em !important;
`;

export const ErrorText = styled.span`
  color: #eb5d5d;
  font-size: 18px;
  margin: 7px 0;
`;
