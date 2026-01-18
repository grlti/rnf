
// State
let services = [];
let myChart = null;

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderDashboard();
    renderTable();
});

// Load Data
function loadData() {
    const saved = localStorage.getItem('scs_services_data');
    if (saved) {
        services = JSON.parse(saved);
        console.log("Loaded from LocalStorage");
    } else {
        // From initial-data.js
        if (typeof initialData !== 'undefined') {
            services = [...initialData];
            saveData();
            console.log("Loaded from Initial Data");
        }
    }
}

// Save Data
function saveData() {
    localStorage.setItem('scs_services_data', JSON.stringify(services));
    updateUI();
}

function updateUI() {
    renderDashboard();
    renderTable();
}

// Navigation
function switchTab(tab) {
    document.querySelectorAll('.view').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    if (tab === 'dashboard') {
        document.getElementById('dashboard-view').style.display = 'block';
        document.querySelector('button[onclick="switchTab(\'dashboard\')"]').classList.add('active');
        document.getElementById('page-title').innerText = 'Dashboard';
        renderCharts(); // Re-render chart to fit container
    } else {
        document.getElementById('services-view').style.display = 'block';
        document.querySelector('button[onclick="switchTab(\'services\')"]').classList.add('active');
        document.getElementById('page-title').innerText = 'Gerenciar Serviços';
    }
}

// Dashboard Logic
function renderDashboard() {
    const total = services.length;
    const totalQty = services.reduce((acc, curr) => acc + (parseFloat(curr.quantity) || 0), 0);

    document.getElementById('total-services').innerText = total;
    document.getElementById('total-quantity').innerText = totalQty.toLocaleString('pt-BR');
    // document.getElementById('top-client').innerText = topClient; // Element removed for legend

    renderCharts();
}

// Chart Logic
function renderCharts() {
    const ctx = document.getElementById('servicesChart').getContext('2d');

    // Custom Mapping configuration
    const mapService = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('agencia') || t.includes('agência')) return 'Atendimento a Agência';
        if (t.includes('bdn')) return 'Atendimento a BDN';
        if (t.includes('sicoob')) return 'Atendimentos Sicoobs'; // User asked for 'Atendimentos Sicoobs' (plural/typo check?) -> 'Atendimentos Sicoobs'
        if (t.includes('saq') || t.includes('dep')) return 'Depósitos e Saques';
        if (t.includes('tecnico') || t.includes('técnico')) return 'Atendimento Técnico';
        return 'Atendimento Técnico'; // Default fallback? Or 'Outros'? Let's assume others are Technical based on request implication or default to Technical
    };

    const colorMap = {
        'Atendimento a Agência': '#2563eb', // Azul (Blue)
        'Atendimento a BDN': '#10b981',    // Verde (Green)
        'Atendimento Técnico': '#d2b48c',  // Bege (Tan/Beige) - using hex for visible beige
        'Depósitos e Saques': '#fbcfe8',   // Rosa claro (Light Pink)
        'Atendimentos Sicoobs': '#9ca3af'  // Cinza (Gray)
    };

    // Pre-fill categories to ensure specific order in legend/chart if desired
    const categories = [
        'Atendimento a Agência',
        'Atendimento a BDN',
        'Atendimento Técnico',
        'Depósitos e Saques',
        'Atendimentos Sicoobs'
    ];

    const typeData = {};
    categories.forEach(c => typeData[c] = 0);

    services.forEach(s => {
        const mappedType = mapService(s.serviceType);
        if (typeData.hasOwnProperty(mappedType)) {
            typeData[mappedType] += (parseFloat(s.quantity) || 0);
        } else {
            // If something falls outside, put in Technical or ignore? 
            // Let's put in 'Atendimento Técnico' as generic bucket if not matched implies technical support?
            // Or add dynamic key? User requested specific legend. Let's stick to fixed keys.
            typeData['Atendimento Técnico'] += (parseFloat(s.quantity) || 0);
        }
    });

    const labels = categories;
    const data = labels.map(l => typeData[l]);
    const backgroundColors = labels.map(l => colorMap[l]);

    if (myChart) {
        myChart.destroy();
    }

    // Register Plugin
    Chart.register(ChartDataLabels);

    myChart = new Chart(ctx, {
        type: 'bar', // User asked for graph similar to doc. If doc was pie, we'd change. Assuming Bar kept.
        data: {
            labels: labels,
            datasets: [{
                label: 'Qtd',
                data: data,
                backgroundColor: backgroundColors,
                borderRadius: 4,
                borderWidth: 1,
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    color: '#000000', // Changed to black for better visibility/boldness
                    font: {
                        weight: 'bold',
                        size: 12 // Slightly larger
                    },
                    formatter: Math.round
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 20 // Add padding for labels
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12 }
                    }
                },
                title: { display: true, text: 'Visão Geral de Serviços' },
                tooltip: {
                    enabled: true
                },
                datalabels: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grace: '5%' // Add space on top of y-axis
                }
            }
        }
    });
}

// Table Logic
function renderTable() {
    const tbody = document.getElementById('servicesTableBody');
    const filter = document.getElementById('searchInput').value.toLowerCase();

    tbody.innerHTML = '';

    const filtered = services.filter(s =>
        (s.client && s.client.toLowerCase().includes(filter)) ||
        (s.serviceType && s.serviceType.toLowerCase().includes(filter)) ||
        (s.serviceId && String(s.serviceId).includes(filter))
    );

    filtered.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(s.date)}</td>
            <td>${s.serviceType}</td>
            <td>${s.serviceId || '-'}</td>
            <td>${s.client}</td>
            <td>${s.quantity}</td>
            <td>
                <button class="action-btn" onclick="deleteService(${s.id})">
                    <span class="material-icons-round">delete</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterTable() {
    renderTable();
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    // dateStr is YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    return dateStr;
}

// CRUD
function deleteService(id) {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
        services = services.filter(s => s.id !== id);
        saveData();
    }
}

function openModal() {
    document.getElementById('serviceModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('serviceModal').style.display = 'none';
}

function handleFormSubmit(e) {
    e.preventDefault();

    const newService = {
        id: Date.now(),
        date: document.getElementById('inputDate').value,
        serviceType: document.getElementById('inputType').value,
        serviceId: document.getElementById('inputId').value,
        client: document.getElementById('inputClient').value,
        quantity: parseFloat(document.getElementById('inputQuantity').value)
    };

    services.unshift(newService); // Add to top
    saveData();
    closeModal();
    document.getElementById('serviceForm').reset();

    // Switch to list view to see it
    switchTab('services');
}

// Logo Base64 Placeholder (will be replaced by build script or manual injection)
const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAAB9CAYAAACce+6UAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjM3OTdFNDBEQkQxMTFFOTk1RjdFQUM2MDYxMDg5NTUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjM3OTdFM0ZEQkQxMTFFOTk1RjdFQUM2MDYxMDg5NTUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OThEMUFCRTRDOTBFMTFFOUI2RjlDRENGOTBFNkFCQUMiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OThEMUFCRTVDOTBFMTFFOUI2RjlDRENGOTBFNkFCQUMiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7nGzmpAAA2wUlEQVR42ux9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"; // I will inject the base64 here

// PDF Export
async function exportPDF() {
    let element;
    let titlePrefix;

    if (document.getElementById('dashboard-view').style.display !== 'none') {
        element = document.getElementById('dashboard-view');
        titlePrefix = "Dashboard";
    } else if (document.getElementById('services-view').style.display !== 'none') {
        const tableCard = document.querySelector('#services-view .table-card');
        element = tableCard;
        titlePrefix = "Lista de Serviços";
    } else {
        alert("Nenhuma visualização ativa para exportar.");
        return;
    }

    const originalBtnText = document.querySelector('button[onclick="exportPDF()"]').innerHTML;
    document.querySelector('button[onclick="exportPDF()"]').innerHTML = 'Gerando...';

    try {
        const { jsPDF } = window.jspdf;
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Add Logo to Header
        try {
            if (LOGO_BASE64 && LOGO_BASE64.startsWith('data:image')) {
                // Add logo with fixed width/height ratio
                // We assume the logo is roughly 3:1 or rectangular. 
                // Let's use 25mm width and 8mm height approx.
                pdf.addImage(LOGO_BASE64, 'PNG', 10, 5, 25, 8);

                // Adjust text position
                pdf.setFontSize(16);
                pdf.text(`RENAFORTE - ${titlePrefix}`, 38, 12);
                pdf.setFontSize(10);
                pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 38, 18);
            } else {
                // Fallback (try to get from DOM if placeholder is still there or empty)
                pdf.setFontSize(16);
                pdf.text(`RENAFORTE - ${titlePrefix}`, 10, 10);
                pdf.setFontSize(10);
                pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 10, 16);
            }
        } catch (e) {
            console.error("Error adding logo to PDF:", e);
            pdf.setFontSize(16);
            pdf.text(`RENAFORTE - ${titlePrefix}`, 10, 10);
        }

        // Add Image
        pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);

        pdf.save(`Relatorio_${titlePrefix.replace(/\s+/g, '_')}.pdf`);

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF.");
    } finally {
        document.querySelector('button[onclick="exportPDF()"]').innerHTML = originalBtnText;
    }
}
