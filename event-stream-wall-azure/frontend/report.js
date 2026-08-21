let reportRows = [];

function addCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value || "";
  row.append(cell);
}

function renderReport(rows) {
  const body = document.querySelector("#report-body");
  body.replaceChildren();
  rows.forEach((item) => {
    const row = document.createElement("tr");
    addCell(row, item.name);
    addCell(row, item.futureExhibitionWish);
    addCell(row, item.aiWish);
    addCell(row, item.feedback);
    addCell(row, new Date(item.submittedAt).toLocaleString());
    body.append(row);
  });
  document.querySelector("#row-count").textContent = `${rows.length} responses`;
  document.querySelector("#report-content").hidden = false;
}

async function loadReport() {
  const status = document.querySelector("#report-status");
  status.textContent = "Loading…";
  try {
    if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      reportRows = window.LOCAL_DEMO_RESPONSES || [];
    } else {
      const response = await fetch("/api/report", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load report");
      reportRows = data.rows || [];
    }
    renderReport(reportRows);
    status.textContent = "Report loaded.";
  } catch (error) {
    document.querySelector("#report-content").hidden = true;
    status.textContent = error.message;
  }
}

document.querySelector("#excel-button").addEventListener("click", () => {
  const rows = reportRows.map((item) => ({
    Name: item.name,
    "Future Tribe exhibition wish": item.futureExhibitionWish,
    "AI wish list": item.aiWish,
    "Data & AI action pledge": item.feedback,
    "Submitted at": new Date(item.submittedAt).toLocaleString()
  }));
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = [{ wch: 22 }, { wch: 40 }, { wch: 48 }, { wch: 48 }, { wch: 24 }];
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Responses");
  XLSX.writeFile(book, `tma-tribe-2026-responses-${new Date().toISOString().slice(0, 10)}.xlsx`);
});

void loadReport();
