import { useCallback, useEffect, useRef, useState } from "react";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {mergeRegister} from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { 
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";

const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const [isUnorderedList, setIsUnorderedList] = useState(false);

  const getListState = (selection) => {
    const anchorNode = selection.anchor.getNode();
    const parentNode = anchorNode.getParent();
    let orderedList = false;
    let unorderedList = false;

    if (parentNode && $isListNode(parentNode)){
      // const parentTag = parentNode.getTag();

      if (parentNode.getTag() === "ol") {
        orderedList = true;
      } else if (parentNode.getTag() === "ul") {
        unorderedList = true;
      }
    }

    return { orderedList, unorderedList };
  }

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {

      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));

      const { orderedList, unorderedList } = getListState(selection);
      setIsOrderedList(orderedList);
      setIsUnorderedList(unorderedList);
    }
  }, []);
  // console.log("bullet:", isUnorderedList)
  // console.log("ordered:", isOrderedList)
  // const handleListChange = (listType, isActive, setIsActive, otherSetIsActive) => {
  //   editor.update(() => {
  //     const selection = $getSelection();
  //     if ($isRangeSelection(selection)) {
  //       if (isActive) {
  //         console.log("remove list command")
  //         editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  //         isActive === isOrderedList ? setIsOrderedList(false) : setIsUnorderedList(false);
  //       } else {
  //         editor.dispatchCommand(listType, undefined);
  //         isActive === isOrderedList ? setIsOrderedList(true) : setIsUnorderedList(true);
  //         setIsActive(true);
  //         // otherSetIsActive(false);
  //       }
  //     }
  //     updateToolbar();
  //   });
  // };

  const handleListChange = (listType, isActive, setIsActive,) => {
    editor.update(() => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          const listItemsToRemove = [];
    
          nodes.forEach((node) => {
            let targetNode = node;
    
            if (targetNode.getType() === 'text' || targetNode.isEmpty()) {
              targetNode = targetNode.getParent();  
            }
    
            const parentNode = targetNode.getParent();
            if (parentNode && $isListNode(parentNode)) {
              listItemsToRemove.push(targetNode);
            }
          });
    
          if (listItemsToRemove.length > 0) {
            listItemsToRemove.forEach(() => {
              editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined); 
              setIsUnorderedList(false);
            });
          } else {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            setIsOrderedList(true);
          }
        }
      })
    });
    


      // if ($isRangeSelection(selection)) {
      //   if (isUnorderedList) {
      //     console.log("remove list command")
      //     editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      //     setIsUnorderedList(false);
      //   } else {
      //     editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      //     setIsOrderedList(false)
      //     setIsUnorderedList(true);
      //   }
      // }
  };

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, updateToolbar]);

  return (
    <div className="toolbar" ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Undo">
        <i className="format undo" />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo">
        <i className="format redo" />
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={"toolbar-item spaced " + (isBold ? "active" : "")}
        aria-label="Format Bold">
        <i className="format bold" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={"toolbar-item spaced " + (isItalic ? "active" : "")}
        aria-label="Format Italics">
        <i className="format italic" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
        aria-label="Format Underline">
        <i className="format underline" />
      </button>
      <button
        onClick={handleListChange}
        className={"toolbar-item spaced " + (isUnorderedList ? "active" : "")}
        aria-label="Format Unordered">
        <i className="format unordered" />
      </button>
      <button
        onClick={handleListChange}
        className={"toolbar-item spaced " + (isOrderedList ? "active" : "")}
        aria-label="Format Ordered">
        <i className="format ordered" />
      </button>
      {/* <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={"toolbar-item spaced " + (isStrikethrough ? "active" : """)}
        aria-label="Format Strikethrough">
        <i className="format strikethrough" />
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        className="toolbar-item spaced"
        aria-label="Left Align">
        <i className="format left-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        className="toolbar-item spaced"
        aria-label="Center Align">
        <i className="format center-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        className="toolbar-item spaced"
        aria-label="Right Align">
        <i className="format right-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        className="toolbar-item"
        aria-label="Justify Align">
        <i className="format justify-align" />
      </button>{" "} */}
    </div>
  );
}