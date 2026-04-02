type Assignment = {
  teamName: string;
  position: number;
  playerName: string;
};

export function exportToPDF(
  assignments: Assignment[],
  team1Name: string,
  team2Name: string
) {
  // Create HTML table
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const team1Assignments = assignments
    .filter((a) => a.teamName === team1Name)
    .sort((a, b) => a.position - b.position);

  const team2Assignments = assignments
    .filter((a) => a.teamName === team2Name)
    .sort((a, b) => a.position - b.position);

  // Create HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 10px;
        }
        .date {
          font-size: 14px;
          color: #666;
        }
        .team-section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        .team-title {
          font-size: 20px;
          font-weight: bold;
          color: #1e40af;
          border-bottom: 3px solid #fbbf24;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background-color: #1e40af;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        tr:hover {
          background-color: #eff6ff;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">Lucky Draw - Match Results</div>
        <div class="date">Date: ${today}</div>
      </div>

      <div class="team-section">
        <div class="team-title">${team1Name}</div>
        <table>
          <thead>
            <tr>
              <th>Position</th>
              <th>Player Name</th>
            </tr>
          </thead>
          <tbody>
            ${team1Assignments.map((a) => `
              <tr>
                <td style="font-weight: bold; text-align: center;">${a.position}</td>
                <td>${a.playerName}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="team-section">
        <div class="team-title">${team2Name}</div>
        <table>
          <thead>
            <tr>
              <th>Position</th>
              <th>Player Name</th>
            </tr>
          </thead>
          <tbody>
            ${team2Assignments.map((a) => `
              <tr>
                <td style="font-weight: bold; text-align: center;">${a.position}</td>
                <td>${a.playerName}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;

  // Create a new window and print to PDF
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Trigger print dialog
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
