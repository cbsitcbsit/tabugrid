// crud.js
// CRUD işlemleri: context menu, ekleme/düzenleme modalı, form yönetimi
// Form tanımları window.modules üzerinden alınır.

(function() {
    'use strict';

    // DOM elementleri
    const contextMenu   = document.getElementById('contextMenu');
    const crudModal     = document.getElementById('crudModal');
    const modalTitle    = document.getElementById('modalTitle');
    const crudForm      = document.getElementById('crudForm');
    const saveButton    = document.getElementById('saveButton');
    const cancelButton  = document.getElementById('cancelButton');
    const closeModalBtn = document.querySelector('.close-modal');

    // Durum değişkenleri
    let selectedRow   = null;
    let currentAction = 'add';   // 'add' veya 'edit'
    let currentModule = null;

    // --- Bağlam menüsünü göster (app.js'deki rowContextMenu'den çağrılır) ---
    function showContextMenu(e, row) {
        selectedRow = row;
        contextMenu.style.left = e.pageX + 'px';
        contextMenu.style.top  = e.pageY + 'px';
        contextMenu.style.display = 'block';

        // Menü dışına tıklayınca kapanması için
        setTimeout(() => {
            document.addEventListener('click', hideContextMenu);
        }, 100);
        e.preventDefault();
        return false;
    }

    function hideContextMenu() {
        contextMenu.style.display = 'none';
        document.removeEventListener('click', hideContextMenu);
    }

    // --- Form alanı oluştur (tek bir alan için) ---
    function createFormField(field, rowData) {
        const div = document.createElement('div');
        div.className = 'form-group';

        // Label
        const label = document.createElement('label');
        label.htmlFor = field.name;
        label.textContent = field.label;
        if (field.required) {
            label.innerHTML += ' <span style="color:red">*</span>';
        }
        div.appendChild(label);

        let input;
        if (field.type === 'select') {
            input = document.createElement('select');
            input.id = field.name;
            input.name = field.name;
            input.className = 'form-control';
            input.required = field.required || false;
            field.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.text;
                input.appendChild(option);
            });
            if (rowData && rowData[field.name]) {
                input.value = rowData[field.name];
            } else if (field.defaultValue) {
                input.value = field.defaultValue;
            }
        } else if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.id = field.name;
            input.name = field.name;
            input.className = 'form-control';
            input.rows = field.rows || 3;
            input.placeholder = field.placeholder || '';
            input.required = field.required || false;
            if (rowData && rowData[field.name]) input.value = rowData[field.name];
        } else {
            input = document.createElement('input');
            input.type = field.type;
            input.id = field.name;
            input.name = field.name;
            input.className = 'form-control';
            input.placeholder = field.placeholder || '';
            input.required = field.required || false;
            if (field.min !== undefined) input.min = field.min;
            if (field.step) input.step = field.step;

            if (rowData && rowData[field.name] !== undefined) {
                if (field.type === 'date' && rowData[field.name]) {
                    try {
                        if (window.luxon?.DateTime) {
                            const date = window.luxon.DateTime.fromISO(rowData[field.name]);
                            input.value = date.toFormat('yyyy-MM-dd');
                        } else {
                            input.value = rowData[field.name].slice(0,10);
                        }
                    } catch(e) { input.value = rowData[field.name]; }
                } else {
                    input.value = rowData[field.name];
                }
            } else if (field.type === 'date' && !rowData) {
                input.value = new Date().toISOString().slice(0,10); // bugün
            }
        }
        div.appendChild(input);
        return div;
    }

    // --- Modal göster ---
    function showModal(module, action, rowData = null) {
        currentAction = action;
        currentModule = module;
    
        const moduleData = window.modules?.[module];
        if (!moduleData || !moduleData.form) {
            alert('Modül form tanımı bulunamadı!');
            return;
        }
        const moduleForm = moduleData.form;
    
        // Başlık belirleme
        if (action === 'add') {
            modalTitle.textContent = `Yeni ${moduleForm.title} Ekle`;
        } else if (action === 'edit') {
            modalTitle.textContent = `${moduleForm.title} Düzenle`;
        } else if (action === 'copy') {
            modalTitle.textContent = `${moduleForm.title} Kopyala (Yeni Kayıt)`;
        }
    
        // Formu temizle ve alanları doldur (rowData varsa)
        crudForm.innerHTML = '';
        moduleForm.fields.forEach(field => {
            crudForm.appendChild(createFormField(field, rowData));
        });
    
        // Eğer action 'edit' veya 'copy' ise rowData gelir, 'add' ise gelmez.
        // 'copy' durumunda ID gizli alanını EKLEMEYİN! (yeni kayıt olacak)
        if (action === 'edit' && rowData && rowData.id) {
            const hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.name = 'id';
            hidden.value = rowData.id;
            crudForm.appendChild(hidden);
        }
        // 'copy' için ID gizli alanı eklenmez, böylece insert yapılır.
    
        crudModal.style.display = 'flex';
    }

    // --- Modalı kapat ---
    function hideModal() {
        crudModal.style.display = 'none';
        crudForm.innerHTML = '';
        selectedRow = null;
        currentModule = null;
    }

    // --- Form verilerini topla ve dönüştür ---
    function getFormData() {
        const formData = {};
        const elements = crudForm.elements;
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            if (el.name && el.type !== 'button') {
                if (el.type === 'checkbox') {
                    formData[el.name] = el.checked;
                } else if (el.type === 'radio') {
                    if (el.checked) formData[el.name] = el.value;
                } else {
                    formData[el.name] = el.value;
                }
            }
        }
        
        // Sayısal alanları parse et - MODÜL BAZLI
        const module = currentModule; // currentModule, showModal'da set ediliyor
        
        const numericFieldsMap = {
            'faturalar':   ['tutar'],
            'stok':        ['stok_miktari', 'birim_fiyat'],
            'cari':        ['bakiye'],
            'hesap_plani': ['Borç', 'Alacak', 'Borç Bakiye', 'Alacak Bakiye', 
                            'Döviz Borç', 'Döviz Alacak', 'Döviz Borç Bakiye', 'Döviz Alacak Bakiye']
        };
        
        const numericFields = numericFieldsMap[module] || [];
        
        numericFields.forEach(field => {
            if (formData[field] === undefined || formData[field] === null || formData[field] === '') {
                formData[field] = null;  // Boş değerleri null yap
            } else {
                // String ise virgülü noktaya çevir
                let val = formData[field];
                if (typeof val === 'string') {
                    val = val.replace(',', '.');
                }
                const parsed = parseFloat(val);
                formData[field] = isNaN(parsed) ? null : parsed;
            }
        });
        
        return formData;
    }

    // --- Kaydet butonu işlemi (supabaseService veya doğrudan supabase kullanır) ---
    async function saveData() {
        try {
            const formData = getFormData();
            const module = currentModule;
            const moduleData = window.modules?.[module];
            if (!moduleData || !moduleData.form) throw new Error('Modül form bilgisi yok');
            const moduleForm = moduleData.form;
    
            // Zorunlu alan kontrolü
            for (let field of moduleForm.fields) {
                if (field.required && !formData[field.name]) {
                    throw new Error(`${field.label} alanı zorunludur!`);
                }
            }
    
            let result;
            // Eğer action 'add' veya 'copy' ise INSERT yap
            if (currentAction === 'add' || currentAction === 'copy') {
                delete formData.id; // ID varsa sil (güvenlik)
                result = await window.supabaseService.insertRow(module, formData);
                if (!result.success) throw new Error(result.error);
                alert('Kayıt başarıyla eklendi!');
            } else if (currentAction === 'edit') {
                // Düzenleme: ID'yi kullanarak güncelle
                const id = formData.id;
                delete formData.id;
                const { error } = await window.supabaseClient
                    .from(module)
                    .update(formData)
                    .eq('id', id);
                if (error) throw error;
                alert('Kayıt başarıyla güncellendi!');
            }
    
            hideModal();
            if (window.refreshCurrentTable) setTimeout(window.refreshCurrentTable, 500);
    
        } catch (error) {
            console.error('Kaydetme hatası:', error);
            alert('Bir hata oluştu: ' + error.message);
        }
    }

    // --- Silme işlemi (bağlam menüsünden) ---
    async function deleteData() {
        if (!selectedRow) {
            alert('Silinecek kayıt seçilmedi!');
            return;
        }
        const data = selectedRow.getData();
        const module = window.activeModule;
        if (!confirm(`"${data.id}" ID'li kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) return;

        // window.handleDeleteRow global fonksiyonunu kullan (app.js'de tanımlı)
        if (window.handleDeleteRow) {
            await window.handleDeleteRow(data.id);
            hideContextMenu();
        } else {
            alert('Silme fonksiyonu bulunamadı!');
        }
    }

    // --- Event listener'lar ---
    function initEventListeners() {
        // Düzenle butonu (bağlam menüsü)
        document.getElementById('editItem').addEventListener('click', function(e) {
            e.stopPropagation();
            if (selectedRow) {
                const data = selectedRow.getData();
                showModal(window.activeModule, 'edit', data);
                hideContextMenu();
            }
        });

        document.getElementById('copyItem').addEventListener('click', function(e) {
            e.stopPropagation();
            if (selectedRow) {
                const data = selectedRow.getData();
                // Kopyalama işlemi için modalı 'copy' aksiyonuyla aç
                showModal(window.activeModule, 'copy', data);
                hideContextMenu();
            }
        });

        // Sil butonu (bağlam menüsü)
        document.getElementById('deleteItem').addEventListener('click', function(e) {
            e.stopPropagation();
            deleteData();
        });

        // Modal butonları
        saveButton.addEventListener('click', saveData);
        cancelButton.addEventListener('click', hideModal);
        closeModalBtn.addEventListener('click', hideModal);

        // Modal dışına tıklayarak kapatma
        crudModal.addEventListener('click', function(e) {
            if (e.target === crudModal) hideModal();
        });

        // Enter tuşu ile kaydetme
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && crudModal.style.display === 'flex') {
                e.preventDefault();
                saveButton.click();
            }
        });
    }

    // --- Başlangıç ---
    function init() {
        initEventListeners();
        console.log('CRUD modülü başlatıldı');
    }

    // --- Global fonksiyonlar (diğer dosyaların çağırması için) ---
    window.showContextMenu = showContextMenu;
    window.showAddModal = function(module) {
        showModal(module, 'add');
    };
    window.showEditModal = function(module, rowData) {
        showModal(module, 'edit', rowData);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

