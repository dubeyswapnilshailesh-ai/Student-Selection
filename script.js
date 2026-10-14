/* =========================================================
   STUDENT RESULT DECISION SYSTEM
   Simulates GNU Sim8085 concepts:
   - Registers A, B
   - Flags: Zero (Z), Carry (CY)
   - CMP instruction, conditional jumps
   ========================================================= */

(function () {
    'use strict';

    /* ---------- DOM ELEMENTS ---------- */
    const studentNameInput = document.getElementById('studentName');
    const rollNumberInput  = document.getElementById('rollNumber');

    const mathInput = document.getElementById('mathMarks');
    const sciInput  = document.getElementById('sciMarks');
    const engInput  = document.getElementById('engMarks');
    const compInput = document.getElementById('compMarks');
    const phyInput  = document.getElementById('phyMarks');
    const chemInput = document.getElementById('chemMarks');

    const regAEl = document.getElementById('regA');
    const regBEl = document.getElementById('regB');
    const zeroFlagEl = document.getElementById('zeroFlag');
    const carryFlagEl = document.getElementById('carryFlag');

    const totalMarksEl     = document.getElementById('totalMarks');
    const percentageEl     = document.getElementById('percentage');
    const passFailEl       = document.getElementById('passFail');
    const gradeDisplayEl   = document.getElementById('gradeDisplay');
    const studentDisplayEl = document.getElementById('studentDisplay');
    const subjectPillsEl   = document.getElementById('subjectPills');
    const failedSubjectsContainer = document.getElementById('failedSubjectsContainer');

    const calcBtn   = document.getElementById('calcBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const resetBtn  = document.getElementById('resetBtn');

    /* ---------- SUBJECT DEFINITIONS ---------- */
    const SUBJECTS = [
        { name: 'Mathematics', key: 'math', input: mathInput },
        { name: 'Science',     key: 'sci',  input: sciInput  },
        { name: 'English',     key: 'eng',  input: engInput  },
        { name: 'Computer',    key: 'comp', input: compInput },
        { name: 'Physics',     key: 'phy',  input: phyInput  },
        { name: 'Chemistry',   key: 'chem', input: chemInput }
    ];

    const PASS_MARK = 33;   // minimum per-subject passing marks
    const MAX_TOTAL = SUBJECTS.length * 100;

    /* =========================================================
       UTILITIES
       ========================================================= */
    function clampValue(val) {
        let n = parseInt(val, 10);
        if (isNaN(n) || n < 0) n = 0;
        if (n > 100) n = 100;
        return n;
    }

    function escapeHtml(text) {
        if (!text) return '';
        return text.replace(/[&<>"]/g, function (m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return m;
        });
    }

    /* =========================================================
       READ MARKS (with clamping)
       ========================================================= */
    function getMarks() {
        return SUBJECTS.map(function (sub) {
            const val = clampValue(sub.input.value);
            sub.input.value = val;
            return { name: sub.name, key: sub.key, marks: val };
        });
    }

    /* =========================================================
       UPDATE 8085 REGISTERS + FLAGS (CMP A, B)
       ---------------------------------------------------------
       For educational demo we compare:
         Register A = Mathematics marks
         Register B = Physics marks
       Then set:
         Z  = 1 if A == B
         CY = 1 if A < B
       ========================================================= */
    function update8085Registers(marksArray) {
        const math = marksArray.find(s => s.key === 'math');
        const phy  = marksArray.find(s => s.key === 'phy');
        const A = math ? math.marks : 0;
        const B = phy  ? phy.marks  : 0;

        regAEl.textContent = A;
        regBEl.textContent = B;

        // 8085 CMP A, B effect on flags
        const zeroFlag  = (A === B) ? 1 : 0;
        const carryFlag = (A <  B) ? 1 : 0;

        zeroFlagEl.textContent = zeroFlag;
        carryFlagEl.textContent = carryFlag;

        zeroFlagEl.classList.toggle('zero-active', zeroFlag === 1);
        carryFlagEl.classList.toggle('carry-active', carryFlag === 1);
    }

    /* =========================================================
       GRADE CALCULATION
       ========================================================= */
    function calculateGrade(percentage, isPass) {
        if (!isPass) return 'F';
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 50) return 'D';
        if (percentage >= 33) return 'E';
        return 'F';
    }

    /* =========================================================
       MAIN COMPUTE + RENDER
       ========================================================= */
    function computeAndDisplay() {
        const marksArray = getMarks();

        /* ----- Total & Percentage ----- */
        const totalMarks = marksArray.reduce((sum, s) => sum + s.marks, 0);
        const percentage = (totalMarks / MAX_TOTAL) * 100;

        /* ----- Failed subjects (below 33) ----- */
        const failedSubjects = marksArray.filter(s => s.marks < PASS_MARK);
        const isPass = failedSubjects.length === 0;

        /* ----- Grade ----- */
        const grade = calculateGrade(percentage, isPass);

        /* ----- Update 8085 register / flag panel ----- */
        update8085Registers(marksArray);

        /* ----- Student display ----- */
        const studentName = studentNameInput.value.trim() || '—';
        const rollNo      = rollNumberInput.value.trim() || '—';
        studentDisplayEl.innerHTML =
            '<span><i class="fas fa-user"></i> ' + escapeHtml(studentName) + '</span>' +
            '<span><i class="fas fa-hashtag"></i> ' + escapeHtml(rollNo) + '</span>';

        /* ----- Total / Percentage ----- */
        totalMarksEl.textContent = totalMarks + ' / ' + MAX_TOTAL;
        percentageEl.textContent = percentage.toFixed(1) + '%';

        /* ----- Pass / Fail badge ----- */
        if (isPass) {
            passFailEl.innerHTML = '<span class="badge pass"><i class="fas fa-check-circle"></i> PASS</span>';
        } else {
            passFailEl.innerHTML = '<span class="badge fail"><i class="fas fa-times-circle"></i> FAIL</span>';
        }

        /* ----- Grade badge ----- */
        let gradeClass = 'badge ';
        if (!isPass || grade === 'F') gradeClass += 'fail';
        else if (grade === 'A+' || grade === 'A') gradeClass += 'grade-a';
        else gradeClass += 'pass';
        gradeDisplayEl.innerHTML = '<span class="' + gradeClass + '">' + grade + '</span>';

        /* ----- Subject pills ----- */
        subjectPillsEl.innerHTML = '';
        marksArray.forEach(function (sub) {
            const isFail = sub.marks < PASS_MARK;
            const pill = document.createElement('div');
            pill.className = 'subject-pill' + (isFail ? ' fail-pill' : '');
            pill.innerHTML =
                '<i class="fas ' + (isFail ? 'fa-exclamation-circle' : 'fa-check-circle') + '"></i> ' +
                sub.name + ': ' + sub.marks;
            subjectPillsEl.appendChild(pill);
        });

        /* ----- Failed subjects banner ----- */
        if (failedSubjects.length > 0) {
            const names = failedSubjects.map(s => s.name).join(', ');
            failedSubjectsContainer.innerHTML =
                '<div class="failed-subjects">' +
                    '<i class="fas fa-exclamation-triangle"></i>' +
                    '<span><strong>Failed in:</strong> ' + escapeHtml(names) +
                    ' (below ' + PASS_MARK + ')</span>' +
                '</div>';
        } else {
            failedSubjectsContainer.innerHTML = '';
        }
    }

    /* =========================================================
       SAMPLE DATA
       ========================================================= */
    function loadSampleData() {
        studentNameInput.value = 'Rohan Kumar';
        rollNumberInput.value  = '2024CS101';
        mathInput.value = 85;
        sciInput.value  = 78;
        engInput.value  = 92;
        compInput.value = 88;
        phyInput.value  = 45;
        chemInput.value = 73;
        computeAndDisplay();
    }

    /* =========================================================
       RESET DATA
       ========================================================= */
    function resetData() {
        studentNameInput.value = '';
        rollNumberInput.value  = '';
        mathInput.value = '';
        sciInput.value  = '';
        engInput.value  = '';
        compInput.value = '';
        phyInput.value  = '';
        chemInput.value = '';
        computeAndDisplay();
    }

    /* =========================================================
       EVENT LISTENERS
       ========================================================= */
    calcBtn.addEventListener('click', computeAndDisplay);
    sampleBtn.addEventListener('click', loadSampleData);
    resetBtn.addEventListener('click', resetData);

    /* Recalculate on Enter key inside any input */
    const allInputs = [
        studentNameInput, rollNumberInput,
        mathInput, sciInput, engInput,
        compInput, phyInput, chemInput
    ];

    allInputs.forEach(function (inp) {
        inp.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                computeAndDisplay();
            }
        });
        inp.addEventListener('change', computeAndDisplay);
    });

    /* =========================================================
       INITIAL LOAD
       ========================================================= */
    loadSampleData();

})();