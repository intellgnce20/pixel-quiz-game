/**
 * Google Apps Script 
 * 將此代碼貼上到與 Google 試算表綁定的 Apps Script 中
 * 請確保試算表包含兩個工作表："題目" 及 "回答"
 * "題目" 欄位：題號、題目、A、B、C、D、解答
 * "回答" 欄位：ID、闖關次數、總分、最高分、第一次通關分數、花了幾次通關、最近遊玩時間
 */

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getQuestions') {
      const count = parseInt(e.parameter.count || '5');
      const doc = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = doc.getSheetByName('題目');
      const data = sheet.getDataRange().getValues();
      
      // Remove header
      data.shift();
      
      // Shuffle array
      const shuffled = data.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);
      
      const questions = selected.map(row => ({
        qId: row[0].toString(),
        question: row[1].toString(),
        options: [
          { key: 'A', text: row[2].toString() },
          { key: 'B', text: row[3].toString() },
          { key: 'C', text: row[4].toString() },
          { key: 'D', text: row[5].toString() }
        ]
      }));
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, questions }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { action, id, answers } = payload;
    
    if (action === 'submit') {
      const doc = SpreadsheetApp.getActiveSpreadsheet();
      const qSheet = doc.getSheetByName('題目');
      const aSheet = doc.getSheetByName('回答');
      
      // Setup headers if not exist in '回答' (Optional safenet)
      if (aSheet.getLastRow() === 0) {
        aSheet.appendRow(['ID', '闖關次數', '總分', '最高分', '第一次通關分數', '花了幾次通關', '最近遊玩時間']);
      }

      // Load correct answers
      const qData = qSheet.getDataRange().getValues();
      qData.shift(); // remove header
      const answerMap = {};
      qData.forEach(row => {
        // row[0] is ID, row[6] is Correct Answer (A/B/C/D)
        answerMap[row[0].toString()] = row[6].toString(); 
      });
      
      // Grade submission
      let correctCount = 0;
      const totalQuestions = Object.keys(answers).length;
      Object.keys(answers).forEach(qId => {
        if (answerMap[qId] && answerMap[qId].toUpperCase() === answers[qId].toUpperCase()) {
          correctCount++;
        }
      });
      
      const score = Math.round((correctCount / totalQuestions) * 100) || 0;
      
      // Hardcode server pass threshold or assume frontend passes it. For safety, let's say 60 points or above is passing
      const passed = correctCount >= (payload.passThreshold || (totalQuestions * 0.6));
      
      // Find User in Answer Sheet
      const aData = aSheet.getDataRange().getValues();
      let rowIndex = -1;
      let userData = null;
      
      for (let i = 1; i < aData.length; i++) {
        if (aData[i][0].toString() === id.toString()) {
          rowIndex = i + 1; // +1 because array is 0-indexed and sheet is 1-indexed
          userData = {
            totalPlays: parseInt(aData[i][1] || 0),
            totalScore: parseInt(aData[i][2] || 0),
            maxScore: parseInt(aData[i][3] || 0),
            firstPassScore: aData[i][4] || null,
            attemptsToPass: aData[i][5] || null
          };
          break;
        }
      }
      
      const now = new Date().toLocaleString();
      
      if (rowIndex === -1) {
        // New User
        userData = {
          totalPlays: 1,
          totalScore: score,
          maxScore: score,
          firstPassScore: passed ? score : null,
          attemptsToPass: passed ? 1 : null
        };
        aSheet.appendRow([
          "'" + id,
          userData.totalPlays,
          userData.totalScore,
          userData.maxScore,
          userData.firstPassScore || '',
          userData.attemptsToPass || '',
          now
        ]);
      } else {
        // Existing User Update
        userData.totalPlays += 1;
        userData.totalScore += score;
        if (score > userData.maxScore) {
          userData.maxScore = score;
        }
        if (passed && !userData.firstPassScore) {
          userData.firstPassScore = score;
          userData.attemptsToPass = userData.totalPlays;
        }
        
        // Update row
        aSheet.getRange(rowIndex, 2, 1, 6).setValues([[
          userData.totalPlays,
          userData.totalScore,
          userData.maxScore,
          userData.firstPassScore || '',
          userData.attemptsToPass || '',
          now
        ]]);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        stats: {
          score,
          passed,
          totalPlays: userData.totalPlays,
          maxScore: userData.maxScore,
          firstPassScore: userData.firstPassScore,
          attemptsToPass: userData.attemptsToPass
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
