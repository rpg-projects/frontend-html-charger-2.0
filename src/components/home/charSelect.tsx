import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "baseui/button";
import { Popover, PLACEMENT } from "baseui/popover";

interface Char {
  id: string;
  name: string;
}

interface CharSelectProps {
  chars: Char[];
  selectedChar: string | null;
  setSelectedChar: (id: string) => void;
  handleDeleteChar: (id: string) => void;
  setEditingChar: (char: Char) => void;
}

export default function CharSelect({
  chars,
  selectedChar,
  setSelectedChar,
  handleDeleteChar,
  setEditingChar,
}: CharSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ width: "300px" }}>
      <Popover
        isOpen={isOpen}
        onClickOutside={() => setIsOpen(false)}
        content={() => (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem",
              maxHeight: "200px",
              overflowY: "auto",
              padding: "0.5rem",
            }}
          >
            {chars.length === 0 ? (
              <div style={{ color: "#666", textAlign: "center" }}>
                Nenhum personagem ainda
              </div>
            ) : (
              chars.map((char) => (
                <div
                  key={char.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.3rem 0.5rem",
                    borderRadius: "6px",
                    background:
                      selectedChar === char.id
                        ? "rgba(0,0,0,0.05)"
                        : "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectedChar(char.id);
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
                        setEditingChar(char);
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
        placement={PLACEMENT.bottomLeft}
      >
        <Button onClick={() => setIsOpen(!isOpen)}>
          {selectedChar
            ? chars.find((c) => c.id === selectedChar)?.name
            : "Selecione um personagem"}
        </Button>
      </Popover>
    </div>
  );
}
