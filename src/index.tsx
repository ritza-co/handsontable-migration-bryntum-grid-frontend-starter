import { createRoot } from "react-dom/client";
import { BryntumGrid } from '@bryntum/grid-react';
import { gridProps } from './gridConfig';
import "./styles.css";

const App = () => {
  return (
    <BryntumGrid {...gridProps} />
  );
};

const rootElement = document.getElementById("root");

createRoot(rootElement as HTMLElement).render(<App />);
