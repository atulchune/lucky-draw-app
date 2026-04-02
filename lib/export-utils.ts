type Assignment = {
  teamName: string;
  position: number;
  playerName: string;
};

export function generateTextFormat(
  assignments: Assignment[],
  team1Name: string,
  team2Name: string
): string {
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

  let text = `🎯 LUCKY DRAW - ${today}\n\n`;
  
  if (team1Assignments.length > 0) {
    text += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `${team1Name.toUpperCase()}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    team1Assignments.forEach((assignment) => {
      text += `Position ${assignment.position}: ${assignment.playerName}\n`;
    });
    text += '\n';
  }

  if (team2Assignments.length > 0) {
    text += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `${team2Name.toUpperCase()}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
    team2Assignments.forEach((assignment) => {
      text += `Position ${assignment.position}: ${assignment.playerName}\n`;
    });
  }

  return text;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function generatePrintableHTML(
  assignments: Assignment[],
  team1Name: string,
  team2Name: string
): string {
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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Lucky Draw Results</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #1e293b;
          font-size: 32px;
          margin-bottom: 10px;
        }
        .header p {
          color: #64748b;
          font-size: 16px;
        }
        .teams-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 30px;
        }
        .team-box {
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          background: #f8fafc;
        }
        .team-name {
          font-size: 20px;
          font-weight: 700;
          color: white;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 15px;
          text-align: center;
        }
        .team1 .team-name {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
        }
        .team2 .team-name {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }
        .position-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .position-item:last-child {
          border-bottom: none;
        }
        .position-number {
          font-weight: 700;
          font-size: 18px;
          color: #3b82f6;
          min-width: 50px;
        }
        .player-name {
          font-size: 16px;
          color: #334155;
          flex: 1;
          text-align: right;
        }
        @media (max-width: 600px) {
          .teams-section {
            grid-template-columns: 1fr;
          }
          .container {
            padding: 20px;
          }
          .header h1 {
            font-size: 24px;
          }
        }
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .container {
            box-shadow: none;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Lucky Draw Results</h1>
          <p>Date: ${today}</p>
        </div>
        
        <div class="teams-section">
          <div class="team-box team1">
            <div class="team-name">${team1Name}</div>
            ${team1Assignments
              .map(
                (a) =>
                  `<div class="position-item">
                    <span class="position-number">Pos ${a.position}</span>
                    <span class="player-name">${a.playerName}</span>
                  </div>`
              )
              .join('')}
          </div>
          
          <div class="team-box team2">
            <div class="team-name">${team2Name}</div>
            ${team2Assignments
              .map(
                (a) =>
                  `<div class="position-item">
                    <span class="position-number">Pos ${a.position}</span>
                    <span class="player-name">${a.playerName}</span>
                  </div>`
              )
              .join('')}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function printPDF(assignments: Assignment[], team1Name: string, team2Name: string) {
  const html = generatePrintableHTML(assignments, team1Name, team2Name);
  const printWindow = window.open('', '', 'height=600,width=800');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}
