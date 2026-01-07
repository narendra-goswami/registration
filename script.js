/ ==========================================
// IMAGE LOADING FOR LOGOS
// ==========================================

// Load images (place binds-logo.png and apu-logo.png in same folder)
const workshopLogo = new Image();
workshopLogo.src = 'binds-logo.png';

const universityLogo = new Image();
universityLogo.src = 'apu-logo.png';

// ==========================================
// DATA MANAGEMENT (LocalStorage)
// ==========================================

const STORAGE_KEY = 'bindsWorkshopData';

let workshopData = {
    participants: [],
    attendance: {}
};

function initializeData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            workshopData = JSON.parse(stored);
            console.log('✅ Data loaded from localStorage');
        } catch (e) {
            console.error('Error parsing data:', e);
            workshopData = { participants: [], attendance: {} };
        }
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workshopData));
        console.log('✅ Data saved to localStorage');
        return true;
    } catch (e) {
        console.error('Error saving data:', e);
        showAlert('Failed to save data', 'error');
        return false;
    }
}

// ==========================================
// ALERT SYSTEM
// ==========================================

function showAlert(message, type = 'success') {
    const alertEl = document.getElementById('alert');
    alertEl.textContent = message;
    alertEl.className = `alert show alert-${type}`;
    
    setTimeout(() => {
        alertEl.classList.remove('show');
    }, 3000);
}

// ==========================================
// PAGE NAVIGATION
// ==========================================

function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.getAttribute('data-page');
            switchPage(page);
            
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.querySelectorAll('[data-page]').forEach(el => {
        if (el.classList.contains('btn')) {
            el.addEventListener('click', (e) => {
                const page = el.getAttribute('data-page');
                switchPage(page);
                
                const navBtn = document.querySelector(`.nav-btn[data-page="${page}"]`);
                if (navBtn) {
                    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                    navBtn.classList.add('active');
                }
            });
        }
    });
}

function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const page = document.getElementById(pageName);
    if (page) {
        page.classList.add('active');
        
        if (pageName === 'home') updateHomeStats();
        if (pageName === 'registration') loadParticipantsList();
        if (pageName === 'attendance') loadAttendanceSheet();
    }
}

// ==========================================
// HOME PAGE
// ==========================================

function updateHomeStats() {
    const totalParticipants = workshopData.participants.length;
    let totalAttended = 0;
    
    workshopData.participants.forEach(p => {
        if (workshopData.attendance[p.id] && workshopData.attendance[p.id].length > 0) {
            totalAttended++;
        }
    });

    document.getElementById('totalParticipants').textContent = totalParticipants;
    document.getElementById('totalAttendance').textContent = totalAttended;
}

// ==========================================
// REGISTRATION PAGE
// ==========================================

function setupRegistration() {
    document.getElementById('registrationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        registerParticipant();
    });

    document.getElementById('searchInput').addEventListener('keyup', searchParticipants);
}

function registerParticipant() {
    const name = document.getElementById('participantName').value.trim();
    const email = document.getElementById('participantEmail').value.trim();
    const institute = document.getElementById('participantInstitute').value.trim();

    if (!name || !email || !institute) {
        showAlert('Please fill all fields', 'error');
        return;
    }

    // ✅ FIX 5: Changed from padStart(4, '0') to padStart(2, '0') - ID format BINDS-00
    const id = 'BINDS-' + String(workshopData.participants.length + 1).padStart(2, '0');

    const participant = {
        id: id,
        name: name,
        email: email,
        institute: institute,
        registrationDate: new Date().toLocaleDateString('en-IN')
    };

    workshopData.participants.push(participant);
    workshopData.attendance[id] = [];

    if (saveData()) {
        showAlert(`✅ ${name} registered! ID: ${id}`, 'success');
        
        displayIdCard(participant);
        
        document.getElementById('registrationForm').reset();
        
        loadParticipantsList();
        updateHomeStats();
    }
}

function displayIdCard(participant) {
    const preview = document.getElementById('idCardPreview');
    document.getElementById('cardName').textContent = participant.name;
    document.getElementById('cardId').textContent = participant.id;

    document.getElementById('qrCodeContainer').innerHTML = '';
    
    new QRCode(document.getElementById('qrCodeContainer'), {
        text: participant.id,
        width: 150,
        height: 150,
        colorDark: '#2d7d6a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    preview.style.display = 'block';
    document.getElementById('downloadIdCard').style.display = 'block';
    
    document.getElementById('downloadIdCard').onclick = () => downloadIdCard(participant);
}

function downloadIdCard(participant) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#2d7d6a';
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    // Title
    ctx.fillStyle = '#2d7d6a';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🌿 BINDS – Chapter 2', canvas.width / 2, 50);

    // ✅ FIX 4: Logo placeholders (edit these to add actual logos)
    // LEFT SIDE: Workshop Logo placeholder
    ctx.strokeStyle = '#ddd';
    ctx.strokeRect(20, 30, 60, 60);
    ctx.fillStyle = '#ccc';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Logo', 50, 65);

    // RIGHT SIDE: University Logo placeholder
    ctx.strokeStyle = '#ddd';
    ctx.strokeRect(320, 30, 60, 60);
    ctx.fillStyle = '#ccc';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('APU Logo', 350, 65);

    // QR Code
    const qrImg = document.querySelector('#qrCodeContainer canvas');
    if (qrImg) {
        const qrCanvas = document.createElement('canvas');
        qrCanvas.width = qrImg.width;
        qrCanvas.height = qrImg.height;
        const qrCtx = qrCanvas.getContext('2d');
        qrCtx.drawImage(qrImg, 0, 0);
        
        ctx.drawImage(qrCanvas, (canvas.width - 150) / 2, 80, 150, 150);
    }

    // ✅ FIX 3: Simplified ID card (removed "Name:" and "ID:" labels)
    // Name (direct - no label)
    ctx.fillStyle = '#2d7d6a';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(participant.name, canvas.width / 2, 280);

    // ID (direct - no label)
    ctx.fillStyle = '#2d7d6a';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(participant.id, canvas.width / 2, 330);

    // Date and University info at bottom
    const today = new Date().toLocaleDateString('en-IN');
    ctx.fillStyle = '#999';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Azim Premji University, Bhopal', canvas.width / 2, 400);
    ctx.fillText('29-31 January 2026', canvas.width / 2, 415);

    // Download
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BINDS_ID_${participant.id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    showAlert('ID Card downloaded!', 'success');
}

// ✅ FIX 1: Function to download ID card from list
function downloadIdCardFromList(participantId, participantName) {
    const participant = workshopData.participants.find(p => p.id === participantId);
    if (participant) {
        downloadIdCard(participant);
    } else {
        showAlert('Participant not found', 'error');
    }
}

// ✅ FIX 1: Updated function with download button
function loadParticipantsList() {
    const tbody = document.getElementById('participantsList');
    
    if (workshopData.participants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">No participants registered yet</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    workshopData.participants.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${p.id}</strong></td>
            <td>${p.name}</td>
            <td>${p.email}</td>
            <td>${p.institute}</td>
            <td>
                <button class="btn btn-secondary" onclick="downloadIdCardFromList('${p.id}', '${p.name}')" style="font-size: 12px;">📥 ID</button>
                <button class="btn btn-secondary" onclick="deleteParticipant('${p.id}')" style="font-size: 12px;">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function searchParticipants() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const tbody = document.getElementById('participantsList');
    
    if (!search) {
        loadParticipantsList();
        return;
    }

    const filtered = workshopData.participants.filter(p =>
        p.name.toLowerCase().includes(search) || 
        p.id.toLowerCase().includes(search)
    );

    tbody.innerHTML = '';
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">No participants found</td></tr>';
        return;
    }

    filtered.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${p.id}</strong></td>
            <td>${p.name}</td>
            <td>${p.email}</td>
            <td>${p.institute}</td>
            <td>
                <button class="btn btn-secondary" onclick="downloadIdCardFromList('${p.id}', '${p.name}')" style="font-size: 12px;">📥 ID</button>
                <button class="btn btn-secondary" onclick="deleteParticipant('${p.id}')" style="font-size: 12px;">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteParticipant(id) {
    if (!confirm('Delete this participant?')) return;
    
    workshopData.participants = workshopData.participants.filter(p => p.id !== id);
    delete workshopData.attendance[id];
    
    if (saveData()) {
        showAlert('Participant deleted', 'success');
        loadParticipantsList();
        updateHomeStats();
    }
}

// ==========================================
// ATTENDANCE PAGE
// ==========================================

let qrScanner = null;

function setupAttendance() {
    const startBtn = document.getElementById('startQrScan');
    const stopBtn = document.getElementById('stopQrScan');
    
    if (startBtn) startBtn.addEventListener('click', startQrScanner);
    if (stopBtn) stopBtn.addEventListener('click', stopQrScanner);
}

// ✅ FIX 2: Improved QR Scanner with better error handling
function startQrScanner() {
    const sessionSelect = document.getElementById('sessionSelect');
    if (!sessionSelect || !sessionSelect.value) {
        showAlert('Please select a session first', 'error');
        return;
    }

    const container = document.getElementById('qrScannerContainer');
    if (!container) {
        console.error('❌ qrScannerContainer not found');
        showAlert('QR Scanner container missing', 'error');
        return;
    }
    
    container.style.display = 'block';

    try {
        console.log('📱 Starting QR Scanner...');
        
        const scanner = new Html5QrcodeScanner('qrScanner', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastCamera: true,
            aspectRatio: 1.0
        });

        scanner.render(success, error);

        function success(decodedText) {
            console.log('✅ QR decoded:', decodedText);
            markAttendanceByQr(decodedText);
            scanner.clear();
            document.getElementById('qrScannerContainer').style.display = 'none';
            document.getElementById('startQrScan').style.display = 'block';
            document.getElementById('stopQrScan').style.display = 'none';
        }

        function error(err) {
            console.log('⚠️ QR Scanner error:', err);
        }

        qrScanner = scanner;
        document.getElementById('startQrScan').style.display = 'none';
        document.getElementById('stopQrScan').style.display = 'block';
    } catch (err) {
        console.error('❌ QR Scanner error:', err);
        showAlert('Camera access denied or QR scanner not supported', 'error');
        document.getElementById('qrScannerContainer').style.display = 'none';
    }
}

function stopQrScanner() {
    if (qrScanner) {
        qrScanner.clear();
    }
    document.getElementById('qrScannerContainer').style.display = 'none';
    document.getElementById('startQrScan').style.display = 'block';
    document.getElementById('stopQrScan').style.display = 'none';
}

function markAttendanceByQr(participantId) {
    const session = document.getElementById('sessionSelect').value;
    if (!session) {
        showAlert('Please select a session', 'error');
        return;
    }

    const participant = workshopData.participants.find(p => p.id === participantId);
    if (!participant) {
        showAlert('Participant not found', 'error');
        return;
    }

    if (!workshopData.attendance[participantId]) {
        workshopData.attendance[participantId] = [];
    }

    if (!workshopData.attendance[participantId].includes(session)) {
        workshopData.attendance[participantId].push(session);
        
        if (saveData()) {
            showAlert(`✅ ${participant.name} marked present for ${session}`, 'success');
            loadAttendanceSheet();
            updateHomeStats();
        }
    } else {
        showAlert('Already marked for this session', 'info');
    }
}

function markAttendanceManual() {
    const participantId = document.getElementById('manualParticipantId').value.trim().toUpperCase();
    const session = document.getElementById('sessionSelect').value;

    if (!participantId || !session) {
        showAlert('Please enter ID and select session', 'error');
        return;
    }

    markAttendanceByQr(participantId);
    document.getElementById('manualParticipantId').value = '';
}

function loadAttendanceSheet() {
    const tbody = document.getElementById('attendanceTable');
    
    if (workshopData.participants.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #999;">No participants yet</td></tr>';
        return;
    }

    const sessions = [
        'Day1-Morning', 'Day1-Afternoon',
        'Day2-Morning', 'Day2-Afternoon',
        'Day3-Morning', 'Day3-Afternoon'
    ];

    tbody.innerHTML = '';
    workshopData.participants.forEach(p => {
        const row = document.createElement('tr');
        let totalSessions = 0;

        let sessionCells = '';
        sessions.forEach(session => {
            const attended = workshopData.attendance[p.id] && workshopData.attendance[p.id].includes(session);
            if (attended) totalSessions++;
            sessionCells += `<td style="text-align: center;">${attended ? '✅' : '✖️'}</td>`;
        });

        row.innerHTML = `
            <td><strong>${p.id}</strong></td>
            <td>${p.name}</td>
            ${sessionCells}
            <td style="text-align: center;"><strong>${totalSessions}</strong></td>
        `;
        tbody.appendChild(row);
    });
}

function downloadAttendanceSheet() {
    if (workshopData.participants.length === 0) {
        showAlert('No participants to download', 'error');
        return;
    }

    const sessions = [
        'Day1-Morning', 'Day1-Afternoon',
        'Day2-Morning', 'Day2-Afternoon',
        'Day3-Morning', 'Day3-Afternoon'
    ];

    let csv = 'Participant ID,Name,Email,Institute,' + sessions.join(',') + ',Total Sessions\n';

    workshopData.participants.forEach(p => {
        let totalSessions = 0;
        let sessionData = '';

        sessions.forEach(session => {
            const attended = workshopData.attendance[p.id] && workshopData.attendance[p.id].includes(session);
            if (attended) totalSessions++;
            sessionData += (attended ? '1' : '0') + ',';
        });

        csv += `"${p.id}","${p.name}","${p.email}","${p.institute}",${sessionData}${totalSessions}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BINDS_Attendance_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showAlert('Attendance sheet downloaded!', 'success');
}

// ==========================================
// DATA EXPORT & IMPORT (Backup/Restore) - FIX 6
// ==========================================

function exportAllData() {
    const backup = {
        exportDate: new Date().toLocaleString('en-IN'),
        workshopName: 'BINDS – Chapter 2',
        participants: workshopData.participants,
        attendance: workshopData.attendance
    };

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BINDS_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showAlert('✅ Complete backup exported!', 'success');
}

function importAllData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const imported = JSON.parse(event.target.result);
                
                if (!imported.participants) {
                    showAlert('❌ Invalid backup file', 'error');
                    return;
                }

                if (confirm(`Import ${imported.participants.length} participants and attendance data?`)) {
                    workshopData.participants = imported.participants;
                    workshopData.attendance = imported.attendance || {};
                    
                    if (saveData()) {
                        showAlert('✅ Data restored successfully!', 'success');
                        location.reload();
                    }
                }
            } catch (error) {
                showAlert('❌ Error reading backup file: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 BINDS System Initializing...');
    
    initializeData();
    
    setupNavigation();
    setupRegistration();
    setupAttendance();
    
    updateHomeStats();
    loadParticipantsList();
    loadAttendanceSheet();
    
    console.log('✅ System ready with all 6 fixes applied');
});
