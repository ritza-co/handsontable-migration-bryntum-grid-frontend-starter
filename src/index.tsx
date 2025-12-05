import React from "react";
import { createRoot } from "react-dom/client";
import "@handsontable/pikaday/css/pikaday.css";
import "./styles.css";
import { HotTable, HotColumn } from "@handsontable/react-wrapper";
import { addClassesToRows } from "./hooksCallbacks";
import "handsontable/styles/handsontable.css";
import "handsontable/styles/ht-theme-horizon.css";
import { API_BASE_URL } from "./constants";

const App = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: window.innerWidth, height: window.innerHeight });
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Load data from API on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const result = await response.json();
        if (result.products) {
          // Convert products from object format to array format for Handsontable
          // Include the ID as the first element (hidden column)
          const formattedData = result.products.map((product: any) => [
            product.id,           // Index 0: database ID (will be hidden)
            product.index,        // Index 1: visual index (will be hidden)
            product.companyName,  // Index 2
            product.country,      // Index 3
            product.productName,  // Index 4
            product.sellDate,     // Index 5
            product.orderId,      // Index 6
            product.inStock,      // Index 7
            product.qty           // Index 8
          ]);
          setData(formattedData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle data changes and sync to backend
  const handleAfterChange = async (changes: any, source: string) => {
    if (source === 'loadData') {
      return; // don't save this change
    }

    if (!changes) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/save`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ changes }),
      });

      const result = await response.json();

      if (result.success) {
      } else {
        console.error('Error saving data:', result.message);
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Handle row removal - using beforeRemoveRow to access data before it's modified
  const handleBeforeRemoveRow = async (index: number, amount: number, physicalRows: number[], source?: string) => {

    if (source === 'loadData') {
      return; // don't delete on initial load
    }

    // beforeRemoveRow fires before data is modified, so we can safely access the IDs
    const idsToDelete = physicalRows.map(rowIndex => data[rowIndex][0]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/delete?ids=${idsToDelete.join(',')}`, {
        method: 'DELETE',
      });

      const result = await response.json();
    } catch (error) {
      console.error('Error deleting products:', error);
    }
  };

  // Handle row creation
  const handleAfterCreateRow = async (index: number, amount: number, source?: string) => {

    if (source === 'loadData' || source === 'auto') {
      return; // don't create on initial load or auto operations
    }

    // Get the newly created rows from the data
    const newRows = data.slice(index, index + amount);

    // Calculate the starting index for new rows
    // For "insert above", new row takes the current index position
    // For "insert below", new row takes index + 1 position (but Handsontable already placed it there)
    // For other operations (like adding at end), use the current index
    const startIndex = index;

    // Convert rows to product objects with default values
    const productsToCreate = newRows.map((row, i) => ({
      index: startIndex + i,  // Use the actual position in the table
      companyName: row[2] || 'New Company',
      country: row[3] || 'Unknown',
      productName: row[4] || 'New Product',
      sellDate: row[5] || new Date().toLocaleDateString('en-GB'),
      orderId: row[6] || '00-0000000',
      inStock: row[7] !== undefined ? row[7] : false,
      qty: row[8] || 0
    }));

    try {
      // Update the indices of all existing rows after the insertion point
      // For both insert above and below, rows after the insertion need their indices incremented
      const rowsToUpdate = data.slice(index + amount).map((row, i) => ({
        id: row[0],
        index: startIndex + amount + i
      }));

      if (rowsToUpdate.length > 0) {
        // Bulk update existing row indices using the new bulk-update endpoint
        const updates = rowsToUpdate.map(row => ({
          id: row.id,
          index: row.index
        }));

        await fetch(`${API_BASE_URL}/api/products/bulk-update`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ updates }),
        });
      }

      // Then create the new products
      const response = await fetch(`${API_BASE_URL}/api/products/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: productsToCreate }),
      });

      const result = await response.json();

      if (result.success) {

        // Update the data with the newly created products (including their IDs)
        const updatedData = [...data];
        result.products.forEach((product: any, i: number) => {
          const rowIndex = index + i;
          updatedData[rowIndex] = [
            product.id,
            product.index,
            product.companyName,
            product.country,
            product.productName,
            product.sellDate,
            product.orderId,
            product.inStock,
            product.qty
          ];
        });

        // Update indices of rows after insertion
        rowsToUpdate.forEach(row => {
          const dataIndex = updatedData.findIndex(r => r[0] === row.id);
          if (dataIndex !== -1) {
            updatedData[dataIndex][1] = row.index;
          }
        });

        setData(updatedData);
      } else {
        console.error('Error creating products:', result.message);
      }
    } catch (error) {
      console.error('Error creating products:', error);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading data...</div>;
  }

  return (
    <div ref={containerRef} style={{ height: '100vh', width: '100vw' }}>
      <HotTable
        data={data}
        height={dimensions.height}
        width={dimensions.width}
        stretchH="all"
        colHeaders={[
        "ID",
        "Index",
        "Product name",
        "Company name",
        "Country",
        "Sell date",
        "Order ID",
        "In stock",
        "Qty"
      ]}
      dropdownMenu={true}
      hiddenColumns={{
        columns: [0, 1],
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
      afterChange={handleAfterChange}
      beforeRemoveRow={handleBeforeRemoveRow}
      afterCreateRow={handleAfterCreateRow}
      licenseKey="non-commercial-and-evaluation"
      className="ht-theme-horizon"
    >
      <HotColumn data={0} />
      <HotColumn data={1} />
      <HotColumn data={4} width={222} />
      <HotColumn data={2} />
      <HotColumn data={3} width={156} />
      <HotColumn data={5} type="date" allowInvalid={false} width={100} />
      <HotColumn data={6} width={100} />
      <HotColumn data={7} type="checkbox" className="htCenter" headerClassName="htCenter" width={90} />
      <HotColumn data={8} type="numeric" numericFormat={{ pattern: '0' }} allowInvalid={false} headerClassName="htRight" width={60} />
    </HotTable>
    </div>
  );
};

const rootElement = document.getElementById("root");

createRoot(rootElement as HTMLElement).render(<App />);
