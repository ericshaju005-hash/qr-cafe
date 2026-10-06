import { MenuItem, DietaryType } from '../types/cafe';

export interface SpreadsheetInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheetName: string;
}

// Extract Spreadsheet ID from raw ID or full Google Sheets URL
export function extractSpreadsheetId(input: string): string {
  const clean = input.trim();
  const urlMatch = clean.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  return clean;
}

// 1. Create a brand new Menu spreadsheet in user's Google Drive
export async function createMenuSpreadsheet(
  accessToken: string,
  initialItems: MenuItem[]
): Promise<SpreadsheetInfo> {
  // Step A: Create spreadsheet with title
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'CafeOrder Menu & Pricing',
      },
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to create Google Spreadsheet');
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const sheetName = sheetData.sheets?.[0]?.properties?.title || 'Sheet1';
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Step B: Prepare headers and initial rows
  const headers = [
    'ID',
    'Name',
    'Category',
    'Price (INR)',
    'Description',
    'Dietary (veg/non-veg/vegan)',
    'Prep Time (mins)',
    'Image URL',
    'Tags',
    'Popular (true/false)',
  ];

  const rows = initialItems.map((item) => [
    item.id,
    item.name,
    item.category,
    item.price,
    item.description,
    item.dietary,
    item.preparationTimeMinutes,
    item.image,
    (item.tags || []).join(', '),
    item.popular ? 'true' : 'false',
  ]);

  const allValues = [headers, ...rows];

  // Step C: Append values into spreadsheet
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      sheetName
    )}!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `${sheetName}!A1`,
        majorDimension: 'ROWS',
        values: allValues,
      }),
    }
  );

  if (!updateRes.ok) {
    console.warn('Could not populate initial values immediately, spreadsheet was created.');
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title: 'CafeOrder Menu & Pricing',
    sheetName,
  };
}

// 2. Fetch and parse menu items from connected spreadsheet
export async function fetchMenuFromSpreadsheet(
  accessToken: string,
  spreadsheetId: string
): Promise<{ items: MenuItem[]; sheetTitle: string }> {
  // Always inspect metadata first to get actual sheet title (avoid hardcoding Sheet1)
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!metaRes.ok) {
    const errorData = await metaRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        'Could not access spreadsheet. Please check the Spreadsheet ID and permissions.'
    );
  }

  const metaData = await metaRes.json();
  const sheetTitle = metaData.sheets?.[0]?.properties?.title || 'Sheet1';

  // Read all rows
  const valuesRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      sheetTitle
    )}!A1:J100`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!valuesRes.ok) {
    const errorData = await valuesRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to read data from sheet');
  }

  const valuesData = await valuesRes.json();
  const rows: any[][] = valuesData.values || [];

  if (rows.length <= 1) {
    throw new Error('Spreadsheet does not contain any menu items. Please add products or initialize.');
  }

  // Row 0 is header, rows 1..N are items
  const items: MenuItem[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || !row[1]) continue; // Skip empty rows

    const id = row[0] ? String(row[0]).trim() : `item_${i}`;
    const name = String(row[1]).trim();
    const category = row[2] ? String(row[2]).trim().toLowerCase() : 'coffee';

    // Parse price cleanly (handle symbols e.g. ₹ or commas)
    let rawPrice = String(row[3] || '0').replace(/[^0-9.]/g, '');
    const price = parseFloat(rawPrice) || 0;

    const description = row[4] ? String(row[4]).trim() : '';

    // Dietary
    let dietary: DietaryType = 'veg';
    const dietRaw = String(row[5] || '').toLowerCase().trim();
    if (dietRaw.includes('non') || dietRaw.includes('meat') || dietRaw.includes('chicken')) {
      dietary = 'non-veg';
    } else if (dietRaw.includes('vegan') || dietRaw.includes('plant')) {
      dietary = 'vegan';
    }

    const prepTime = parseInt(String(row[6] || '5'), 10) || 5;
    const image = row[7] && String(row[7]).trim().startsWith('http')
      ? String(row[7]).trim()
      : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80';

    const tags = row[8]
      ? String(row[8])
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    const popular = String(row[9] || '').toLowerCase().includes('true');

    items.push({
      id,
      name,
      category,
      price,
      description,
      dietary,
      preparationTimeMinutes: prepTime,
      image,
      tags,
      popular,
      customizable: true,
    });
  }

  return { items, sheetTitle };
}

// 3. Update a product price or row directly in Google Sheets
export async function updateItemPriceInSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  sheetTitle: string,
  itemId: string,
  newPrice: number
): Promise<void> {
  // First, find the row index of the item
  const valuesRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      sheetTitle
    )}!A1:D100`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!valuesRes.ok) {
    throw new Error('Failed to find item in spreadsheet');
  }

  const valuesData = await valuesRes.json();
  const rows: any[][] = valuesData.values || [];

  let targetRowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i] && String(rows[i][0]).trim() === itemId) {
      targetRowIndex = i + 1; // 1-indexed in Sheets
      break;
    }
  }

  if (targetRowIndex === -1) {
    throw new Error(`Item ${itemId} not found in Google Sheet`);
  }

  // Update cell D[targetRowIndex] (Column 4 = Price)
  const cellRange = `${sheetTitle}!D${targetRowIndex}`;
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      cellRange
    )}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: cellRange,
        majorDimension: 'ROWS',
        values: [[newPrice]],
      }),
    }
  );

  if (!updateRes.ok) {
    const errorData = await updateRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to update price in Google Sheet');
  }
}
