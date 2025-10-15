import styled from "styled-components";
import image from "../assets/login-and-register.png";

const FloatingImage = styled.img`
  position: fixed;
  bottom: 0px;
  right: 5px;
  width: 560px;
  max-width: 30%;
  height: auto;
  z-index: 10;
  opacity: 0.95;
  pointer-events: none; /* não bloqueia cliques */

  @media (max-width: 1024px) {
    width: 560px;
    max-width: 40%;
    right: 10px;
  }

  @media (max-width: 768px) {
    width: 780px;
    max-width: 50%;
  }

  @media (max-width: 460px) {
    width: 780px;
    max-width: 100%;
    right: 0;
  }
`;

export function FloatingAuthImage() {
  return (
    <FloatingImage
      src={image}
      alt="Garoto do acampamento meio sangue segurando escudo e espada"
    />
  );
}
