import React from "react";
import { createRoot } from "react-dom/client";
import "@handsontable/pikaday/css/pikaday.css";
import "./styles.css";
import Handsontable from 'handsontable';
import { HotTable, HotColumn } from "@handsontable/react-wrapper";
import { data } from "./constants";
import { addClassesToRows } from "./hooksCallbacks";
import "handsontable/styles/handsontable.css";
import "handsontable/styles/ht-theme-horizon.css";

const App = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: window.innerWidth, height: window.innerHeight });

  React.useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} style={{ height: '100vh', width: '100vw' }}>
      <HotTable
        data={data}
        height={dimensions.height}
        width={dimensions.width}
        stretchH="all"
        colHeaders={[
        "Company name",
        "Name",
        "Sell date",
        "In stock",
        "Qty",
        "Order ID",
        "Country"
      ]}
      dropdownMenu={true}
      hiddenColumns={{
        indicators: true
      }}
      contextMenu={true}
      multiColumnSorting={true}
      filters={true}
      rowHeaders={true}
      headerClassName="htLeft"
      beforeRenderer={addClassesToRows}
      manualRowMove={true}
      autoWrapRow={true}
      navigableHeaders={true}
      licenseKey="non-commercial-and-evaluation"
      className="ht-theme-horizon"
    >
      <HotColumn data={1} />
      <HotColumn data={3} width={222} />
      <HotColumn data={4} type="date" allowInvalid={false} width={100} />
      <HotColumn data={6} type="checkbox" className="htCenter" headerClassName="htCenter" width={90} />
      <HotColumn data={7} type="numeric" headerClassName="htRight" width={60} />
      <HotColumn data={5} width={100} />
      <HotColumn data={2} width={156} />
    </HotTable>
    </div>
  );
};

const rootElement = document.getElementById("root");

createRoot(rootElement as HTMLElement).render(<App />);

console.log(`Handsontable: v${Handsontable.version} (${Handsontable.buildDate}) Wrapper: v${HotTable.version} React: v${React.version}`);
