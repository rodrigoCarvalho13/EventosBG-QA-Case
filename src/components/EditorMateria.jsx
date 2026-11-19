import React, { useEffect, useMemo, useRef } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./editorMateria.css";

const icons = Quill.import("ui/icons");
icons.undo = '<svg viewBox="0 0 18 18"><path class="ql-stroke" d="M7 5H3v4"></path><path class="ql-stroke" d="M3.5 8.5A5.5 5.5 0 1 0 6 4"></path></svg>';
icons.redo = '<svg viewBox="0 0 18 18"><path class="ql-stroke" d="M11 5h4v4"></path><path class="ql-stroke" d="M14.5 8.5A5.5 5.5 0 1 1 12 4"></path></svg>';

const FORMATOS = ["bold", "italic", "underline", "header", "list", "blockquote", "link", "align", "size", "color"];

export default function EditorMateria({ id, value, onChange }) {
  const ref = useRef(null);
  const modules = useMemo(() => ({
    history: { delay: 400, maxStack: 100, userOnly: true },
    toolbar: {
      container: [
        ["bold", "italic", "underline"],
        [{ header: 2 }, { header: 3 }],
        [{ list: "ordered" }, { list: "bullet" }, "blockquote"],
        ["link"],
        [{ align: ["", "center", "right", "justify"] }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ color: [] }],
        ["undo", "redo"],
      ],
      handlers: {
        undo() { this.quill.history.undo(); },
        redo() { this.quill.history.redo(); },
      },
    },
  }), []);

  useEffect(() => {
    const raiz = ref.current?.getEditor?.()?.root?.closest?.(".editor-materia");
    const toolbar = raiz?.querySelector(".ql-toolbar");
    const editor = raiz?.querySelector(".ql-editor");
    if (editor) {
      editor.setAttribute("aria-labelledby", id);
      editor.setAttribute("role", "textbox");
      editor.setAttribute("aria-multiline", "true");
    }
    const botoes = {
      bold: "Negrito",
      italic: "Itálico",
      underline: "Sublinhado",
      blockquote: "Citação",
      link: "Link",
      undo: "Desfazer",
      redo: "Refazer",
      "header:2": "Título",
      "header:3": "Subtítulo",
      "list:ordered": "Lista numerada",
      "list:bullet": "Lista com marcadores",
    };
    const paineis = {
      "ql-align": "Alinhamento",
      "ql-size": "Tamanho da fonte",
      "ql-color": "Cor do texto",
      "ql-header": "Título",
    };
    toolbar?.querySelectorAll("button").forEach((el) => {
      const tipo = [...el.classList].find((nome) => nome.startsWith("ql-"))?.slice(3);
      const valor = el.getAttribute("value");
      const nome = botoes[valor ? `${tipo}:${valor}` : tipo];
      if (nome) el.setAttribute("aria-label", nome);
    });
    toolbar?.querySelectorAll(".ql-picker").forEach((el) => {
      const chave = Object.keys(paineis).find((nome) => el.classList.contains(nome));
      if (chave) el.setAttribute("aria-label", paineis[chave]);
    });
  }, [id]);

  return (
    <div className="editor-materia">
      <ReactQuill ref={ref} theme="snow" value={value || ""} onChange={onChange} modules={modules} formats={FORMATOS} />
    </div>
  );
}
