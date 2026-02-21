// app.js
// Ana uygulama: tablo oluşturma, buton yönetimi, global fonksiyonlar
(function() {
    'use strict';

    // --- DOM elementleri ---
    const moduleButtons      = document.querySelectorAll('.module-btn');
    const tableContainer     = document.getElementById('tableContainer');
    const tableTitle         = document.getElementById('tableTitle');
    const tabulatorContainer = document.getElementById('tabulator-table');
    const loadingIndicator   = document.getElementById('loadingIndicator');
    const refreshTableBtn    = document.getElementById('refreshTable');
    const closeTableBtn      = document.getElementById('closeTable');
    const connectionStatus   = document.getElementById('connectionStatus');
    const addNewBtn          = document.getElementById('addNew');
    const printTableBtn      = document.getElementById('printTable');
    const columnToggleBtn    = document.getElementById('columnToggle');
    const clearFiltersBtn    = document.getElementById('clearFilters');

    // --- Değişkenler ---
    let activeModule = null;   // seçili modül adı (ör: 'faturalar')
    let table = null;          // Tabulator tablo nesnesi

    // --- Bağlantı durumunu kontrol et ve göster (supabaseService'i kullan) ---
    async function updateConnectionStatus() {
        const result = await window.supabaseService.checkConnection();
        const statusDiv = document.getElementById('connectionStatus');
        if (result.success) {
            statusDiv.innerHTML = '<i class="bi bi-wifi"></i> <span>Bağlı</span>';
            statusDiv.className = 'connection-status connected';
        } else {
            statusDiv.innerHTML = '<i class="bi bi-wifi-off"></i> <span>Bağlantı hatası</span>';
            statusDiv.className = 'connection-status disconnected';
        }
    }

    // --- Global silme fonksiyonu (diğer dosyalar çağırabilir) ---
    window.handleDeleteRow = async function(id) {
        if (!activeModule) {
            alert('Aktif modül yok.');
            return;
        }
        const result = await window.supabaseService.deleteRow(activeModule, id);
        if (result.success) {
            alert('Kayıt başarıyla silindi!');
            refreshCurrentTable();
        } else {
            alert(`Silme hatası: ${result.error}`);
        }
    };

    // --- Tablo oluşturma (modül adına göre) ---
    // app.js içinde createTable fonksiyonu
async function createTable(moduleName) {
    const module = window.modules?.[moduleName];
    if (!module) {
        console.error('Modül tanımı bulunamadı:', moduleName);
        return;
    }

    tableTitle.innerHTML = `<i class="bi ${module.icon}"></i><span>${module.title}</span>`;

    
    if (table) table.destroy();

    loadingIndicator.style.display = 'block';
    if (tabulatorContainer) tabulatorContainer.style.display = 'none';

    const result = await window.supabaseService.fetchData(moduleName);
    
    if (result.success) {
        // 🔥 VERİYİ BURADA SIRALA (ID'ye göre azalan)
        const sortedData = result.data.sort((a, b) => b.id - a.id);
        renderTable(moduleName, sortedData, module);
    } else {
        console.error('Veri çekme hatası:', result.error);
        renderTable(moduleName, [], module);
    }
}

    // --- Tabloyu çiz (Tabulator kurulumu) ---
    function renderTable(moduleName, data, module) {
        loadingIndicator.style.display = 'none';
        if (tabulatorContainer) tabulatorContainer.style.display = 'block';

        table = new Tabulator(tabulatorContainer, {
            data: data,
            columns: module.columns,                // modülün sütun tanımları
            height: '100%',
            layout: 'fitColumns',
            pagination: true,
            paginationMode: 'local',
            paginationSize: 20,
            paginationSizeSelector: [5, 10, 15, 20, 50, 100],
            movableColumns: true,
            resizableRows: true,
            tooltips: true,
            addRowPos: 'top',
            history: true,
            clipboard: true,
            paginationCounter: 'rows',
            headerFilterLiveFilter: false,
            headerFilterPlaceholder: 'Ara...',
            selectable: true,
            selectableRangeMode: 'click',
            editable: true,

            // Hücre düzenleme sonrası
            cellEdited: async function(cell) {
                const row = cell.getRow();
                const field = cell.getField();
                const newValue = cell.getValue();
                const oldValue = cell.getOldValue();

                const result = await window.supabaseService.updateCell(
                    activeModule,
                    row.getData().id,
                    field,
                    newValue
                );

                if (!result.success) {
                    cell.setValue(oldValue); // eski değere dön
                    alert(`Güncelleme hatası: ${result.error}`);
                }
            },

            // Yeni satır eklendiğinde (manuel ekleme)
            rowAdded: async function(row) {
                const rowData = row.getData();
                delete rowData.id; // Supabase otomatik atar

                const result = await window.supabaseService.insertRow(activeModule, rowData);
                if (result.success && result.data && result.data[0]) {
                    row.update({ id: result.data[0].id }); // ID'yi güncelle
                } else {
                    row.delete(); // hata olursa satırı kaldır
                    alert(`Ekleme hatası: ${result.error || 'Bilinmeyen hata'}`);
                }
            },
            
            // Türkçe dil desteği
            locale: true,
            langs: {
                'tr-tr': {
                    pagination: {
                        first: 'İlk', first_title: 'İlk Sayfa',
                        last: 'Son', last_title: 'Son Sayfa',
                        prev: 'Önceki', prev_title: 'Önceki Sayfa',
                        next: 'Sonraki', next_title: 'Sonraki Sayfa'
                    },
                    headerFilters: { default: 'Filtrele...' }
                }
            },

            // Sağ tık menüsü (bağlam menüsü)
            rowContextMenu: function(e, row) {
                e.preventDefault();
                if (window.showContextMenu) window.showContextMenu(e, row);
            }
        });

        window.currentTable = table; // diğer dosyaların erişimi için

        setTimeout(() => {
            if (table) {
                table.redraw(true);
            }
        }, 100);
    }

    // --- Tablo yenileme (aktif modülü tekrar yükle) ---
    function refreshCurrentTable() {
        if (activeModule) createTable(activeModule);
    }
    window.refreshCurrentTable = refreshCurrentTable; // global
    // --- Event listener'lar ---
    // Modül butonları (Faturalar, Stok, Cari)
    moduleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const moduleName = this.dataset.module;
            // Buton stillerini güncelle
            moduleButtons.forEach(b => b.style.backgroundColor = 'white');
            this.style.backgroundColor = '#f8f9fa';

            activeModule = moduleName;
            window.activeModule = moduleName; // global

            createTable(moduleName);
        });
    });

    const deleteSelectedBtn = document.getElementById('deleteSelected');
if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener('click', handleDeleteSelected);
}

    // Yenile butonu
    if (refreshTableBtn) {
        refreshTableBtn.addEventListener('click', () => refreshCurrentTable());
    }

    async function handleDeleteSelected() {
        if (!table) {
            alert('Tablo henüz yüklenmedi.');
            return;
        }
    
        const selectedRows = table.getSelectedRows();
        if (selectedRows.length === 0) {
            alert('Lütfen silinecek kayıtları seçin.');
            return;
        }
    
        const ids = selectedRows.map(row => row.getData().id);
        const moduleName = activeModule;
        if (!moduleName) {
            alert('Aktif modül bulunamadı.');
            return;
        }
    
        const confirmMsg = `${selectedRows.length} kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`;
        if (!confirm(confirmMsg)) return;
    
        // Butonu geçici olarak devre dışı bırak (çift tıklamayı engelle)
        deleteSelectedBtn.disabled = true;
        deleteSelectedBtn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Siliniyor...';
    
        try {
            const result = await window.supabaseService.deleteRows(moduleName, ids);
            if (result.success) {
                alert(`${selectedRows.length} kayıt başarıyla silindi.`);
                refreshCurrentTable();  // tabloyu yenile
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Toplu silme hatası:', error);
            alert('Silme hatası: ' + error.message);
        } finally {
            // Butonu eski haline döndür
            deleteSelectedBtn.disabled = false;
            deleteSelectedBtn.innerHTML = '<i class="bi bi-trash3"></i>';
        }
    }

    // Kapat butonu (tabloyu gizle)
    if (closeTableBtn) {
        closeTableBtn.addEventListener('click', function() {
            // tableContainer.classList.remove('active');  // kaldır
            if (table) {
                table.destroy();
                table = null;
            }
            activeModule = null;
            window.activeModule = null;
            // İsterseniz tablo alanına "Lütfen bir modül seçin" yazabilirsiniz
            tabulatorContainer.innerHTML = '<div class="loading"><i class="bi bi-table"></i><p>Lütfen bir modül seçin</p></div>';
        });
    }

    // Yeni ekle butonu (modal açar)
    if (addNewBtn) {
        addNewBtn.addEventListener('click', function() {
            if (activeModule && window.showAddModal) {
                window.showAddModal(activeModule);
            } else if (table) {
                // modal yoksa direkt satır ekle (fallback)
                table.addRow({}, true).then(row => row.edit());
            }
        });
    }

    // Yazdır butonu
    if (printTableBtn) {
        printTableBtn.addEventListener('click', function() {
            if (table) table.print(false, true);
            else alert('Tablo henüz yüklenmedi.');
        });
    }

    // Sütun gizle/göster butonu
    if (columnToggleBtn) {
        columnToggleBtn.addEventListener('click', function() {
            if (!table) { alert('Tablo henüz yüklenmedi.'); return; }

            const allColumns = table.getColumns(true);
            const columnNames = allColumns.map(col => ({
                label: col.getDefinition().title || col.getField(),
                field: col.getField(),
                visible: col.isVisible()
            }));

            let toggleHtml = '<div class="column-toggle-modal"><h3>Sütunları Gizle/Göster</h3><ul>';
            columnNames.forEach(col => {
                toggleHtml += `
                    <li>
                        <label>
                            <input type="checkbox" ${col.visible ? 'checked' : ''} data-field="${col.field}">
                            ${col.label}
                        </label>
                    </li>
                `;
            });
            toggleHtml += '</ul><button id="applyColumnToggle">Uygula</button></div>';

            const modal = document.createElement('div');
            modal.className = 'column-toggle-overlay';
            modal.innerHTML = toggleHtml;
            document.body.appendChild(modal);

            // arka plana tıklayınca kapat
            modal.addEventListener('click', function(e) {
                if (e.target === modal) document.body.removeChild(modal);
            });

            const applyBtn = modal.querySelector('#applyColumnToggle');
            if (applyBtn) {
                applyBtn.addEventListener('click', function() {
                    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
                    checkboxes.forEach(cb => {
                        const column = table.getColumn(cb.dataset.field);
                        if (column) {
                            if (cb.checked) column.show();
                            else column.hide();
                        }
                    });
                    document.body.removeChild(modal);
                    table.redraw(true);
                });
            }
        });
    }

    // Filtre temizle butonu
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            if (table) {
                table.clearHeaderFilter();
                table.clearFilter();
            }
        });
    }

    // Sayfa yüklendiğinde bağlantı durumunu kontrol et
    document.addEventListener('DOMContentLoaded', updateConnectionStatus);

    // --- Global erişim fonksiyonları (diğer dosyalar için) ---
    window.getSupabaseClient   = () => window.supabaseClient;       // geriye uyumluluk
    window.getCurrentTable     = () => table;
    window.getActiveModule     = () => activeModule;

    // Sayfa yüklendiğinde loadingIndicator'ı gizle ve bilgi mesajı göster
document.addEventListener('DOMContentLoaded', function() {
    loadingIndicator.style.display = 'none';
    tabulatorContainer.innerHTML = '<div class="loading"><i class="bi bi-table"></i><p>Lütfen bir modül seçin</p></div>';
});
})();
