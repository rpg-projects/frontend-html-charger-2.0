import { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useAuthUser, useSignOut } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { Button } from "baseui/button";
import { Popover, PLACEMENT } from "baseui/popover";
import { HeadingXXLarge, HeadingMedium } from "baseui/typography";
import { Container, StyledInput, ErrorText } from "../commons";
import styled from "styled-components";
import { Pencil, Trash2 } from "lucide-react";

// === Styled Components ===
const TopBar = styled.div`
  position: absolute;
  top: 1rem;
  right: 2rem;
  display: flex;
  gap: 1rem;
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
  height: 200px;
  padding: 1rem;
  border-radius: 8px;
  resize: vertical;
  font-size: 1rem;
`;

const FormSection = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AddCharForm = styled.form`
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// === Funções auxiliares ===
function getTextReady(text: string, color: string, charName: string) {
  let isLineStart = true;
  const newText: string[] = [];

  for (let i = 0; i < text.length; i++) {
    if (
      (text[i] === "~" || text[i] === "—" || text[i] === "-") &&
      isLineStart
    ) {
      newText.push(`<b style="color: ${color}">`);
      isLineStart = false;
    } else if (
      (text[i] === "~" || text[i] === "—" || text[i] === "-") &&
      !isLineStart
    ) {
      newText.push("</b>");
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

  const [chars, setChars] = useState<any[]>([]);
  const [selectedChar, setSelectedChar] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingChar, setEditingChar] = useState<any | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [newChar, setNewChar] = useState({
    name: "",
    html: "",
    htmlSpeech: "",
  });

  // === Carrega personagens ===
  useEffect(() => {
    const fetchChars = async () => {
      try {
        const res = await axios.get("http://localhost:8080/chars", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("res :>> ", res.data);
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
    };
  }, []);

  const logout = () => {
    signOut();
    navigate("/login");
  };

  // === Gera HTML ===
  const handleGenerateHTML = () => {
    const char = chars.find((c) => c.id === selectedChar);
    if (!char) return alert("Selecione um personagem válido.");

    const { html, color } = char;
    const [part1, part2] = html.split("TEXTO");

    const formattedText = getTextReady(text, color, char.name);
    const finalHtml = `${part1}${formattedText}${part2}`;

    navigator.clipboard.writeText(finalHtml);
    alert("HTML copiado para a área de transferência!");
  };

  // === Adiciona novo personagem ===
  const handleAddChar = (e: React.FormEvent) => {
    e.preventDefault();

    axios
      .post("/chars", newChar, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setChars([...chars, res.data]);
        setShowAddForm(false);
        setNewChar({ name: "", html: "", htmlSpeech: "" });
      })
      .catch(() => alert("Erro ao adicionar personagem"));
  };

  // === Edita personagem ===
  const handleEditChar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChar) return;

    try {
      const res = await axios.put(
        `http://localhost:8080/chars/${editingChar.id}`,
        editingChar,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChars((prev) =>
        prev.map((c) => (c.id === editingChar.id ? res.data : c))
      );
      setShowEditForm(false);
      setEditingChar(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao editar personagem");
    }
  };

  // === Deleta personagem ===
  const handleDeleteChar = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este personagem?"))
      return;

    try {
      await axios.delete(`http://localhost:8080/chars/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChars((prev) => prev.filter((c) => c.id !== id));
      setSelectedChar("");
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar personagem");
    }
  };

  return (
    <Container>
      <TopBar>
        <Button kind="secondary" onClick={logout}>
          Sair
        </Button>
      </TopBar>

      <HeadingXXLarge color="secondary500">{name} CHARS</HeadingXXLarge>

      <FormSection>
        <HeadingMedium>Gerador de HTML</HeadingMedium>

        {/* char selection */}
        <div style={{ width: "300px", position: "relative" }} ref={dropdownRef}>
          <Button onClick={() => setIsOpen(!isOpen)}>
            {selectedChar
              ? chars.find((c) => c.id === selectedChar)?.name
              : "Selecione um personagem"}
          </Button>

          {isOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #ccc",
                borderRadius: "8px",
                background: "#fff",
                marginTop: "0.2rem",
                zIndex: 10,
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
                    key={char.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.5rem",
                      background:
                        selectedChar === char.id
                          ? "rgba(0,0,0,0.05)"
                          : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedChar(char.id)}
                  >
                    <span>{char.name}</span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Pencil
                        size={16}
                        color="#007bff"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChar(char);
                          setShowEditForm(true);
                          setIsOpen(false);
                        }}
                      />
                      <Trash2
                        size={16}
                        color="#ff4d4d"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChar(char.id);
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <TextArea
          placeholder="Digite o texto do post aqui..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Button onClick={handleGenerateHTML}>Pegar HTML do Post</Button>

        <Button
          kind="secondary"
          onClick={() => setShowAddForm((prev) => !prev)}
        >
          {showAddForm ? "Fechar" : "Adicionar novo personagem"}
        </Button>

        {showAddForm && (
          <AddCharForm onSubmit={handleAddChar}>
            <StyledInput
              placeholder="Nome do personagem"
              value={newChar.name}
              onChange={(e: any) =>
                setNewChar({ ...newChar, name: e.target.value })
              }
              required
            />
            <TextArea
              placeholder="HTML do personagem (inclua 'TEXTO' onde o texto será inserido)"
              value={newChar.html}
              onChange={(e) => setNewChar({ ...newChar, html: e.target.value })}
              required
            />
            <TextArea
              placeholder="HTML de fala (para falas específicas)"
              value={newChar.htmlSpeech}
              onChange={(e) =>
                setNewChar({ ...newChar, htmlSpeech: e.target.value })
              }
              required
            />
            <Button type="submit">Salvar Personagem</Button>
          </AddCharForm>
        )}

        {showEditForm && editingChar && (
          <AddCharForm onSubmit={handleEditChar}>
            <StyledInput
              placeholder="Nome do personagem"
              value={editingChar.name}
              onChange={(e: any) =>
                setEditingChar({ ...editingChar, name: e.target.value })
              }
              required
            />
            <TextArea
              placeholder="HTML do personagem"
              value={editingChar.html}
              onChange={(e) =>
                setEditingChar({ ...editingChar, html: e.target.value })
              }
              required
            />
            <TextArea
              placeholder="HTML de fala"
              value={editingChar.htmlSpeech}
              onChange={(e) =>
                setEditingChar({ ...editingChar, htmlSpeech: e.target.value })
              }
              required
            />
            <Button type="submit">Salvar Alterações</Button>
            <Button kind="secondary" onClick={() => setShowEditForm(false)}>
              Cancelar
            </Button>
          </AddCharForm>
        )}

        {error && <ErrorText>{error}</ErrorText>}
      </FormSection>
    </Container>
  );
}
