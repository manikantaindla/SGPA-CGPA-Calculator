function selectMode(mode) {
  document.getElementById('modeSelection').style.display = 'none';
  document.getElementById('result').innerHTML = '';
  document.getElementById('exportPdfBtn').classList.add('hidden');

  if (mode === 'sgpa') {
    document.getElementById('sgpaForm').classList.remove('hidden');
    addSubject();
  } else {
    document.getElementById('cgpaForm').classList.remove('hidden');
  }
}

function addSubject() {
  const container = document.getElementById('subjectInputs');
  const row = document.createElement('div');
  row.className = 'subject-row';
  row.innerHTML = `
    <input type="text" placeholder="Subject Name" required>
    <select>
      <option value="10">O</option>
      <option value="9">A+</option>
      <option value="8">A</option>
      <option value="7">B+</option>
      <option value="6">B</option>
      <option value="5">C</option>
      <option value="0">F</option>
    </select>
    <input type="number" placeholder="Credits" min="1" max="5" required>
    <button onclick="removeRow(this)">🗑️</button>
  `;
  container.appendChild(row);
}

function calculateSGPA() {
  const rows = document.querySelectorAll('#subjectInputs .subject-row');
  let totalPoints = 0, totalCredits = 0;

  rows.forEach(row => {
    const grade = parseFloat(row.children[1].value);
    const credits = parseFloat(row.children[2].value);
    if (!isNaN(grade) && !isNaN(credits)) {
      totalPoints += grade * credits;
      totalCredits += credits;
    }
  });

  const sgpa = totalCredits ? (totalPoints / totalCredits).toFixed(2) : 0;
  document.getElementById('result').innerHTML = `<h3>SGPA: ${sgpa}</h3>`;
  document.getElementById('exportPdfBtn').classList.remove('hidden');
  sessionStorage.setItem('result', `SGPA: ${sgpa}`);

  // Show feedback popup after calculation
  setTimeout(() => {
    document.getElementById('feedbackPopup').classList.add('visible');
  }, 3000);
}

function generateSemesterInputs() {
  const count = parseInt(document.getElementById('numSem').value);
  const container = document.getElementById('cgpaInputs');
  container.innerHTML = '';

  for (let i = 1; i <= count; i++) {
    const row = document.createElement('div');
    row.className = 'subject-row';
    row.innerHTML = `
      <input type="text" value="Semester ${i}" disabled>
      <input type="number" placeholder="SGPA" min="0" max="10" required>
    `;
    container.appendChild(row);
  }
}

function calculateCGPA() {
  const rows = document.querySelectorAll('#cgpaInputs .subject-row');
  let total = 0;

  rows.forEach(row => {
    const sgpa = parseFloat(row.children[1].value);
    if (!isNaN(sgpa)) total += sgpa;
  });

  const cgpa = rows.length ? (total / rows.length).toFixed(2) : 0;
  document.getElementById('result').innerHTML = `<h3>CGPA: ${cgpa}</h3>`;
  document.getElementById('exportPdfBtn').classList.remove('hidden');
  sessionStorage.setItem('result', `CGPA: ${cgpa}`);

  // Show feedback popup after calculation
  setTimeout(() => {
    document.getElementById('feedbackPopup').classList.add('visible');
  }, 3000);
}

function removeRow(btn) {
  btn.parentElement.remove();
}

function goBack() {
  document.getElementById('sgpaForm').classList.add('hidden');
  document.getElementById('cgpaForm').classList.add('hidden');
  document.getElementById('modeSelection').style.display = 'block';
  document.getElementById('subjectInputs').innerHTML = '';
  document.getElementById('cgpaInputs').innerHTML = '';
  document.getElementById('numSem').value = '';
  document.getElementById('result').innerHTML = '';
  document.getElementById('exportPdfBtn').classList.add('hidden');
}

function showFeedbackPopup() {
  document.getElementById('feedbackPopup').classList.add('visible');
}

function closeFeedback() {
  document.getElementById('feedbackPopup').classList.remove('visible');
}

// Dismiss on outside click
document.getElementById('feedbackPopup').addEventListener('click', (e) => {
  if (e.target.id === 'feedbackPopup') closeFeedback();
});

// Handle feedback submission
document.getElementById('feedbackForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new FormData(this);

  fetch(this.action, {
    method: 'POST',
    body: formData
  }).then(() => {
    closeFeedback();
    this.reset();
  }).catch(console.error);
});

// Toggle Dark Mode
function toggleTheme() {
  const currentTheme = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', currentTheme ? 'dark' : 'light');
}

// Check for saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
});

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const mode = document.getElementById('sgpaForm').classList.contains('hidden') ? 'cgpa' : 'sgpa';
  let y = 20;

  doc.setFontSize(16);
  doc.text("Result Summary", 80, y);
  y += 10;

  if (mode === 'sgpa') {
    const rows = document.querySelectorAll('#subjectInputs .subject-row');

    doc.setFontSize(12);
    doc.text("Subjects and Grades:", 14, y);
    y += 6;

    // Table headers
    doc.setFont("helvetica", "bold");
    doc.text("Subject", 14, y);
    doc.text("Grade", 70, y);
    doc.text("Credits", 120, y);
    doc.setFont("helvetica", "normal");
    y += 10;

    rows.forEach(row => {
      const subject = row.children[0].value || "-";
      const grade = row.children[1].options[row.children[1].selectedIndex].text;
      const credit = row.children[2].value || "-";

      doc.text(subject, 14, y);
      doc.text(grade, 70, y);
      doc.text(credit, 120, y);
      y += 6;
    });

    y += 10;

    // SGPA
    const sgpa = sessionStorage.getItem('result') || '';
    doc.setFont("helvetica", "bold");
    doc.text(`SGPA: ${sgpa}`, 14, y);

  } else if (mode === 'cgpa') {
    const rows = document.querySelectorAll('#cgpaInputs .subject-row');

    doc.setFontSize(12);
    doc.text("Semester and SGPA:", 14, y);
    y += 6;

    // Table headers
    doc.setFont("helvetica", "bold");
    doc.text("Semester", 14, y);
    doc.text("SGPA", 80, y);
    doc.setFont("helvetica", "normal");
    y += 10;

    rows.forEach((row, i) => {
      const name = row.children[0].value || `Semester ${i + 1}`;
      const sgpa = row.children[1].value || "-";

      doc.text(name, 14, y);
      doc.text(sgpa, 80, y);
      y += 6;
    });

    y += 10;

    // CGPA
    const cgpa = sessionStorage.getItem('result') || '';
    doc.setFont("helvetica", "bold");
    doc.text(`CGPA: ${cgpa}`, 14, y);
  }

  doc.save("Result.pdf");
}
