import { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useAuthUser, useSignOut } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { Button } from "baseui/button";
import { Popover, PLACEMENT } from "baseui/popover";
import {
  HeadingXXLarge,
  HeadingMedium,
  HeadingSmall,
  HeadingXSmall,
} from "baseui/typography";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
} from "baseui/modal";
import { StatefulTooltip } from "baseui/tooltip";
import { Container, StyledInput, ErrorText } from "../commons";
import styled from "styled-components";
import { LogOut, Pencil, Trash2 } from "lucide-react";
import "./home.css";
import toast from "react-hot-toast";

// === Styled Components ===
const TopBar = styled.div`
  position: absolute;
  top: 1rem;
  right: 2rem;
  display: flex;
  gap: 1rem;

  @media (max-width: 460px) {
    top: 1rem;
    right: 1rem;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #fff;
`;

const TextArea = styled.textarea`
  width: 100%;
  resize: both;
  min-width: 200px; // largura mínima
  max-width: 1000px; // largura máxima
  height: 200px;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;

  @media (max-width: 460px) {
    width: 90%;
    height: 400px;
    margin: auto;
  }
`;

const TextAreaForm = styled.textarea`
  width: 100%;
  resize: both;
  min-width: 200px; // largura mínima
  max-width: 1000px; // largura máxima
  height: 400px;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
`;

const FormSection = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (max-width: 460px) {
    margin: 0.5rem auto;
  }
`;

const AddCharForm = styled.form`
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AddCharButton = styled(Button)`
  background-color: #695a48 !important;
  color: #fff !important;
  border-radius: 8px !important;
  padding: 0.8rem 1.2rem !important;
  font-weight: 600 !important;

  &:hover {
    background-color: #534839ff !important;
  }
`;

const LogoutButton = styled(Button)`
  background-color: #352d23ff !important;
  color: #fff !important;
  border-radius: 8px !important;
  padding: 0.8rem 1.2rem !important;
  font-weight: 600 !important;

  &:hover {
    background-color: #2b241cff !important;
  }

  @media (max-width: 460px) {
    padding: 0.6rem 0.6rem !important;
    font-size: 1rem;
    position: absolute;
    top: 0.1rem; /* distância do topo */
    right: 0rem; /* distância da direita */
  }
`;

const GetHTMLButton = styled(Button)`
  @media (max-width: 460px) {
    width: 90%;
    margin: auto;
  }
`;

interface Char {
  _id: string;
  name: string;
  html: string;
  lines: string;
}

interface CreateChar {
  name: string;
  html: string;
  lines: string;
}

// === Funções auxiliares ===
function getTextReady(text: string, lines: string) {
  const [part1, part2] = lines.split("FALA");
  let isLineStart = true;
  const newText: string[] = [];

  for (let i = 0; i < text.length; i++) {
    if ((text[i] === "~" || text[i] === "—") && isLineStart) {
      newText.push(part1);
      isLineStart = false;
    } else if ((text[i] === "~" || text[i] === "—") && !isLineStart) {
      newText.push(part2);
      isLineStart = true;
    } else {
      newText.push(text[i]);
    }
  }

  return newText.join("");
}

// === Componente principal ===
export function Home() {
  const auth = useAuthUser();
  const signOut = useSignOut();
  const navigate = useNavigate();

  const token = auth()?.token;

  const name = auth()?.player_id;

  const [isMobile, setIsMobile] = useState(false);

  const [chars, setChars] = useState<any[]>([]);
  const [selectedChar, setSelectedChar] = useState("");
  const [text, setText] = useState(() => {
    return localStorage.getItem("draftText") || "";
  });
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    html?: string;
    lines?: string;
  }>({});

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChar, setEditingChar] = useState<any | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const [modalChar, setModalChar] = useState<CreateChar | Char | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [newChar, setNewChar] = useState<CreateChar>({
    name: "",
    html: "",
    lines: "",
  });

  // === Carrega personagens ===
  useEffect(() => {
    const fetchChars = async () => {
      try {
        const res = await axios.get(
          "https://backend-html-charger.onrender.com/chars",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("res.data :>> ", res.data);
        setChars(res.data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar personagens");
      }
    };

    if (token) {
      fetchChars();
    }
  }, [token]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); // verifica ao montar
    window.addEventListener("resize", handleResize);

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("draftText", text);
  }, [text]);

  const logout = () => {
    signOut();
    navigate("/login");
  };

  // === Gera HTML ===
  const handleGenerateHTML = () => {
    const char = chars.find((c) => c._id === selectedChar);
    console.log("char :>> ", char);

    if (!char) return alert("Selecione um personagem válido.");

    const { html, lines } = char;
    const [part1, part2] = html.split("TEXTO");

    const formattedText = getTextReady(text, lines);
    const finalHtml = `${part1}${formattedText}${part2}`;

    navigator.clipboard.writeText(finalHtml);
    alert("HTML copiado para a área de transferência!");

    localStorage.removeItem("draftText");
    setText("");
  };

  function validateNewCharFormat(char: CreateChar) {
    const newErrors: { name?: string; html?: string; lines?: string } = {};

    if (!char.name.trim()) {
      newErrors.name = "O nome é obrigatório.";
    }

    if (!/<[^>]*>.*TEXTO.*<\/[^>]*>/.test(char.html)) {
      newErrors.html = "Formato incorreto — use algo como <html>TEXTO</html>";
    }

    if (!/<[^>]*>.*FALA.*<\/[^>]*>/.test(char.lines)) {
      newErrors.lines = "Formato incorreto — use algo como <html>FALA</html>";
    }

    return newErrors;
  }

  const handleSaveChar = async (e: React.FormEvent, char: any) => {
    e.preventDefault();
    const validationErrors = validateNewCharFormat(char);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      if ("_id" in char) {
        // Editar
        const res = await axios.put(
          `https://backend-html-charger.onrender.com/chars/${char._id}`,
          char,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setChars((prev) =>
          prev.map((c) => (c._id === char._id ? res.data : c))
        );
        toast.success("Personagem editado!");
      } else {
        // Adicionar
        const res = await axios.post(
          "https://backend-html-charger.onrender.com/chars",
          char,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setChars((prev) => [...prev, res.data]);
        toast.success("Personagem adicionado!");
      }
      setModalChar(null);
    } catch (error) {
      toast.error("Erro ao salvar personagem");
    }
  };

  // === Deleta personagem ===
  const handleDeleteChar = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este personagem?"))
      return;

    try {
      await axios.delete(
        `https://backend-html-charger.onrender.com/chars/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChars((prev) => prev.filter((c) => c._id !== id));
      setSelectedChar("");
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar personagem");
    }
  };

  return (
    <div className="home-container">
      <TopBar>
        <LogoutButton kind="secondary" onClick={logout}>
          {isMobile ? <LogOut size={20} /> : "Sair"}
        </LogoutButton>
      </TopBar>

      <HeadingXXLarge className="title" color="secondary500">
        HTML CHARGER
      </HeadingXXLarge>
      {/* <HeadingXXLarge color="secondary500">{name} CHARS</HeadingXXLarge> */}

      <FormSection>
        {/* <HeadingMedium>Gerador de HTML</HeadingMedium> */}

        <div className="char-edits">
          <div className="select-with-title">
            <h3 className="title">{name} CHARS:</h3>
            {/* char selection */}
            <div className="char-select" ref={dropdownRef}>
              <input
                readOnly
                value={
                  selectedChar
                    ? chars.find((c) => c._id === selectedChar)?.name
                    : ""
                }
                placeholder="Selecione um char"
                onClick={(e) => {
                  e.stopPropagation(); // impede o document de fechar
                  setIsOpen((prev) => !prev); // alterna entre abrir/fechar
                }}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.6rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                }}
              />

              {isOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    width: "9.2rem",
                    left: 0,
                    right: 0,
                    overflowY: "hidden",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    background: "#fff",
                    marginTop: "0.2rem",
                    zIndex: 10,
                    boxSizing: "border-box",
                  }}
                >
                  {chars.length === 0 ? (
                    <div
                      style={{
                        padding: "0.5rem",
                        textAlign: "center",
                        color: "#666",
                      }}
                    >
                      Nenhum personagem ainda, adicione o primeiro!
                    </div>
                  ) : (
                    chars.map((char) => (
                      <div
                        key={char._id}
                        style={{
                          display: "flex",
                          width: "90%",
                          overflow: "hidden",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.5rem 0.3rem",
                          background:
                            selectedChar === char._id
                              ? "rgba(0,0,0,0.05)"
                              : "transparent",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setSelectedChar(char._id);
                          setIsOpen(false);
                        }}
                      >
                        <span>{char.name}</span>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Pencil
                            size={16}
                            color="#007bff"
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("char :>> ", char);
                              setModalChar(char);
                              setIsOpen(false);
                            }}
                          />
                          <Trash2
                            size={16}
                            color="#ff4d4d"
                            style={{ cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChar(char._id);
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <AddCharButton
            kind="secondary"
            onClick={() => setModalChar({ name: "", html: "", lines: "" })}
          >
            {showAddForm ? "Fechar" : "Adicionar novo personagem"}
          </AddCharButton>
        </div>

        <TextArea
          placeholder="Digite o texto do post aqui..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <GetHTMLButton onClick={handleGenerateHTML}>
          Pegar HTML do Post
        </GetHTMLButton>

        <Modal onClose={() => setModalChar(null)} isOpen={!!modalChar}>
          <ModalHeader>
            {"id" in (modalChar || {})
              ? "Editar Personagem"
              : "Adicionar Novo Personagem"}
          </ModalHeader>

          <ModalBody>
            {modalChar && (
              <AddCharForm
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveChar(e, modalChar);
                }}
              >
                {/* Nome */}
                <StyledInput
                  placeholder="Nome do char"
                  value={modalChar.name}
                  onChange={(e: any) =>
                    setModalChar({ ...modalChar, name: e.target.value } as any)
                  }
                  required
                />
                {errors.name && <ErrorText>{errors.name}</ErrorText>}

                {/* HTML do personagem */}
                <div style={{ position: "relative" }}>
                  <TextAreaForm
                    placeholder="HTML do personagem — destaque aonde ficará o texto: <html>TEXTO</html>"
                    value={modalChar.html}
                    onChange={(e) =>
                      setModalChar({
                        ...modalChar,
                        html: e.target.value,
                      } as any)
                    }
                    required
                  />
                  {errors.html && <ErrorText>{errors.html}</ErrorText>}
                </div>

                {/* HTML de fala */}
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <TextAreaForm
                    placeholder="HTML de fala — destaque aonde ficará a fala: <html>FALA</html>"
                    style={{ height: "100px" }}
                    value={modalChar.lines}
                    onChange={(e) =>
                      setModalChar({
                        ...modalChar,
                        lines: e.target.value,
                      } as any)
                    }
                    required
                  />
                  {errors.lines && <ErrorText>{errors.lines}</ErrorText>}
                </div>
              </AddCharForm>
            )}
          </ModalBody>

          <ModalFooter>
            <ModalButton
              type="submit"
              onClick={(e) => handleSaveChar(e, modalChar!)}
            >
              Salvar
            </ModalButton>
            <ModalButton kind="tertiary" onClick={() => setModalChar(null)}>
              Cancelar
            </ModalButton>
          </ModalFooter>
        </Modal>

        {error && <ErrorText>{error}</ErrorText>}
      </FormSection>
    </div>
  );
}
