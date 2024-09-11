import { useRef } from "react";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { lexicalTheme } from "./lexicalTheme";
import ToolBarPlugin from "../plugins/ToolbarPlugin";
import "../stylesheets/Editor.css";

const Editor = ({ placeholder="Enter some rich text..." }) => {

const editorConfig = {
  namespace: "Lexical Editor",
  theme: lexicalTheme,
  nodes: [],
  onError(error) {
    throw error;
  },
};

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolBarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="editor-placeholder">{placeholder}</div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
        </div>
      </div>
    </LexicalComposer>
  );
}

export default Editor;