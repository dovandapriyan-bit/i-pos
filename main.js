// --- GLOBAL STATE & INITIALIZATION ---
    const DB_KEY = 'ePosState';
    let state = {
        // License information
        license: {
            key: null,
            plan: 'trial',
            status: 'trial',
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            maxUsers: 3,
            maxTables: 6,
            trialActivated: true,
            trialStartDate: new Date().toISOString()
        },
        
        menu: [
            { id: 1, name: 'Nasi Goreng Spesial', category: 'Makanan', price: 25000, description: 'Nasi goreng dengan telur mata sapi, ayam suwir, dan kerupuk', image: null, isBestSeller: true, outOfStock: false },
            { id: 2, name: 'Mie Ayam Bakso', category: 'Makanan', price: 22000, description: 'Mie ayam dengan bakso sapi dan pangsit goreng', image: null, isBestSeller: false, outOfStock: false },
            { id: 3, name: 'Ayam Bakar Madu', category: 'Makanan', price: 35000, description: 'Ayam bakar dengan saus madu, nasi, dan lalapan', image: null, isBestSeller: true, outOfStock: false },
            { id: 4, name: 'Es Teh Manis', category: 'Minuman', price: 5000, description: 'Teh manis dingin dengan es batu', image: null, isBestSeller: false, outOfStock: false },
            { id: 5, name: 'Jus Alpukat', category: 'Minuman', price: 18000, description: 'Jus alpukat segar dengan susu dan madu', image: null, isBestSeller: false, outOfStock: false },
            { id: 6, name: 'Es Kopi Susu', category: 'Minuman', price: 15000, description: 'Kopi espresso dengan susu dan gula aren', image: null, isBestSeller: true, outOfStock: false }
        ],
        orders: [],
        users: [
            { id: 1, name: 'Admin', email: 'admin@restaurant.com', role: 'admin', password: 'admin123' },
            { id: 2, name: 'Owner', email: 'owner@restaurant.com', role: 'owner', password: 'owner123' },
            { id: 3, name: 'Kasir', email: 'kasir@restaurant.com', role: 'cashier', password: 'kasir123' },
            { id: 4, name: 'Dapur', email: 'dapur@restaurant.com', role: 'kitchen', password: 'dapur123' }
        ],
        tables: [
            { id: 1, number: 1, capacity: 4, status: 'available' },
            { id: 2, number: 2, capacity: 4, status: 'available' },
            { id: 3, number: 3, capacity: 2, status: 'available' },
            { id: 4, number: 4, capacity: 6, status: 'available' },
            { id: 5, number: 5, capacity: 6, status: 'available' },
            { id: 6, number: 6, capacity: 8, status: 'available' }
        ],
        currentOrder: { items: [], tableId: 0 },
        tableOrder: { items: [], tableId: 1 },
        currentUser: { id: 1, name: 'Admin', role: 'admin' },
        
        // Inventory management
        inventory: [
            { id: 1, name: 'Beras', category: 'Bahan Baku', quantity: 50, unit: 'kg', minStock: 10, price: 12000 },
            { id: 2, name: 'Telur', category: 'Bahan Baku', quantity: 100, unit: 'pcs', minStock: 20, price: 2000 },
            { id: 3, name: 'Ayam', category: 'Bahan Baku', quantity: 30, unit: 'kg', minStock: 5, price: 35000 },
            { id: 4, name: 'Teh', category: 'Bahan Baku', quantity: 5, unit: 'kg', minStock: 2, price: 80000 },
            { id: 5, name: 'Gula', category: 'Bahan Baku', quantity: 20, unit: 'kg', minStock: 5, price: 15000 }
        ],
        
        // Asset management
        assets: [
            { id: 1, name: 'Kompor Gas', category: 'Peralatan Dapur', quantity: 2, purchaseDate: '2023-01-15', price: 2500000, currentValue: 2000000, location: 'Dapur', status: 'Baik', lostQuantity: 0, image: null },
            { id: 2, name: 'Kulkas', category: 'Elektronik', quantity: 1, purchaseDate: '2023-02-20', price: 5000000, currentValue: 4000000, location: 'Dapur', status: 'Baik', lostQuantity: 0, image: null },
            { id: 3, name: 'Meja Makan', category: 'Furniture', quantity: 10, purchaseDate: '2023-01-10', price: 1500000, currentValue: 1200000, location: 'Ruang Makan', status: 'Baik', lostQuantity: 0, image: null }
        ],
        
        // Financial management
        transactions: [],
        
        // Payroll management
        payroll: [],
        
        // Shift management
        shifts: [
            { id: 1, name: 'Pagi', startTime: '08:00', endTime: '16:00', employees: [1, 2] },
            { id: 2, name: 'Sore', startTime: '16:00', endTime: '00:00', employees: [3, 4] }
        ],
        
        // Branch management
        branches: [
            { id: 1, name: 'Cabang Utama', address: 'Jl. Sudirman No. 123', phone: '021-123456', email: 'utama@restaurant.com', manager: 2, status: 'active' }
        ],
        
        // Notifications
        notifications: [],
        
        // License transactions
        licenseTransactions: []
    };

    // Load state from localStorage
    function loadState() {
        const savedState = localStorage.getItem(DB_KEY);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                state = { ...state, ...parsed };
            } catch (e) {
                console.error('Error loading state:', e);
            }
        }
        
        // Check trial status
        checkTrialStatus();
        updateKDSNotification();
        renderCurrentPage();
    }

    function saveState() {
        localStorage.setItem(DB_KEY, JSON.stringify(state));
        updateKDSNotification();
    }

    // --- LICENSE MANAGEMENT ---
    function checkTrialStatus() {
        if (state.license.status === 'trial' && state.license.trialActivated) {
            const now = new Date();
            const trialEndDate = new Date(state.license.expiryDate);
            const daysLeft = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));
            
            // Update trial days left
            document.getElementById('trial-days-left').textContent = daysLeft;
            document.getElementById('license-days-left').textContent = `${daysLeft} Hari`;
            
            // Check if trial has expired
            if (daysLeft <= 0) {
                state.license.status = 'expired';
                showNotification('Masa trial Anda telah berakhir! Silakan aktivasi lisensi untuk melanjutkan.', 'error');
                updateLicenseUI();
            }
            
            // Show warning when 3 days left
            if (daysLeft <= 3 && daysLeft > 0) {
                showNotification(`Masa trial Anda tersisa ${daysLeft} hari lagi!`, 'warning');
            }
        }
        
        updateLicenseUI();
        saveState();
    }

    function updateLicenseUI() {
        const statusElement = document.getElementById('subscriptionStatus');
        if (statusElement) {
            statusElement.textContent = state.license.status === 'trial' ? 'Trial' : 
                                      state.license.status === 'active' ? 'Aktif' : 'Kedaluwarsa';
            statusElement.className = `subscription-status status-${state.license.status}`;
        }
    }

    function activateLicense() {
        const licenseKey = document.getElementById('license-key-input').value || 
                           document.getElementById('license-activation-input').value;
        
        if (!licenseKey) {
            showNotification('Silakan masukkan kode lisensi!', 'warning');
            return;
        }
        
        // Simulate API call to validate license
        showNotification('Memvalidasi lisensi...', 'info');
        
        setTimeout(() => {
            // Simulate successful activation
            const planType = getPlanTypeFromKey(licenseKey);
            
            if (planType) {
                state.license.key = licenseKey;
                state.license.plan = planType;
                state.license.status = 'active';
                state.license.trialActivated = false;
                
                // Set expiry date based on plan type
                const now = new Date();
                if (planType === 'basic') {
                    state.license.expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
                    state.license.maxUsers = 5;
                    state.license.maxTables = 10;
                } else if (planType === 'premium') {
                    state.license.expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
                    state.license.maxUsers = 10;
                    state.license.maxTables = 15;
                } else if (planType === 'enterprise') {
                    state.license.expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
                    state.license.maxUsers = 999;
                    state.license.maxTables = 999;
                }
                
                // Add transaction record
                state.licenseTransactions.push({
                    id: Date.now(),
                    type: 'activation',
                    plan: planType,
                    amount: getPlanPrice(planType),
                    date: new Date().toISOString(),
                    status: 'completed',
                    paymentMethod: 'License Key'
                });
                
                saveState();
                updateLicenseUI();
                renderLicensePage();
                
                showNotification(`Lisensi ${planType} berhasil diaktifkan!`, 'success');
                
                // Clear input fields
                document.getElementById('license-key-input').value = '';
                document.getElementById('license-activation-input').value = '';
            } else {
                showNotification('Kode lisensi tidak valid!', 'error');
            }
        }, 1500);
    }

    function getPlanTypeFromKey(key) {
        // In a real implementation, you would validate the key with your database
        // For simulation, we'll check if the key contains specific patterns
        if (key.includes('BASIC')) return 'basic';
        if (key.includes('PREMIUM')) return 'premium';
        if (key.includes('ENTERPRISE')) return 'enterprise';
        return null;
    }

    function getPlanPrice(plan) {
        if (plan === 'basic') return 299000;
        if (plan === 'premium') return 599000;
        if (plan === 'enterprise') return 999000;
        return 0;
    }

    // --- USER MANAGEMENT ---
    function switchUser(userId) {
        const user = state.users.find(u => u.id === userId);
        if (user) {
            state.currentUser = user;
            renderUserInterface();
            showNotification(`Anda masuk sebagai ${user.name} (${getRoleLabel(user.role)})`, 'info');
        }
        toggleUserDropdown();
    }

    function renderUserInterface() {
        const user = state.currentUser;
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userAvatar').textContent = user.name.charAt(0);
        renderSidebar();
        
        const defaultPages = {
            admin: 'dashboard',
            owner: 'financial',
            cashier: 'pos',
            kitchen: 'kds',
            customer: 'table-order'
        };
        
        showPage(defaultPages[user.role]);
        lucide.createIcons();
    }

    function renderSidebar() {
        const sidebarMenu = document.getElementById('sidebarMenu');
        const roleMenus = {
            admin: [
                { page: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
                { page: 'pos', label: 'Kasir', icon: 'shopping-cart' },
                { page: 'kds', label: 'Dapur', icon: 'chef-hat', notification: true },
                { page: 'order-status', label: 'Status Pesanan', icon: 'clock' },
                { page: 'table-selection', label: 'Pilih Meja', icon: 'square-stack' },
                { page: 'table-order', label: 'Pesan via Meja', icon: 'smartphone' },
                { page: 'ride-hailing', label: 'Ojek Online', icon: 'truck' },
                { page: 'menu-management', label: 'Kelola Menu', icon: 'utensils' },
                { page: 'table-management', label: 'Manajemen Meja', icon: 'table' },
                { page: 'inventory', label: 'Manajemen Barang', icon: 'package' },
                { page: 'asset', label: 'Manajemen Aset', icon: 'briefcase' },
                { page: 'order-history', label: 'Riwayat Pesanan', icon: 'file-text' },
                { page: 'user-management', label: 'Kelola Pengguna', icon: 'users' },
                { page: 'financial', label: 'Keuangan', icon: 'dollar-sign' },
                { page: 'payroll', label: 'Penggajian', icon: 'credit-card' },
                { page: 'shift', label: 'Shift', icon: 'calendar' },
                { page: 'branch', label: 'Multi Cabang', icon: 'map-pin' },
                { page: 'license', label: 'Lisensi', icon: 'crown' }
            ],
            owner: [
                { page: 'financial', label: 'Keuangan', icon: 'dollar-sign' },
                { page: 'order-status', label: 'Status Pesanan', icon: 'clock' },
                { page: 'order-history', label: 'Riwayat Pesanan', icon: 'file-text' },
                { page: 'user-management', label: 'Kelola Pengguna', icon: 'users' },
                { page: 'payroll', label: 'Penggajian', icon: 'credit-card' },
                { page: 'branch', label: 'Multi Cabang', icon: 'map-pin' },
                { page: 'license', label: 'Lisensi', icon: 'crown' }
            ],
            cashier: [
                { page: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
                { page: 'pos', label: 'Kasir', icon: 'shopping-cart' },
                { page: 'order-status', label: 'Status Pesanan', icon: 'clock' },
                { page: 'order-history', label: 'Riwayat Pesanan', icon: 'file-text' }
            ],
            kitchen: [
                { page: 'kds', label: 'Dapur', icon: 'chef-hat', notification: true }
            ],
            customer: [
                { page: 'table-order', label: 'Pesan di Meja', icon: 'smartphone' },
                { page: 'order-status', label: 'Status Pesanan', icon: 'clock' }
            ]
        };
        
        const menuItems = roleMenus[state.currentUser.role] || [];
        sidebarMenu.innerHTML = menuItems.map(item => `
            <li>
                <a href="#" class="nav-link ${item.page === 'dashboard' ? 'active' : ''}" data-page="${item.page}">
                    <i data-lucide="${item.icon}"></i> ${item.label}
                    ${item.notification ? `<span class="notification-badge" id="kds-notification" style="display: none;">0</span>` : ''}
                </a>
            </li>
        `).join('');
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showPage(link.dataset.page);
            });
        });
    }

    function getRoleLabel(role) {
        const roleMap = {
            'admin': 'Admin',
            'owner': 'Pemilik',
            'cashier': 'Kasir',
            'kitchen': 'Dapur',
            'customer': 'Pelanggan'
        };
        return roleMap[role] || role;
    }

    function toggleUserDropdown() {
        document.getElementById('userDropdownMenu').classList.toggle('show');
    }

    // --- NOTIFICATION SYSTEM ---
    function showNotification(message, type = 'info', persistent = false) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : type === 'warning' ? 'alert-triangle' : 'info'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        lucide.createIcons();
        
        if (!persistent) {
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
        
        // Add to notifications list for persistence
        state.notifications.push({
            id: Date.now(),
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false
        });
        saveState();
    }

    function showNotificationToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <div class="notification-toast-icon" style="color: ${type === 'success' ? 'var(--accent-success)' : type === 'error' ? 'var(--accent-danger)' : type === 'warning' ? 'var(--accent-warning)' : 'var(--accent-primary)'}">
                <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : type === 'warning' ? 'alert-triangle' : 'info'}"></i>
            </div>
            <div class="notification-toast-content">
                <div class="notification-toast-title">${title}</div>
                <div class="notification-toast-message">${message}</div>
            </div>
            <button class="notification-toast-close" onclick="this.parentElement.remove()">
                <i data-lucide="x"></i>
            </button>
        `;
        document.body.appendChild(toast);
        lucide.createIcons();
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    function updateKDSNotification() {
        const newOrdersCount = state.orders.filter(o => o.status === 'baru').length;
        const notificationBadge = document.getElementById('kds-notification');
        if (notificationBadge) {
            if (newOrdersCount > 0) {
                notificationBadge.textContent = newOrdersCount;
                notificationBadge.style.display = 'flex';
            } else {
                notificationBadge.style.display = 'none';
            }
        }
    }

    // --- ROUTING & NAVIGATION ---
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        document.getElementById(`${pageId}-page`).classList.add('active');
        const navLink = document.querySelector(`[data-page="${pageId}"]`);
        if (navLink) {
            navLink.classList.add('active');
            document.getElementById('topbarTitle').textContent = navLink.textContent.trim();
        }

        switch(pageId) {
            case 'dashboard': renderDashboard(); break;
            case 'pos': renderPOS(); break;
            case 'kds': renderKDS(); break;
            case 'order-status': renderOrderStatusPage(); break;
            case 'table-selection': renderTableSelection(); break;
            case 'table-order': renderTableOrder(); break;
            case 'menu-management': renderMenuManagement(); break;
            case 'table-management': renderTableManagement(); break;
            case 'order-history': renderOrderHistory(); break;
            case 'user-management': renderUserManagement(); break;
            case 'license': renderLicensePage(); break;
            case 'inventory': renderInventoryManagement(); break;
            case 'asset': renderAssetManagement(); break;
            case 'financial': renderFinancialManagement(); break;
            case 'payroll': renderPayrollManagement(); break;
            case 'shift': renderShiftManagement(); break;
            case 'branch': renderBranchManagement(); break;
        }
    }

    // --- DASHBOARD ---
    function renderDashboard() {
        const today = new Date().toDateString();
        const todayOrders = state.orders.filter(o => new Date(o.timestamp).toDateString() === today);
        const activeOrders = state.orders.filter(o => o.status !== 'selesai');
        
        const totalRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
        const totalItemsSold = todayOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

        document.getElementById('kpi-revenue').textContent = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
        document.getElementById('kpi-orders').textContent = todayOrders.length;
        document.getElementById('kpi-active').textContent = activeOrders.length;
        document.getElementById('kpi-items').textContent = totalItemsSold;

        const recentOrdersList = document.getElementById('recent-orders-list');
        if (state.orders.length === 0) {
            recentOrdersList.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Belum ada pesanan.</p>';
        } else {
            recentOrdersList.innerHTML = state.orders.slice(-5).reverse().map(order => `
                <div class="pos-cart-item">
                    <div>
                        <div class="pos-cart-item-name">Order #${order.id} - ${order.tableId === 0 ? 'Take Away' : `Meja ${order.tableId}`} (${order.type})</div>
                        <div class="pos-cart-item-price">${order.items.map(i=>`${i.name} (x${i.quantity})`).join(', ')}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="color: var(--accent-primary);">Rp ${order.total.toLocaleString('id-ID')}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">${new Date(order.timestamp).toLocaleTimeString('id-ID')}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    // --- POS SYSTEM ---
    function renderPOS() {
        renderCategories('pos-categories');
        renderMenuGrid('pos-menu-grid', handleAddToOrder);
        updatePOSCart();
    }

    function renderCategories(containerId) {
        const categories = [...new Set(state.menu.map(item => item.category))];
        const container = document.getElementById(containerId);
        container.innerHTML = `<button class="pos-category-btn active" onclick="filterMenu('all', this)">Semua</button>` +
            categories.map(cat => `<button class="pos-category-btn" onclick="filterMenu('${cat}', this)">${cat}</button>`).join('');
    }

    function renderMenuGrid(containerId, clickHandler) {
        const grid = document.getElementById(containerId);
        grid.innerHTML = state.menu.map(item => {
            const isBestSeller = item.isBestSeller;
            const isOutOfStock = item.outOfStock;
            
            return `
                <div class="pos-menu-item ${isBestSeller ? 'best-seller' : ''} ${isOutOfStock ? 'out-of-stock' : ''}" 
                     onclick="${!isOutOfStock ? clickHandler.name + '(' + item.id + ')' : ''}">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5rem;">` : ''}
                    <h4>${item.name}</h4>
                    <p>Rp ${item.price.toLocaleString('id-ID')}</p>
                    ${item.description ? `<div class="menu-description">${item.description}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    function filterMenu(category, button) {
        document.querySelectorAll(`#${button.parentElement.id} .pos-category-btn`).forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const grid = button.parentElement.nextElementSibling;
        const itemsToRender = category === 'all' ? state.menu : state.menu.filter(item => item.category === category);
        
        const clickHandlerMap = {
            'pos-categories': 'handleAddToOrder',
            'table-categories': 'handleAddToTableOrder'
        };
        const clickHandler = clickHandlerMap[button.parentElement.id] || 'handleAddToOrder';
        
        grid.innerHTML = itemsToRender.map(item => {
            const isBestSeller = item.isBestSeller;
            const isOutOfStock = item.outOfStock;
            
            return `
                <div class="pos-menu-item ${isBestSeller ? 'best-seller' : ''} ${isOutOfStock ? 'out-of-stock' : ''}" 
                     onclick="${!isOutOfStock ? clickHandler + '(' + item.id + ')' : ''}">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 0.5rem;">` : ''}
                    <h4>${item.name}</h4>
                    <p>Rp ${item.price.toLocaleString('id-ID')}</p>
                    ${item.description ? `<div class="menu-description">${item.description}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    function handleAddToOrder(itemId) {
        const menuItem = state.menu.find(i => i.id === itemId);
        if (!menuItem || menuItem.outOfStock) return;
        
        const existingItem = state.currentOrder.items.find(i => i.id === itemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            state.currentOrder.items.push({ 
                id: menuItem.id,
                name: menuItem.name, 
                price: menuItem.price, 
                quantity: 1 
            });
        }
        updatePOSCart();
    }

    function updatePOSCart() {
        const cartContainer = document.getElementById('pos-cart');
        if (state.currentOrder.items.length === 0) {
            cartContainer.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 2rem 0;">Keranjang kosong.</p>';
        } else {
            cartContainer.innerHTML = state.currentOrder.items.map(item => `
                <div class="pos-cart-item">
                    <div>
                        <div class="pos-cart-item-name">${item.name}</div>
                        <div class="pos-cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="pos-cart-item-controls">
                        <button onclick="updateOrderQuantity(${item.id}, -1)"><i data-lucide="minus-circle"></i></button>
                        <span>${item.quantity}</span>
                        <button onclick="updateOrderQuantity(${item.id}, 1)"><i data-lucide="plus-circle"></i></button>
                    </div>
                </div>
            `).join('');
        }
        calculatePOSTotal();
        lucide.createIcons();
    }

    function updateOrderQuantity(itemId, change) {
        const item = state.currentOrder.items.find(i => i.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                state.currentOrder.items = state.currentOrder.items.filter(i => i.id !== itemId);
            }
            updatePOSCart();
        }
    }

    function calculatePOSTotal() {
        const subtotal = state.currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.1;
        const total = subtotal + tax;

        document.getElementById('pos-subtotal').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
        document.getElementById('pos-tax').textContent = `Rp ${tax.toLocaleString('id-ID')}`;
        document.getElementById('pos-total').textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }

    function clearCurrentOrder() {
        if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
            state.currentOrder = { items: [], tableId: parseInt(document.getElementById('pos-table-select').value) };
            updatePOSCart();
        }
    }

    function openPaymentModal() {
        if (state.currentOrder.items.length === 0) {
            showNotification('Keranjang masih kosong!', 'warning');
            return;
        }
        document.getElementById('modal-subtotal').textContent = document.getElementById('pos-subtotal').textContent;
        document.getElementById('modal-tax').textContent = document.getElementById('pos-tax').textContent;
        document.getElementById('modal-total').textContent = document.getElementById('pos-total').textContent;
        document.getElementById('payment-modal').style.display = 'flex';
    }

    function processPayment() {
        const total = parseInt(document.getElementById('modal-total').textContent.replace(/\D/g,''));
        const method = document.getElementById('payment-method').value;
        const paidAmount = parseInt(document.getElementById('payment-amount').value) || 0;
        
        if (method === 'Tunai' && paidAmount < total) {
            showNotification('Uang yang dibayar kurang!', 'error');
            return;
        }

        const newOrder = {
            id: Date.now(),
            tableId: parseInt(document.getElementById('pos-table-select').value),
            items: [...state.currentOrder.items],
            status: 'baru',
            total: total,
            type: state.currentOrder.tableId === 0 ? 'takeaway' : 'dine-in',
            paymentMethod: method,
            timestamp: new Date().toISOString(),
            cashier: state.currentUser.name,
            statusHistory: [
                { status: 'baru', timestamp: new Date().toISOString() }
            ]
        };

        state.orders.push(newOrder);
        state.currentOrder = { items: [], tableId: 0 };
        saveState();
        
        closeModal('payment-modal');
        showNotification(`Pembayaran ${method} sebesar Rp ${total.toLocaleString('id-ID')} berhasil!`, 'success');
        renderPOS();
        renderDashboard();
        renderKDS();
    }

    // --- KDS SYSTEM ---
    function renderKDS() {
        const kdsGrid = document.getElementById('kds-orders-grid');
        const activeOrders = state.orders.filter(o => o.status !== 'selesai');
        
        if (activeOrders.length === 0) {
            kdsGrid.innerHTML = '<p style="text-align:center; color: var(--text-secondary); grid-column: 1/-1;">Tidak ada pesanan aktif.</p>';
        } else {
            // Group orders by table
            const ordersByTable = {};
            activeOrders.forEach(order => {
                const tableKey = order.tableId === 0 ? 'Take Away' : `Meja ${order.tableId}`;
                if (!ordersByTable[tableKey]) {
                    ordersByTable[tableKey] = [];
                }
                ordersByTable[tableKey].push(order);
            });
            
            kdsGrid.innerHTML = Object.entries(ordersByTable).map(([tableKey, orders]) => `
                <div class="kds-order-card">
                    <div class="kds-order-header">
                        <span class="kds-order-id">${tableKey}</span>
                        <span class="kds-order-time">${orders.length} pesanan</span>
                    </div>
                    ${orders.map(order => `
                        <div style="margin-bottom: 1rem; padding: 0.5rem; background: var(--bg-tertiary); border-radius: 8px;">
                            <div style="font-weight: 600; margin-bottom: 0.5rem;">Order #${order.id}</div>
                            ${order.items.map(item => `
                                <div class="kds-order-item">
                                    <span>${item.name} x${item.quantity}</span>
                                    <div class="kds-order-item-status">
                                        <button class="btn-ok" onclick="updateItemStatus(${order.id}, ${item.id}, 'ok')">OK</button>
                                        <button class="btn-cancel" onclick="updateItemStatus(${order.id}, ${item.id}, 'cancel')">Cancel</button>
                                        <button class="btn-out" onclick="updateItemStatus(${order.id}, ${item.id}, 'out')">Habis</button>
                                    </div>
                                </div>
                            `).join('')}
                            <div class="kds-order-actions">
                                ${order.status === 'baru' ? `<button class="btn btn-primary" onclick="updateOrderStatus(${order.id}, 'dimasak')">Mulai Masak</button>` : ''}
                                ${order.status === 'dimasak' ? `<button class="btn btn-warning" onclick="updateOrderStatus(${order.id}, 'siap')">Selesai</button>` : ''}
                                ${order.status === 'siap' ? `<button class="btn btn-success" onclick="updateOrderStatus(${order.id}, 'selesai')">Diantar</button>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `).join('');
        }
    }


    // --- FUNGSI SCROLL SIDEBAR ---
function initSidebarScroll() {
    const sidebar = document.getElementById('sidebar');
    const sidebarContent = sidebar.querySelector('.sidebar-menu');
    
    // Deteksi touch device
    let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        // Untuk mobile: sidebar disembuny scroll saat tidak aktif
        sidebar.addEventListener('touchstart', function(e) {
            if (!sidebar.classList.contains('open')) {
                sidebar.style.overflowY = 'auto';
            }
        });
        
        sidebar.addEventListener('touchend', function(e) {
            setTimeout(() => {
                if (!sidebar.classList.contains('open')) {
                    sidebar.style.overflowY = 'hidden';
                }
            }, 300);
        });
    } else {
        // Untuk desktop: sidebar selalu bisa di-scroll
        sidebar.style.overflowY = 'auto';
    }
}

// --- FUNGSI TOGGLE SIDEBAR YANG LEBIH BAIK ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('open');
    
    // Animasi smooth scroll ke atas saat dibuka
    if (sidebar.classList.contains('open')) {
        sidebar.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// --- FUNGSI SCROLL OTOMATIS ---
function scrollToTop() {
    const sidebar = document.getElementById('sidebar');
    sidebar.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function scrollToBottom() {
    const sidebar = document.getElementById('sidebar');
    sidebar.scrollTo({
        top: sidebar.scrollHeight,
        behavior: 'smooth'
    });
}

// --- FUNGSI HANDLE SCROLL EVENT ---
function handleSidebarScroll() {
    const sidebar = document.getElementById('sidebar');
    const scrollPosition = sidebar.scrollTop;
    const maxScroll = sidebar.scrollHeight - sidebar.clientHeight;
    
    // Tambahkan indikator scroll jika diperlukan
    if (scrollPosition > 100) {
        sidebar.classList.add('scrolled');
    } else {
        sidebar.classList.remove('scrolled');
    }
}

// --- FUNGSI DETEKSI TINGGI LAYAR ---
function setupScrollIndicators() {
    const sidebar = document.getElementById('sidebar');
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    
    menuItems.forEach(item => {
        const rect = item.getBoundingClientRect();
        const sidebarRect = sidebar.getBoundingClientRect();
        
        // Cek apakah item terlihat di viewport
        if (rect.top >= sidebarRect.top && rect.bottom <= sidebarRect.bottom) {
            item.classList.add('visible');
        } else {
            item.classList.remove('visible');
        }
    });
}

    function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    sidebar.classList.toggle('open');
    
    // Reset scroll position saat toggle
    if (!sidebar.classList.contains('open')) {
        sidebar.scrollTop = 0;
    }
    
    // Untuk mobile, tutup overlay saat sidebar terbuka
    if (window.innerWidth <= 768) {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.style.css = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
            display: none;
        `;
        document.body.appendChild(overlay);
        
        if (sidebar.classList.contains('open')) {
            overlay.style.display = 'block';
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.remove();
            });
        }
    }
}

    document.addEventListener('DOMContentLoaded', function() {
    loadState();
    lucide.createIcons();
    
    // Inisialisasi scroll sidebar
    initSidebarScroll();
    
    // Event listener untuk scroll
    const sidebar = document.getElementById('sidebar');
    sidebar.addEventListener('scroll', handleSidebarScroll);
    
    // Event listener untuk resize
    window.addEventListener('resize', () => {
        handleSidebarScroll();
        setupScrollIndicators();
    });
    
    // Event listener untuk menu links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showPage(this.dataset.page);
            
            // Scroll ke atas saat navigasi di mobile
            if (window.innerWidth <= 768) {
                scrollToTop();
            }
        });
    });
    
    // ... kode lainnya ...
});

    function updateItemStatus(orderId, itemId, status) {
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;
        
        const item = order.items.find(i => i.id === itemId);
        if (!item) return;
        
        item.status = status;
        
        if (status === 'cancel' || status === 'out') {
            // Create notification for customer
            const notificationTitle = status === 'cancel' ? 'Menu Dibatalkan' : 'Menu Habis';
            const notificationMessage = `${item.name} pada pesanan #${orderId} ${status === 'cancel' ? 'dibatalkan' : 'habis'}. Silakan pilih menu lain.`;
            
            showNotificationToast(notificationTitle, notificationMessage, 'warning');
            
            // Add to notification list
            state.notifications.push({
                id: Date.now(),
                orderId: orderId,
                itemId: itemId,
                title: notificationTitle,
                message: notificationMessage,
                type: 'warning',
                timestamp: new Date().toISOString(),
                read: false
            });
        }
        
        saveState();
        renderKDS();
    }

    function updateOrderStatus(orderId, newStatus) {
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            if (!order.statusHistory) order.statusHistory = [];
            order.statusHistory.push({
                status: newStatus,
                timestamp: new Date().toISOString()
            });
            
            saveState();
            renderKDS();
            renderDashboard();
            renderTableOrder();
            
            const statusMessage = newStatus === 'dimasak' ? 'Pesanan sedang diproses' :
                                 newStatus === 'siap' ? 'Pesanan siap diantar' :
                                 newStatus === 'selesai' ? 'Pesanan telah selesai' : '';
            
            if (statusMessage) {
                showNotification(`Order #${orderId}: ${statusMessage}`, 'info');
            }
        }
    }

    function openStockUpdateModal() {
        const modal = document.getElementById('stock-update-modal');
        const listContainer = document.getElementById('stock-update-list');
        
        listContainer.innerHTML = state.menu.map(item => `
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding: 0.5rem; background: var(--bg-tertiary); border-radius: 8px;">
                <input type="checkbox" id="stock-${item.id}" ${item.outOfStock ? 'checked' : ''} onchange="toggleMenuStock(${item.id})">
                <label for="stock-${item.id}" style="flex-grow: 1; cursor: pointer;">
                    ${item.name} - Rp ${item.price.toLocaleString('id-ID')}
                </label>
                <span style="color: ${item.outOfStock ? 'var(--accent-danger)' : 'var(--accent-success)'}; font-weight: 600;">
                    ${item.outOfStock ? 'Habis' : 'Tersedia'}
                </span>
            </div>
        `).join('');
        
        modal.style.display = 'flex';
    }

    function toggleMenuStock(itemId) {
        const item = state.menu.find(m => m.id === itemId);
        if (item) {
            item.outOfStock = !item.outOfStock;
        }
    }

    function saveStockUpdates() {
        saveState();
        closeModal('stock-update-modal');
        showNotification('Stok menu berhasil diperbarui!', 'success');
        renderPOS();
        renderTableOrder();
        renderKDS();
    }

    // --- TABLE ORDER SYSTEM ---
    function renderTableOrder() {
        const tableSelect = document.getElementById('table-order-select');
        const selectedTableId = parseInt(tableSelect.value);
        state.tableOrder.tableId = selectedTableId;
        
        document.getElementById('cart-table-number').textContent = selectedTableId;
        document.getElementById('current-table-number').textContent = selectedTableId;
        
        renderCategories('table-categories');
        renderMenuGrid('table-menu-grid', handleAddToTableOrder);
        updateTableCart();
        renderTableActiveOrders();
    }

    function renderTableActiveOrders() {
        const container = document.getElementById('table-active-orders');
        const tableId = state.tableOrder.tableId;
        const activeOrders = state.orders.filter(order => 
            order.tableId === tableId && order.status !== 'selesai'
        );
        
        if (activeOrders.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 2rem 0;">Tidak ada pesanan aktif untuk meja ini.</p>';
        } else {
            container.innerHTML = activeOrders.map(order => `
                <div class="card" style="margin-bottom: 1rem;">
                    <div class="card-header" style="padding: 1rem; margin-bottom: 0;">
                        <span>Order #${order.id}</span>
                        <span class="subscription-status status-${order.status === 'baru' ? 'active' : order.status === 'dimasak' ? 'warning' : 'success'}">
                            ${getStatusLabel(order.status)}
                        </span>
                    </div>
                    <div style="padding: 1rem;">
                        <div class="order-status-timeline">
                            <div class="order-status-step ${order.status === 'baru' || order.status === 'dimasak' || order.status === 'siap' || order.status === 'selesai' ? 'completed' : ''}">
                                <div class="order-status-step-circle">
                                    ${order.status === 'baru' || order.status === 'dimasak' || order.status === 'siap' || order.status === 'selesai' ? '<i data-lucide="check"></i>' : '1'}
                                </div>
                                <div class="order-status-step-label">Diterima</div>
                            </div>
                            <div class="order-status-step ${order.status === 'dimasak' || order.status === 'siap' || order.status === 'selesai' ? 'completed' : order.status === 'baru' ? 'active' : ''}">
                                <div class="order-status-step-circle">
                                    ${order.status === 'dimasak' || order.status === 'siap' || order.status === 'selesai' ? '<i data-lucide="check"></i>' : '2'}
                                </div>
                                <div class="order-status-step-label">Diproses</div>
                            </div>
                            <div class="order-status-step ${order.status === 'siap' || order.status === 'selesai' ? 'completed' : order.status === 'dimasak' ? 'active' : ''}">
                                <div class="order-status-step-circle">
                                    ${order.status === 'siap' || order.status === 'selesai' ? '<i data-lucide="check"></i>' : '3'}
                                </div>
                                <div class="order-status-step-label">Siap</div>
                            </div>
                            <div class="order-status-step ${order.status === 'selesai' ? 'completed' : order.status === 'siap' ? 'active' : ''}">
                                <div class="order-status-step-circle">
                                    ${order.status === 'selesai' ? '<i data-lucide="check"></i>' : '4'}
                                </div>
                                <div class="order-status-step-label">Selesai</div>
                            </div>
                        </div>
                        <div style="margin-top: 1rem;">
                            <h4>Items:</h4>
                            ${order.items.map(item => `
                                <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                                    <span>${item.name} x${item.quantity} ${item.status === 'cancel' ? '(Dibatalkan)' : item.status === 'out' ? '(Habis)' : ''}</span>
                                    <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                </div>
                            `).join('')}
                        </div>
                        ${order.items.some(item => item.status === 'cancel' || item.status === 'out') ? `
                            <div style="margin-top: 1rem;">
                                <button class="btn btn-primary" onclick="replaceCancelledItems(${order.id})">
                                    <i data-lucide="refresh-cw"></i> Ganti Menu
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }
        lucide.createIcons();
    }

    function handleAddToTableOrder(itemId) {
        const menuItem = state.menu.find(i => i.id === itemId);
        if (!menuItem || menuItem.outOfStock) return;
        
        const existingItem = state.tableOrder.items.find(i => i.id === itemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            state.tableOrder.items.push({ 
                id: menuItem.id,
                name: menuItem.name, 
                price: menuItem.price, 
                quantity: 1 
            });
        }
        updateTableCart();
    }

    function updateTableCart() {
        const cartContainer = document.getElementById('table-cart');
        if (state.tableOrder.items.length === 0) {
            cartContainer.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 2rem 0;">Keranjang kosong.</p>';
        } else {
            cartContainer.innerHTML = state.tableOrder.items.map(item => `
                <div class="pos-cart-item">
                    <div>
                        <div class="pos-cart-item-name">${item.name}</div>
                        <div class="pos-cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="pos-cart-item-controls">
                        <button onclick="updateTableQuantity(${item.id}, -1)"><i data-lucide="minus-circle"></i></button>
                        <span>${item.quantity}</span>
                        <button onclick="updateTableQuantity(${item.id}, 1)"><i data-lucide="plus-circle"></i></button>
                    </div>
                </div>
            `).join('');
        }
        calculateTableTotal();
        lucide.createIcons();
    }

    function updateTableQuantity(itemId, change) {
        const item = state.tableOrder.items.find(i => i.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                state.tableOrder.items = state.tableOrder.items.filter(i => i.id !== itemId);
            }
            updateTableCart();
        }
    }

    function calculateTableTotal() {
        const total = state.tableOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('table-total').textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }

    function submitTableOrder() {
        if (state.tableOrder.items.length === 0) {
            showNotification('Keranjang masih kosong!', 'warning');
            return;
        }
        const total = state.tableOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newOrder = {
            id: Date.now(),
            tableId: state.tableOrder.tableId,
            items: [...state.tableOrder.items],
            status: 'baru',
            total: total,
            type: 'dine-in',
            timestamp: new Date().toISOString(),
            statusHistory: [
                { status: 'baru', timestamp: new Date().toISOString() }
            ]
        };
        
        const table = state.tables.find(t => t.id === state.tableOrder.tableId);
        if (table) table.status = 'occupied';
        
        state.orders.push(newOrder);
        state.tableOrder = { items: [], tableId: 1 };
        saveState();
        
        showNotification('Pesanan telah dikirim ke dapur!', 'success');
        renderTableOrder();
        renderDashboard();
        renderKDS();
    }

    function replaceCancelledItems(orderId) {
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;
        
        const cancelledItems = order.items.filter(item => item.status === 'cancel' || item.status === 'out');
        
        // Add cancelled items back to table cart for replacement
        cancelledItems.forEach(item => {
            const existingItem = state.tableOrder.items.find(i => i.id === item.id);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                state.tableOrder.items.push({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                });
            }
        });
        
        // Remove cancelled items from order
        order.items = order.items.filter(item => item.status !== 'cancel' && item.status !== 'out');
        
        saveState();
        showNotification('Item yang dibatalkan/habis telah ditambahkan ke keranjang untuk penggantian', 'info');
        renderTableOrder();
        updateTableCart();
    }

    // --- RIDE HAILING ---
    function createRideHailingOrder(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const items = formData.get('orderItems').split(',').map(i => i.trim());
        const orderItems = items.map(itemText => {
            const [quantity, ...nameParts] = itemText.split(' ');
            const name = nameParts.join(' ');
            return { name, quantity: parseInt(quantity), price: 25000 };
        });

        const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const priority = formData.get('priority');
        
        const newOrder = {
            id: Date.now(),
            tableId: 0,
            items: orderItems,
            status: priority === 'high' ? 'dimasak' : 'baru',
            total: total,
            type: 'ride-hailing',
            platform: formData.get('platform'),
            driverName: formData.get('driverName'),
            timestamp: new Date().toISOString(),
            statusHistory: [
                { status: priority === 'high' ? 'dimasak' : 'baru', timestamp: new Date().toISOString() }
            ]
        };
        
        state.orders.push(newOrder);
        saveState();
        
        showNotification(`Pesanan dari ${formData.get('platform')} oleh ${formData.get('driverName')} telah dibuat!`, 'success');
        event.target.reset();
        renderDashboard();
        renderKDS();
    }

    // --- ORDER STATUS ---
    function renderOrderStatusPage() {
        // Implementation for order status page
    }

    function checkOrderStatus() {
        const orderId = document.getElementById('order-id-input').value;
        const order = state.orders.find(o => o.id == orderId);
        
        const resultContainer = document.getElementById('order-status-result');
        
        if (!order) {
            resultContainer.innerHTML = `
                <div class="card">
                    <div class="card-header">Hasil Pencarian</div>
                    <p style="color: var(--text-secondary);">Pesanan dengan nomor ${orderId} tidak ditemukan.</p>
                </div>
            `;
            return;
        }
        
        const statusSteps = [
            { key: 'baru', label: 'Diterima' },
            { key: 'dimasak', label: 'Diproses' },
            { key: 'siap', label: 'Siap Diambil' },
            { key: 'selesai', label: 'Selesai' }
        ];
        
        const currentStepIndex = statusSteps.findIndex(step => step.key === order.status);
        
        resultContainer.innerHTML = `
            <div class="order-status-card">
                <div class="order-status-header">
                    <div class="order-status-id">Order #${order.id}</div>
                    <div class="order-status-badge status-${order.status}">${getStatusLabel(order.status)}</div>
                </div>
                <div class="order-status-timeline">
                    ${statusSteps.map((step, index) => `
                        <div class="order-status-step ${index < currentStepIndex ? 'completed' : index === currentStepIndex ? 'active' : ''}">
                            <div class="order-status-step-circle">
                                ${index < currentStepIndex ? '<i data-lucide="check" style="width: 16px; height: 16px;"></i>' : ''}
                            </div>
                            <div class="order-status-step-label">${step.label}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 1.5rem;">
                    <h4>Detail Pesanan:</h4>
                    <div style="margin-top: 0.5rem;">
                        ${order.items.map(item => `
                            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                                <span>${item.name} x${item.quantity} ${item.status === 'cancel' ? '(Dibatalkan)' : item.status === 'out' ? '(Habis)' : ''}</span>
                                <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-top: 1px solid var(--border-color); margin-top: 0.5rem; font-weight: 600;">
                        <span>Total</span>
                        <span style="color: var(--accent-primary);">Rp ${order.total.toLocaleString('id-ID')}</span>
                    </div>
                </div>
            </div>
        `;
        
        lucide.createIcons();
    }

    function getStatusLabel(status) {
        const statusMap = {
            'baru': 'Baru',
            'dimasak': 'Diproses',
            'siap': 'Siap',
            'selesai': 'Selesai'
        };
        return statusMap[status] || status;
    }

    // --- TABLE SELECTION ---
    function renderTableSelection() {
        const tableGrid = document.getElementById('table-grid');
        tableGrid.innerHTML = state.tables.map(table => `
            <div class="table-card ${table.status}" onclick="selectTable(${table.id})">
                <div class="table-icon">
                    <i data-lucide="${table.status === 'available' ? 'square-stack' : 'users'}"></i>
                </div>
                <div class="table-number">Meja ${table.number}</div>
                <div class="table-status">${table.status === 'available' ? 'Tersedia' : 'Terisi'}</div>
                <div class="table-capacity">
                    <i data-lucide="users"></i>
                    <span>${table.capacity} orang</span>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    }

    function selectTable(tableId) {
        const table = state.tables.find(t => t.id === tableId);
        if (table.status === 'available') {
            state.tableOrder.tableId = tableId;
            showPage('table-order');
        } else {
            showNotification('Meja sudah terisi!', 'warning');
        }
    }

    // --- MENU MANAGEMENT ---
    function renderMenuManagement() {
        const menuList = document.getElementById('menu-list');
        if (state.menu.length === 0) {
            menuList.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Belum ada menu.</p>';
        } else {
            menuList.innerHTML = state.menu.map(item => `
                <div class="menu-item-card">
                    <div class="menu-item-with-image">
                        <div class="menu-image-container">
                            ${item.image ? 
                                `<img src="${item.image}" alt="${item.name}" class="menu-image">` : 
                                `<div class="menu-image-placeholder"><i data-lucide="image"></i></div>`
                            }
                        </div>
                        <div class="menu-item-info">
                            <h4>${item.name} ${item.isBestSeller ? '⭐' : ''} ${item.outOfStock ? '(Habis)' : ''}</h4>
                            <p>${item.category} - Rp ${item.price.toLocaleString('id-ID')}</p>
                            <p style="font-size: 0.8rem; margin-top: 0.5rem;">${item.description || 'Tidak ada deskripsi'}</p>
                        </div>
                    </div>
                    <div class="menu-item-actions">
                        <button class="btn btn-secondary" onclick="editMenuItem(${item.id})"><i data-lucide="edit"></i></button>
                        <button class="btn btn-danger" onclick="deleteMenuItem(${item.id})"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            `).join('');
        }
        lucide.createIcons();
    }

    function openMenuModal(itemId = null) {
        const modal = document.getElementById('menu-modal');
        const title = document.getElementById('menu-modal-title');
        
        if (itemId) {
            const menuItem = state.menu.find(item => item.id === itemId);
            if (menuItem) {
                title.innerText = 'Edit Menu';
                document.getElementById('menu-id').value = menuItem.id;
                document.getElementById('menu-name').value = menuItem.name;
                document.getElementById('menu-category').value = menuItem.category;
                document.getElementById('menu-price').value = menuItem.price;
                document.getElementById('menu-description').value = menuItem.description || '';
                
                // Show image preview if exists
                if (menuItem.image) {
                    document.getElementById('menu-image-preview').innerHTML = 
                        `<img src="${menuItem.image}" alt="Preview" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">`;
                }
            }
        } else {
            title.innerText = 'Tambah Menu';
            document.getElementById('menu-form').reset();
            document.getElementById('menu-id').value = '';
            document.getElementById('menu-image-preview').innerHTML = '';
        }
        
        modal.style.display = 'flex';
    }

    function saveMenuItem(event) {
        event.preventDefault();
        
        const menuItem = {
            name: document.getElementById('menu-name').value,
            category: document.getElementById('menu-category').value,
            price: parseInt(document.getElementById('menu-price').value),
            description: document.getElementById('menu-description').value
        };
        
        const menuId = document.getElementById('menu-id').value;
        
        // Handle image upload
        const imageInput = document.getElementById('menu-image');
        if (imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                menuItem.image = e.target.result;
                saveMenuItemData(menuId, menuItem);
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            // Keep existing image if editing
            if (menuId) {
                const existingItem = state.menu.find(item => item.id == menuId);
                if (existingItem && existingItem.image) {
                    menuItem.image = existingItem.image;
                }
            }
            saveMenuItemData(menuId, menuItem);
        }
    }

    function saveMenuItemData(menuId, menuItem) {
        if (menuId) {
            const index = state.menu.findIndex(item => item.id == menuId);
            if (index !== -1) {
                state.menu[index] = { ...state.menu[index], ...menuItem };
                showNotification('Menu berhasil diperbarui!', 'success');
            }
        } else {
            state.menu.push({
                id: Date.now(),
                ...menuItem,
                isBestSeller: false,
                outOfStock: false
            });
            showNotification('Menu berhasil ditambahkan!', 'success');
        }
        
        saveState();
        closeModal('menu-modal');
        renderMenuManagement();
        renderPOS();
        renderTableOrder();
    }

    function editMenuItem(itemId) {
        openMenuModal(itemId);
    }

    function deleteMenuItem(itemId) {
        if (confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
            state.menu = state.menu.filter(item => item.id !== itemId);
            saveState();
            showNotification('Menu berhasil dihapus!', 'success');
            renderMenuManagement();
            renderPOS();
            renderTableOrder();
        }
    }

    // --- TABLE MANAGEMENT ---
    function renderTableManagement() {
        const tableGrid = document.getElementById('table-management-grid');
        if (state.tables.length === 0) {
            tableGrid.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Belum ada meja.</p>';
        } else {
            tableGrid.innerHTML = state.tables.map(table => `
                <div class="table-management-card ${table.status}">
                    <div class="table-number">Meja ${table.number}</div>
                    <div class="table-status">Kapasitas: ${table.capacity} orang</div>
                    <div class="table-status">${table.status === 'available' ? 'Tersedia' : 'Terisi'}</div>
                    <div class="table-actions">
                        <button class="btn btn-secondary" onclick="editTable(${table.id})"><i data-lucide="edit"></i></button>
                        ${table.status === 'occupied' ? 
                            `<button class="btn btn-success" onclick="freeTable(${table.id})">Bebaskan</button>` : 
                            `<button class="btn btn-danger" onclick="deleteTable(${table.id})"><i data-lucide="trash-2"></i></button>`
                        }
                    </div>
                </div>
            `).join('');
        }
        lucide.createIcons();
    }

    function openTableModal(tableId = null) {
        const modal = document.getElementById('table-modal');
        const title = document.getElementById('table-modal-title');
        
        if (tableId) {
            const table = state.tables.find(t => t.id === tableId);
            if (table) {
                title.innerText = 'Edit Meja';
                document.getElementById('table-id').value = table.id;
                document.getElementById('table-number').value = table.number;
                document.getElementById('table-capacity').value = table.capacity;
                document.getElementById('table-status').value = table.status;
            }
        } else {
            title.innerText = 'Tambah Meja';
            document.getElementById('table-form').reset();
            document.getElementById('table-id').value = '';
        }
        
        modal.style.display = 'flex';
    }

    function saveTable(event) {
        event.preventDefault();
        
        if (!checkLicenseLimits()) return;
        
        const tableData = {
            number: parseInt(document.getElementById('table-number').value),
            capacity: parseInt(document.getElementById('table-capacity').value),
            status: document.getElementById('table-status').value
        };
        
        const tableId = document.getElementById('table-id').value;
        
        if (tableId) {
            const index = state.tables.findIndex(t => t.id == tableId);
            if (index !== -1) {
                state.tables[index] = { ...state.tables[index], ...tableData };
                showNotification('Meja berhasil diperbarui!', 'success');
            }
        } else {
            if (state.tables.some(t => t.number === tableData.number)) {
                showNotification('Nomor meja sudah ada!', 'error');
                return;
            }
            
            state.tables.push({
                id: Date.now(),
                ...tableData
            });
            showNotification('Meja berhasil ditambahkan!', 'success');
        }
        
        saveState();
        closeModal('table-modal');
        renderTableManagement();
        renderTableSelection();
        updateTableOrderSelects();
    }

    function editTable(tableId) {
        openTableModal(tableId);
    }

    function deleteTable(tableId) {
        if (confirm('Apakah Anda yakin ingin menghapus meja ini?')) {
            state.tables = state.tables.filter(t => t.id !== tableId);
            saveState();
            showNotification('Meja berhasil dihapus!', 'success');
            renderTableManagement();
            renderTableSelection();
            updateTableOrderSelects();
        }
    }

    function freeTable(tableId) {
        const table = state.tables.find(t => t.id === tableId);
        if (table) {
            table.status = 'available';
            saveState();
            showNotification(`Meja ${table.number} telah dibebaskan!`, 'success');
            renderTableManagement();
            renderTableSelection();
        }
    }

    function updateTableOrderSelects() {
        const posSelect = document.getElementById('pos-table-select');
        const tableSelect = document.getElementById('table-order-select');
        
        if (posSelect) {
            const currentValue = posSelect.value;
            posSelect.innerHTML = '<option value="0">Take Away</option>' +
                state.tables.map(table => `<option value="${table.id}">Meja ${table.number}</option>`).join('');
            posSelect.value = currentValue;
        }
        
        if (tableSelect) {
            const currentValue = tableSelect.value;
            tableSelect.innerHTML = state.tables.map(table => `<option value="${table.id}">Meja ${table.number}</option>`).join('');
            tableSelect.value = currentValue;
        }
    }

    // --- USER MANAGEMENT ---
    function renderUserManagement() {
        const container = document.getElementById('user-list');
        if (state.users.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Belum ada pengguna.</p>';
        } else {
            container.innerHTML = state.users.map(user => `
                <div class="user-card">
                    <div class="user-info-card">
                        <div class="user-avatar-large">${user.name.charAt(0)}</div>
                        <div class="user-details">
                            <h4>${user.name}</h4>
                            <p>${user.email}</p>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span class="user-role-badge role-${user.role}">${getRoleLabel(user.role)}</span>
                        <div class="menu-item-actions">
                            <button class="btn btn-secondary" onclick="editUser(${user.id})">
                                <i data-lucide="edit"></i>
                            </button>
                            ${user.id !== 1 ? `
                                <button class="btn btn-danger" onclick="deleteUser(${user.id})">
                                    <i data-lucide="trash-2"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        }
        lucide.createIcons();
    }

    function openUserModal(userId = null) {
        const modal = document.getElementById('user-modal');
        const title = document.getElementById('user-modal-title');
        
        if (userId) {
            const user = state.users.find(u => u.id === userId);
            if (user) {
                title.innerText = 'Edit Pengguna';
                document.getElementById('user-id').value = user.id;
                document.getElementById('user-name-input').value = user.name;
                document.getElementById('user-email').value = user.email;
                document.getElementById('user-role').value = user.role;
                document.getElementById('user-password').value = user.password;
            }
        } else {
            title.innerText = 'Tambah Pengguna';
            document.getElementById('user-form').reset();
            document.getElementById('user-id').value = '';
        }
        
        modal.style.display = 'flex';
    }

    function saveUser(event) {
        event.preventDefault();
        
        if (!checkLicenseLimits()) return;
        
        const userData = {
            name: document.getElementById('user-name-input').value,
            email: document.getElementById('user-email').value,
            role: document.getElementById('user-role').value,
            password: document.getElementById('user-password').value
        };
        
        const userId = document.getElementById('user-id').value;
        
        if (userId) {
            const index = state.users.findIndex(u => u.id == userId);
            if (index !== -1) {
                state.users[index] = { ...state.users[index], ...userData };
                showNotification('Pengguna berhasil diperbarui!', 'success');
            }
        } else {
            if (state.users.some(u => u.email === userData.email)) {
                showNotification('Email sudah terdaftar!', 'error');
                return;
            }
            
            state.users.push({
                id: Date.now(),
                ...userData
            });
            showNotification('Pengguna berhasil ditambahkan!', 'success');
        }
        
        saveState();
        closeModal('user-modal');
        renderUserManagement();
    }

    function editUser(userId) {
        openUserModal(userId);
    }

    function deleteUser(userId) {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            state.users = state.users.filter(u => u.id !== userId);
            saveState();
            showNotification('Pengguna berhasil dihapus!', 'success');
            renderUserManagement();
        }
    }

    // --- ORDER HISTORY ---
    function renderOrderHistory() {
        renderSalesChart();
        renderBestSellingItems();
        
        const historyTableBody = document.getElementById('history-table-body');
        const orders = state.orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (orders.length === 0) {
            historyTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-secondary);">Belum ada riwayat pesanan.</td></tr>';
        } else {
            historyTableBody.innerHTML = orders.map(order => `
                <tr>
                    <td>#${order.id}</td>
                    <td>${new Date(order.timestamp).toLocaleDateString('id-ID')}</td>
                    <td>${order.tableId === 0 ? 'Take Away' : `Meja ${order.tableId}`}</td>
                    <td>${order.type}</td>
                    <td>Rp ${order.total.toLocaleString('id-ID')}</td>
                    <td>${getStatusLabel(order.status)}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteOrder(${order.id})"><i data-lucide="trash-2"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    }

    function renderSalesChart() {
        const ctx = document.getElementById('sales-chart');
        if (!ctx) return;
        
        // Generate data for the last 7 days
        const labels = [];
        const data = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            labels.push(dateStr);
            
            const dayOrders = state.orders.filter(order => {
                const orderDate = new Date(order.timestamp);
                return orderDate.toDateString() === date.toDateString();
            });
            
            const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
            data.push(dayRevenue);
        }
        
        // Destroy existing chart if it exists
        if (window.salesChart) {
            window.salesChart.destroy();
        }
        
        // Create new chart
        window.salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Penjualan Harian',
                    data: data,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'Rp ' + value.toLocaleString('id-ID');
                            }
                        }
                    }
                }
            }
        });
    }

    function renderBestSellingItems() {
        const container = document.getElementById('best-selling-items');
        
        // Calculate best selling items
        const itemSales = {};
        state.orders.forEach(order => {
            order.items.forEach(item => {
                if (!itemSales[item.name]) {
                    itemSales[item.name] = 0;
                }
                itemSales[item.name] += item.quantity;
            });
        });
        
        const bestSelling = Object.entries(itemSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        if (bestSelling.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Belum ada data penjualan.</p>';
        } else {
            container.innerHTML = bestSelling.map((item, index) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span style="font-size: 1.5rem; font-weight: 700; color: var(--accent-primary);">${index + 1}</span>
                        <div>
                            <div style="font-weight: 600;">${item[0]}</div>
                            <div style="font-size: 0.875rem; color: var(--text-secondary);">Terjual: ${item[1]} pcs</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600; color: var(--accent-primary);">
                            Rp ${(item[1] * (state.menu.find(m => m.name === item[0])?.price || 0)).toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    function filterOrderHistory() {
        const fromDate = document.getElementById('filter-date-from').value;
        const toDate = document.getElementById('filter-date-to').value;
        
        let filteredOrders = state.orders;
        
        if (fromDate) {
            filteredOrders = filteredOrders.filter(order => 
                new Date(order.timestamp) >= new Date(fromDate)
            );
        }
        
        if (toDate) {
            filteredOrders = filteredOrders.filter(order => 
                new Date(order.timestamp) <= new Date(toDate + 'T23:59:59')
            );
        }
        
        const historyTableBody = document.getElementById('history-table-body');
        
        if (filteredOrders.length === 0) {
            historyTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color: var(--text-secondary);">Tidak ada pesanan dalam rentang tanggal yang dipilih.</td></tr>';
        } else {
            historyTableBody.innerHTML = filteredOrders.map(order => `
                <tr>
                    <td>#${order.id}</td>
                    <td>${new Date(order.timestamp).toLocaleDateString('id-ID')}</td>
                    <td>${order.tableId === 0 ? 'Take Away' : `Meja ${order.tableId}`}</td>
                    <td>${order.type}</td>
                    <td>Rp ${order.total.toLocaleString('id-ID')}</td>
                    <td>${getStatusLabel(order.status)}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteOrder(${order.id})"><i data-lucide="trash-2"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    }

    function exportOrderHistory() {
        const fromDate = document.getElementById('filter-date-from').value;
        const toDate = document.getElementById('filter-date-to').value;
        
        let filteredOrders = state.orders;
        
        if (fromDate) {
            filteredOrders = filteredOrders.filter(order => 
                new Date(order.timestamp) >= new Date(fromDate)
            );
        }
        
        if (toDate) {
            filteredOrders = filteredOrders.filter(order => 
                new Date(order.timestamp) <= new Date(toDate + 'T23:59:59')
            );
        }
        
        let csvContent = "ID Pesanan,Tanggal,Meja,Tipe,Total,Status\n";
        
        filteredOrders.forEach(order => {
            const row = [
                `#${order.id}`,
                new Date(order.timestamp).toLocaleDateString('id-ID'),
                order.tableId === 0 ? 'Take Away' : `Meja ${order.tableId}`,
                order.type,
                `Rp ${order.total.toLocaleString('id-ID')}`,
                getStatusLabel(order.status)
            ].join(',');
            
            csvContent += row + '\n';
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `order_history_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Data riwayat pesanan berhasil diexport!', 'success');
    }

    function deleteOrder(orderId) {
        if (confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
            state.orders = state.orders.filter(o => o.id !== orderId);
            saveState();
            showNotification('Pesanan berhasil dihapus!', 'success');
            renderOrderHistory();
            renderDashboard();
        }
    }

    // --- INVENTORY MANAGEMENT ---
    function renderInventoryManagement() {
        renderLowStockAlerts();
        renderInventoryGrid();
    }

    function renderLowStockAlerts() {
        const container = document.getElementById('low-stock-alerts');
        const lowStockItems = state.inventory.filter(item => item.quantity <= item.minStock);
        
        if (lowStockItems.length === 0) {
            container.innerHTML = '';
        } else {
            container.innerHTML = `
                <div class="low-stock-alert">
                    <div class="low-stock-alert-icon">
                        <i data-lucide="alert-triangle"></i>
                    </div>
                    <div class="low-stock-alert-content">
                        <div class="low-stock-alert-title">Peringatan Stok Menipis</div>
                        <div class="low-stock-alert-text">
                            ${lowStockItems.length} item dengan stok rendah: ${lowStockItems.map(item => item.name).join(', ')}
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();
        }
    }

    function renderInventoryGrid() {
        const inventoryGrid = document.getElementById('inventory-grid');
        if (state.inventory.length === 0) {
            inventoryGrid.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Belum ada barang.</p>';
        } else {
            inventoryGrid.innerHTML = state.inventory.map(item => {
                let statusClass = 'status-good';
                let statusText = 'Stok Aman';
                
                if (item.quantity <= 0) {
                    statusClass = 'status-out';
                    statusText = 'Habis';
                } else if (item.quantity <= item.minStock) {
                    statusClass = 'status-low';
                    statusText = 'Stok Rendah';
                }
                
                return `
                    <div class="inventory-item-card">
                        <div class="inventory-item-header">
                            <div class="inventory-item-name">${item.name}</div>
                            <div class="inventory-item-quantity">${item.quantity} ${item.unit}</div>
                        </div>
                        <div class="inventory-item-status">
                            <div class="status-indicator ${statusClass}"></div>
                            <div>${statusText}</div>
                        </div>
                        <div class="inventory-item-details">
                            <div>Kategori: ${item.category}</div>
                            <div>Min. Stok: ${item.minStock} ${item.unit}</div>
                        </div>
                        <div class="inventory-item-details">
                            <div>Harga: Rp ${item.price.toLocaleString('id-ID')}</div>
                            <div>Total: Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</div>
                        </div>
                        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary" onclick="editInventoryItem(${item.id})" style="flex-grow: 1;">
                                <i data-lucide="edit"></i> Edit
                            </button>
                            <button class="btn btn-danger" onclick="deleteInventoryItem(${item.id})" style="flex-grow: 1;">
                                <i data-lucide="trash-2"></i> Hapus
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        lucide.createIcons();
    }

    function filterInventoryByCategory(category, button) {
        document.querySelectorAll('#inventory-category-tabs .category-tab').forEach(tab => tab.classList.remove('active'));
        button.classList.add('active');
        
        const inventoryGrid = document.getElementById('inventory-grid');
        const itemsToRender = category === 'all' ? state.inventory : state.inventory.filter(item => item.category === category);
        
        if (itemsToRender.length === 0) {
            inventoryGrid.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Tidak ada barang dalam kategori ini.</p>';
        } else {
            inventoryGrid.innerHTML = itemsToRender.map(item => {
                let statusClass = 'status-good';
                let statusText = 'Stok Aman';
                
                if (item.quantity <= 0) {
                    statusClass = 'status-out';
                    statusText = 'Habis';
                } else if (item.quantity <= item.minStock) {
                    statusClass = 'status-low';
                    statusText = 'Stok Rendah';
                }
                
                return `
                    <div class="inventory-item-card">
                        <div class="inventory-item-header">
                            <div class="inventory-item-name">${item.name}</div>
                            <div class="inventory-item-quantity">${item.quantity} ${item.unit}</div>
                        </div>
                        <div class="inventory-item-status">
                            <div class="status-indicator ${statusClass}"></div>
                            <div>${statusText}</div>
                        </div>
                        <div class="inventory-item-details">
                            <div>Kategori: ${item.category}</div>
                            <div>Min. Stok: ${item.minStock} ${item.unit}</div>
                        </div>
                        <div class="inventory-item-details">
                            <div>Harga: Rp ${item.price.toLocaleString('id-ID')}</div>
                            <div>Total: Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</div>
                        </div>
                        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                            <button class="btn btn-secondary" onclick="editInventoryItem(${item.id})" style="flex-grow: 1;">
                                <i data-lucide="edit"></i> Edit
                            </button>
                            <button class="btn btn-danger" onclick="deleteInventoryItem(${item.id})" style="flex-grow: 1;">
                                <i data-lucide="trash-2"></i> Hapus
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        lucide.createIcons();
    }

    function openInventoryModal(itemId = null) {
        const modal = document.getElementById('inventory-modal');
        const title = document.getElementById('inventory-modal-title');
        
        if (itemId) {
            const item = state.inventory.find(i => i.id === itemId);
            if (item) {
                title.innerText = 'Edit Barang';
                document.getElementById('inventory-id').value = item.id;
                document.getElementById('inventory-name').value = item.name;
                document.getElementById('inventory-category').value = item.category;
                document.getElementById('inventory-quantity').value = item.quantity;
                document.getElementById('inventory-unit').value = item.unit;
                document.getElementById('inventory-min-stock').value = item.minStock;
                document.getElementById('inventory-price').value = item.price;
            }
        } else {
            title.innerText = 'Tambah Barang';
            document.getElementById('inventory-form').reset();
            document.getElementById('inventory-id').value = '';
        }
        
        modal.style.display = 'flex';
    }

    function saveInventoryItem(event) {
        event.preventDefault();
        
        const itemData = {
            name: document.getElementById('inventory-name').value,
            category: document.getElementById('inventory-category').value,
            quantity: parseInt(document.getElementById('inventory-quantity').value),
            unit: document.getElementById('inventory-unit').value,
            minStock: parseInt(document.getElementById('inventory-min-stock').value),
            price: parseInt(document.getElementById('inventory-price').value)
        };
        
        const itemId = document.getElementById('inventory-id').value;
        
        if (itemId) {
            const index = state.inventory.findIndex(item => item.id == itemId);
            if (index !== -1) {
                state.inventory[index] = { ...state.inventory[index], ...itemData };
                showNotification('Barang berhasil diperbarui!', 'success');
            }
        } else {
            state.inventory.push({
                id: Date.now(),
                ...itemData
            });
            showNotification('Barang berhasil ditambahkan!', 'success');
        }
        
        saveState();
        closeModal('inventory-modal');
        renderInventoryManagement();
    }

    function editInventoryItem(itemId) {
        openInventoryModal(itemId);
    }

    function deleteInventoryItem(itemId) {
        if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
            state.inventory = state.inventory.filter(item => item.id !== itemId);
            saveState();
            showNotification('Barang berhasil dihapus!', 'success');
            renderInventoryManagement();
        }
    }

    // --- ASSET MANAGEMENT ---
    function renderAssetManagement() {
        renderAssetGrid();
    }

    function renderAssetGrid() {
        const assetGrid = document.getElementById('asset-grid');
        if (state.assets.length === 0) {
            assetGrid.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Belum ada aset.</p>';
        } else {
            assetGrid.innerHTML = state.assets.map(asset => `
                <div class="asset-card">
                    ${asset.image ? `<img src="${asset.image}" alt="${asset.name}" class="asset-image">` : ''}
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-category">${asset.category}</div>
                    <div class="asset-details">
                        <div>Jumlah: ${asset.quantity} ${asset.lostQuantity > 0 ? `(${asset.lostQuantity} hilang)` : ''}</div>
                        <div>Tanggal Beli: ${new Date(asset.purchaseDate).toLocaleDateString('id-ID')}</div>
                    </div>
                    <div class="asset-details">
                        <div>Harga: Rp ${asset.price.toLocaleString('id-ID')}</div>
                        <div>Nilai Saat Ini: Rp ${asset.currentValue.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="asset-details">
                        <div>Lokasi: ${asset.location}</div>
                        <div>Status: ${asset.status}</div>
                    </div>
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary" onclick="editAsset(${asset.id})" style="flex-grow: 1;">
                            <i data-lucide="edit"></i> Edit
                        </button>
                        <button class="btn btn-danger" onclick="deleteAsset(${asset.id})" style="flex-grow: 1;">
                            <i data-lucide="trash-2"></i> Hapus
                        </button>
                    </div>
                </div>
            `).join('');
        }
        lucide.createIcons();
    }

    function filterAssetsByCategory(category, button) {
        document.querySelectorAll('#asset-category-tabs .category-tab').forEach(tab => tab.classList.remove('active'));
        button.classList.add('active');
        
        const assetGrid = document.getElementById('asset-grid');
        const assetsToRender = category === 'all' ? state.assets : state.assets.filter(asset => asset.category === category);
        
        if (assetsToRender.length === 0) {
            assetGrid.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Tidak ada aset dalam kategori ini.</p>';
        } else {
            assetGrid.innerHTML = assetsToRender.map(asset => `
                <div class="asset-card">
                    ${asset.image ? `<img src="${asset.image}" alt="${asset.name}" class="asset-image">` : ''}
                    <div class="asset-name">${asset.name}</div>
                    <div class="asset-category">${asset.category}</div>
                    <div class="asset-details">
                        <div>Jumlah: ${asset.quantity} ${asset.lostQuantity > 0 ? `(${asset.lostQuantity} hilang)` : ''}</div>
                        <div>Tanggal Beli: ${new Date(asset.purchaseDate).toLocaleDateString('id-ID')}</div>
                    </div>
                    <div class="asset-details">
                        <div>Harga: Rp ${asset.price.toLocaleString('id-ID')}</div>
                        <div>Nilai Saat Ini: Rp ${asset.currentValue.toLocaleString('id-ID')}</div>
                    </div>
                    <div class="asset-details">
                        <div>Lokasi: ${asset.location}</div>
                        <div>Status: ${asset.status}</div>
                    </div>
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-secondary" onclick="editAsset(${asset.id})" style="flex-grow: 1;">
                            <i data-lucide="edit"></i> Edit
                        </button>
                        <button class="btn btn-danger" onclick="deleteAsset(${asset.id})" style="flex-grow: 1;">
                            <i data-lucide="trash-2"></i> Hapus
                        </button>
                    </div>
                </div>
            `).join('');
        }
        lucide.createIcons();
    }

    function openAssetModal(assetId = null) {
        const modal = document.getElementById('asset-modal');
        const title = document.getElementById('asset-modal-title');
        
        if (assetId) {
            const asset = state.assets.find(a => a.id === assetId);
            if (asset) {
                title.innerText = 'Edit Aset';
                document.getElementById('asset-id').value = asset.id;
                document.getElementById('asset-name').value = asset.name;
                document.getElementById('asset-category').value = asset.category;
                document.getElementById('asset-quantity').value = asset.quantity;
                document.getElementById('asset-purchase-date').value = asset.purchaseDate;
                document.getElementById('asset-price').value = asset.price;
                document.getElementById('asset-current-value').value = asset.currentValue;
                document.getElementById('asset-location').value = asset.location;
                document.getElementById('asset-status').value = asset.status;
                document.getElementById('asset-lost-quantity').value = asset.lostQuantity || 0;
                
                // Show image preview if exists
                if (asset.image) {
                    document.getElementById('asset-image-preview').innerHTML = 
                        `<img src="${asset.image}" alt="Preview" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">`;
                }
            }
        } else {
            title.innerText = 'Tambah Aset';
            document.getElementById('asset-form').reset();
            document.getElementById('asset-id').value = '';
            document.getElementById('asset-image-preview').innerHTML = '';
        }
        
        modal.style.display = 'flex';
    }

    function saveAsset(event) {
        event.preventDefault();
        
        const assetData = {
            name: document.getElementById('asset-name').value,
            category: document.getElementById('asset-category').value,
            quantity: parseInt(document.getElementById('asset-quantity').value),
            purchaseDate: document.getElementById('asset-purchase-date').value,
            price: parseInt(document.getElementById('asset-price').value),
            currentValue: parseInt(document.getElementById('asset-current-value').value),
            location: document.getElementById('asset-location').value,
            status: document.getElementById('asset-status').value,
            lostQuantity: parseInt(document.getElementById('asset-lost-quantity').value) || 0
        };
        
        const assetId = document.getElementById('asset-id').value;
        
        // Handle image upload
        const imageInput = document.getElementById('asset-image');
        if (imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                assetData.image = e.target.result;
                saveAssetData(assetId, assetData);
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            // Keep existing image if editing
            if (assetId) {
                const existingAsset = state.assets.find(asset => asset.id == assetId);
                if (existingAsset && existingAsset.image) {
                    assetData.image = existingAsset.image;
                }
            }
            saveAssetData(assetId, assetData);
        }
    }

    function saveAssetData(assetId, assetData) {
        if (assetId) {
            const index = state.assets.findIndex(asset => asset.id == assetId);
            if (index !== -1) {
                state.assets[index] = { ...state.assets[index], ...assetData };
                showNotification('Aset berhasil diperbarui!', 'success');
            }
        } else {
            state.assets.push({
                id: Date.now(),
                ...assetData
            });
            showNotification('Aset berhasil ditambahkan!', 'success');
        }
        
        saveState();
        closeModal('asset-modal');
        renderAssetManagement();
    }

    function editAsset(assetId) {
        openAssetModal(assetId);
    }

    function deleteAsset(assetId) {
        if (confirm('Apakah Anda yakin ingin menghapus aset ini?')) {
            state.assets = state.assets.filter(asset => asset.id !== assetId);
            saveState();
            showNotification('Aset berhasil dihapus!', 'success');
            renderAssetManagement();
        }
    }

    // --- FINANCIAL MANAGEMENT ---
    function renderFinancialManagement() {
        renderFinancialSummary();
        renderFinancialCharts();
        renderTransactionList();
    }

    function renderFinancialSummary() {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        const monthlyTransactions = state.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === thisMonth && transactionDate.getFullYear() === thisYear;
        });
        
        const monthlyIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const monthlyExpenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const netProfit = monthlyIncome - monthlyExpenses;
        
        document.getElementById('monthly-revenue').textContent = `Rp ${monthlyIncome.toLocaleString('id-ID')}`;
        document.getElementById('monthly-expenses').textContent = `Rp ${monthlyExpenses.toLocaleString('id-ID')}`;
        document.getElementById('net-profit').textContent = `Rp ${netProfit.toLocaleString('id-ID')}`;
        document.getElementById('total-transactions').textContent = monthlyTransactions.length.toLocaleString('id-ID');
    }

    function renderFinancialCharts() {
        renderFinancialChart();
        renderExpenseChart();
    }

    function renderFinancialChart() {
        const ctx = document.getElementById('financial-chart');
        if (!ctx) return;
        
        // Generate data for the last 6 months
        const labels = [];
        const incomeData = [];
        const expenseData = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStr = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
            labels.push(monthStr);
            
            const monthTransactions = state.transactions.filter(transaction => {
                const transactionDate = new Date(transaction.date);
                return transactionDate.getMonth() === date.getMonth() && 
                       transactionDate.getFullYear() === date.getFullYear();
            });
            
            const monthIncome = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
            
            const monthExpense = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            incomeData.push(monthIncome);
            expenseData.push(monthExpense);
        }
        
        // Destroy existing chart if it exists
        if (window.financialChart) {
            window.financialChart.destroy();
        }
        
        // Create new chart
        window.financialChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Pemasukan',
                        data: incomeData,
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Pengeluaran',
                        data: expenseData,
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'Rp ' + value.toLocaleString('id-ID');
                            }
                        }
                    }
                }
            }
        });
    }

    function renderExpenseChart() {
        const ctx = document.getElementById('expense-chart');
        if (!ctx) return;
        
        // Calculate expenses by category
        const expensesByCategory = {};
        state.transactions
            .filter(t => t.type === 'expense')
            .forEach(transaction => {
                if (!expensesByCategory[transaction.category]) {
                    expensesByCategory[transaction.category] = 0;
                }
                expensesByCategory[transaction.category] += transaction.amount;
            });
        
        const labels = Object.keys(expensesByCategory);
        const data = Object.values(expensesByCategory);
        
        // Destroy existing chart if it exists
        if (window.expenseChart) {
            window.expenseChart.destroy();
        }
        
        // Create new chart
        window.expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    function renderTransactionList() {
        const container = document.getElementById('transaction-list');
        const transactions = state.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (transactions.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Belum ada transaksi.</p>';
        } else {
            container.innerHTML = transactions.slice(0, 10).map(transaction => `
                <div class="transaction-item">
                    <div>
                        <div style="font-weight: 600;">${transaction.category}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">
                            ${new Date(transaction.date).toLocaleDateString('id-ID')} • ${transaction.description || '-'}</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="transaction-amount" style="color: ${transaction.type === 'income' ? 'var(--accent-success)' : 'var(--accent-danger)'};">
                            ${transaction.type === 'income' ? '+' : '-'}Rp ${transaction.amount.toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    function openTransactionModal() {
        const modal = document.getElementById('transaction-modal');
        document.getElementById('transaction-form').reset();
        document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
        modal.style.display = 'flex';
    }

    function saveTransaction(event) {
        event.preventDefault();
        
        const transactionData = {
            type: document.getElementById('transaction-type').value,
            category: document.getElementById('transaction-category').value,
            amount: parseInt(document.getElementById('transaction-amount').value),
            description: document.getElementById('transaction-description').value,
            date: document.getElementById('transaction-date').value
        };
        
        state.transactions.push({
            id: Date.now(),
            ...transactionData
        });
        
        saveState();
        closeModal('transaction-modal');
        showNotification('Transaksi berhasil ditambahkan!', 'success');
        renderFinancialManagement();
    }

    // --- PAYROLL MANAGEMENT ---
    function renderPayrollManagement() {
        const container = document.getElementById('payroll-grid');
        const employees = state.users.filter(u => u.role !== 'owner');
        
        if (employees.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Belum ada karyawan.</p>';
        } else {
            container.innerHTML = employees.map(employee => {
                const payroll = state.payroll.find(p => p.employeeId === employee.id);
                const currentMonth = new Date().toISOString().slice(0, 7);
                const currentPayroll = payroll && payroll.period === currentMonth ? payroll : null;
                
                return `
                    <div class="payroll-card">
                        <div class="payroll-header">
                            <div class="payroll-name">${employee.name}</div>
                            <div class="payroll-role">${getRoleLabel(employee.role)}</div>
                        </div>
                        <div class="payroll-details">
                            <div class="payroll-detail"><strong>Periode:</strong> ${currentMonth}</div>
                            <div class="payroll-detail"><strong>Gaji Pokok:</strong> Rp ${(currentPayroll?.base || 0).toLocaleString('id-ID')}</div>
                            <div class="payroll-detail"><strong>Tunjangan:</strong> Rp ${(currentPayroll?.allowance || 0).toLocaleString('id-ID')}</div>
                            <div class="payroll-detail"><strong>Potongan:</strong> Rp ${(currentPayroll?.deduction || 0).toLocaleString('id-ID')}</div>
                            <div class="payroll-detail"><strong>Total:</strong> <strong style="color: var(--accent-primary);">Rp ${(currentPayroll?.total || 0).toLocaleString('id-ID')}</strong></div>
                        </div>
                        <div class="payroll-actions">
                            <button class="btn btn-primary" onclick="openPayrollModal(${employee.id})">
                                <i data-lucide="edit"></i> ${currentPayroll ? 'Edit' : 'Tambah'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        lucide.createIcons();
    }

    function openPayrollModal(employeeId = null) {
        const modal = document.getElementById('payroll-modal');
        const title = document.getElementById('payroll-modal-title');
        const employeeSelect = document.getElementById('payroll-employee');
        
        // Populate employee select
        const employees = state.users.filter(u => u.role !== 'owner');
        employeeSelect.innerHTML = '<option value="">Pilih Karyawan</option>' +
            employees.map(emp => `<option value="${emp.id}">${emp.name} - ${getRoleLabel(emp.role)}</option>`).join('');
        
        if (employeeId) {
            const employee = employees.find(e => e.id === employeeId);
            const payroll = state.payroll.find(p => p.employeeId === employeeId && p.period === new Date().toISOString().slice(0, 7));
            
            if (payroll) {
                title.innerText = 'Edit Gaji';
                document.getElementById('payroll-id').value = payroll.id;
                employeeSelect.value = employeeId;
                document.getElementById('payroll-period').value = payroll.period;
                document.getElementById('payroll-base').value = payroll.base;
                document.getElementById('payroll-allowance').value = payroll.allowance;
                document.getElementById('payroll-deduction').value = payroll.deduction;
                document.getElementById('payroll-total').value = payroll.total;
            } else {
                title.innerText = 'Tambah Gaji';
                document.getElementById('payroll-form').reset();
                document.getElementById('payroll-id').value = '';
                employeeSelect.value = employeeId;
                document.getElementById('payroll-period').value = new Date().toISOString().slice(0, 7);
            }
        } else {
            title.innerText = 'Tambah Gaji';
            document.getElementById('payroll-form').reset();
            document.getElementById('payroll-id').value = '';
            document.getElementById('payroll-period').value = new Date().toISOString().slice(0, 7);
        }
        
        modal.style.display = 'flex';
    }

    function savePayroll(event) {
        event.preventDefault();
        
        const payrollData = {
            employeeId: parseInt(document.getElementById('payroll-employee').value),
            period: document.getElementById('payroll-period').value,
            base: parseInt(document.getElementById('payroll-base').value),
            allowance: parseInt(document.getElementById('payroll-allowance').value),
            deduction: parseInt(document.getElementById('payroll-deduction').value),
            total: parseInt(document.getElementById('payroll-total').value)
        };
        
        const payrollId = document.getElementById('payroll-id').value;
        
        if (payrollId) {
            const index = state.payroll.findIndex(p => p.id == payrollId);
            if (index !== -1) {
                state.payroll[index] = { ...state.payroll[index], ...payrollData };
                showNotification('Gaji berhasil diperbarui!', 'success');
            }
        } else {
            state.payroll.push({
                id: Date.now(),
                ...payrollData
            });
            showNotification('Gaji berhasil ditambahkan!', 'success');
        }
        
        saveState();
        closeModal('payroll-modal');
        renderPayrollManagement();
    }

    // --- SHIFT MANAGEMENT ---
    function renderShiftManagement() {
        const container = document.getElementById('shift-grid');
        
        if (state.shifts.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Belum ada shift.</p>';
        } else {
            container.innerHTML = state.shifts.map(shift => {
                const shiftEmployees = state.users.filter(u => shift.employees.includes(u.id));
                
                return `
                    <div class="shift-card">
                        <div class="shift-header">
                            <div class="shift-name">${shift.name}</div>
                            <div class="shift-time">${shift.startTime} - ${shift.endTime}</div>
                        </div>
                        <div class="shift-employees">
                            ${shiftEmployees.map(employee => `
                                <div class="shift-employee">
                                    <div class="shift-employee-avatar">${employee.name.charAt(0)}</div>
                                    <div>
                                        <div style="font-weight: 500;">${employee.name}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-secondary);">${getRoleLabel(employee.role)}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="shift-actions">
                            <button class="btn btn-secondary" onclick="openShiftModal(${shift.id})">
                                <i data-lucide="edit"></i> Edit
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        lucide.createIcons();
    }

    function openShiftModal(shiftId = null) {
        const modal = document.getElementById('shift-modal');
        const title = document.getElementById('shift-modal-title');
        const employeesList = document.getElementById('shift-employees-list');
        
        // Populate employees list
        const employees = state.users.filter(u => u.role !== 'owner');
        employeesList.innerHTML = employees.map(employee => `
            <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <input type="checkbox" name="shift-employees" value="${employee.id}" ${shiftId && state.shifts.find(s => s.id === shiftId)?.employees.includes(employee.id) ? 'checked' : ''}>
                <span>${employee.name} - ${getRoleLabel(employee.role)}</span>
            </label>
        `).join('');
        
        if (shiftId) {
            const shift = state.shifts.find(s => s.id === shiftId);
            if (shift) {
                title.innerText = 'Edit Shift';
                document.getElementById('shift-id').value = shift.id;
                document.getElementById('shift-name').value = shift.name;
                document.getElementById('shift-start').value = shift.startTime;
                document.getElementById('shift-end').value = shift.endTime;
            }
        } else {
            title.innerText = 'Tambah Shift';
            document.getElementById('shift-form').reset();
            document.getElementById('shift-id').value = '';
        }
        
        modal.style.display = 'flex';
    }

    function saveShift(event) {
        event.preventDefault();
        
        const selectedEmployees = Array.from(document.querySelectorAll('input[name="shift-employees"]:checked'))
            .map(cb => parseInt(cb.value));
        
        const shiftData = {
            name: document.getElementById('shift-name').value,
            startTime: document.getElementById('shift-start').value,
            endTime: document.getElementById('shift-end').value,
            employees: selectedEmployees
        };
        
        const shiftId = document.getElementById('shift-id').value;
        
        if (shiftId) {
            const index = state.shifts.findIndex(s => s.id == shiftId);
            if (index !== -1) {
                state.shifts[index] = { ...state.shifts[index], ...shiftData };
                showNotification('Shift berhasil diperbarui!', 'success');
            }
        } else {
            state.shifts.push({
                id: Date.now(),
                ...shiftData
            });
            showNotification('Shift berhasil ditambahkan!', 'success');
        }
        
        saveState();
        closeModal('shift-modal');
        renderShiftManagement();
    }

    // --- BRANCH MANAGEMENT ---
    function renderBranchManagement() {
        const container = document.getElementById('branch-grid');
        
        if (state.branches.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--text-secondary);">Belum ada cabang.</p>';
        } else {
            container.innerHTML = state.branches.map(branch => {
                const manager = state.users.find(u => u.id === branch.manager);
                
                return `
                    <div class="branch-card">
                        <div class="branch-header">
                            <div class="branch-name">${branch.name}</div>
                            <div class="branch-status ${branch.status}">${branch.status === 'active' ? 'Aktif' : 'Tidak Aktif'}</div>
                        </div>
                        <div class="branch-details">
                            <div class="branch-detail"><strong>Alamat:</strong> ${branch.address}</div>
                            <div class="branch-detail"><strong>Telepon:</strong> ${branch.phone}</div>
                            <div class="branch-detail"><strong>Email:</strong> ${branch.email || '-'}</div>
                            <div class="branch-detail"><strong>Manager:</strong> ${manager ? manager.name : '-'}</div>
                        </div>
                        <div class="branch-actions">
                            <button class="btn btn-secondary" onclick="openBranchModal(${branch.id})">
                                <i data-lucide="edit"></i> Edit
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
        lucide.createIcons();
    }

    function openBranchModal(branchId = null) {
        const modal = document.getElementById('branch-modal');
        const title = document.getElementById('branch-modal-title');
        const managerSelect = document.getElementById('branch-manager');
        
        // Populate manager select
        const managers = state.users.filter(u => u.role === 'admin' || u.role === 'owner');
        managerSelect.innerHTML = '<option value="">Pilih Manager</option>' +
            managers.map(manager => `<option value="${manager.id}">${manager.name}</option>`).join('');
        
        if (branchId) {
            const branch = state.branches.find(b => b.id === branchId);
            if (branch) {
                title.innerText = 'Edit Cabang';
                document.getElementById('branch-id').value = branch.id;
                document.getElementById('branch-name').value = branch.name;
                document.getElementById('branch-address').value = branch.address;
                document.getElementById('branch-phone').value = branch.phone;
                document.getElementById('branch-email').value = branch.email || '';
                managerSelect.value = branch.manager;
                document.getElementById('branch-status').value = branch.status;
            }
        } else {
            title.innerText = 'Tambah Cabang';
            document.getElementById('branch-form').reset();
            document.getElementById('branch-id').value = '';
        }
        
        modal.style.display = 'flex';
    }

    function saveBranch(event) {
        event.preventDefault();
        
        const branchData = {
            name: document.getElementById('branch-name').value,
            address: document.getElementById('branch-address').value,
            phone: document.getElementById('branch-phone').value,
            email: document.getElementById('branch-email').value,
            manager: parseInt(document.getElementById('branch-manager').value),
            status: document.getElementById('branch-status').value
        };
        
        const branchId = document.getElementById('branch-id').value;
        
        if (branchId) {
            const index = state.branches.findIndex(b => b.id == branchId);
            if (index !== -1) {
                state.branches[index] = { ...state.branches[index], ...branchData };
                showNotification('Cabang berhasil diperbarui!', 'success');
            }
        } else {
            state.branches.push({
                id: Date.now(),
                ...branchData
            });
            showNotification('Cabang berhasil ditambahkan!', 'success');
        }
        
        saveState();
        closeModal('branch-modal');
        renderBranchManagement();
    }

    // --- LICENSE MANAGEMENT ---
    function renderLicensePage() {
        updateLicenseInfo();
        renderUsageStatistics();
        renderTransactionHistory();
        renderSubscriptionPlans();
    }

    function updateLicenseInfo() {
        const expiryDate = new Date(state.license.expiryDate);
        const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        
        document.getElementById('license-plan').textContent = getPlanLabel(state.license.plan);
        document.getElementById('license-expiry').textContent = expiryDate.toLocaleDateString('id-ID');
        document.getElementById('license-days-left').textContent = `${Math.max(0, daysLeft)} Hari`;
        document.getElementById('license-max-users').textContent = `${state.license.maxUsers} Users`;
    }

    function renderUsageStatistics() {
        const activeUsers = state.users.length;
        const usedTables = state.tables.length;
        
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        const monthlyOrders = state.orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
        });
        
        const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        document.getElementById('active-users-count').textContent = `${activeUsers}/${state.license.maxUsers}`;
        document.getElementById('used-tables-count').textContent = `${usedTables}/${state.license.maxTables}`;
        document.getElementById('monthly-orders').textContent = monthlyOrders.length.toLocaleString('id-ID');
        document.getElementById('monthly-revenue').textContent = `Rp ${monthlyRevenue.toLocaleString('id-ID')}`;
    }

    function renderTransactionHistory() {
        const container = document.getElementById('transaction-history');
        const transactions = state.licenseTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (transactions.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: var(--text-secondary); padding: 2rem 0;">Belum ada transaksi.</p>';
        } else {
            container.innerHTML = transactions.map(transaction => `
                <div class="transaction-item">
                    <div>
                        <div style="font-weight: 600;">${getPlanLabel(transaction.plan)} - ${transaction.type === 'purchase' ? 'Pembelian' : 'Perpanjangan'}</div>
                        <div style="font-size: 0.875rem; color: var(--text-secondary);">
                            ${new Date(transaction.date).toLocaleDateString('id-ID')} • ${transaction.paymentMethod}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="transaction-amount">Rp ${transaction.amount.toLocaleString('id-ID')}</div>
                        <div class="transaction-status status-${transaction.status}">
                            ${transaction.status === 'completed' ? 'Selesai' : transaction.status === 'pending' ? 'Menunggu' : 'Gagal'}
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    function renderSubscriptionPlans() {
        const container = document.getElementById('subscription-plans');
        const subscriptionPlans = [
            {
                id: 'basic',
                name: 'Dasar',
                price: 299000,
                period: 'per bulan',
                features: [
                    'Maksimal 5 pengguna',
                    'Maksimal 10 meja',
                    'Support standar',
                    'Semua fitur POS',
                    'Laporan penjualan'
                ],
                recommended: false
            },
            {
                id: 'premium',
                name: 'Premium',
                price: 599000,
                period: 'per bulan',
                features: [
                    'Maksimal 10 pengguna',
                    'Maksimal 15 meja',
                    'Support prioritas',
                    'Semua fitur POS',
                    'Laporan lengkap',
                    'Analitik lanjutan'
                ],
                recommended: true
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                price: 999000,
                period: 'per bulan',
                features: [
                    'Pengguna tidak terbatas',
                    'Meja tidak terbatas',
                    'Support 24/7',
                    'Semua fitur POS',
                    'Laporan lengkap',
                    'Analitik lanjutan',
                    'Integrasi eksternal',
                    'Custom development'
                ],
                recommended: false
            }
        ];
        
        container.innerHTML = subscriptionPlans.map(plan => `
            <div class="plan-card ${plan.recommended ? 'recommended' : ''} ${state.license.plan === plan.id ? 'selected' : ''}" 
                 onclick="selectPlan('${plan.id}')">
                <h3>${plan.name}</h3>
                <div class="plan-price">Rp ${plan.price.toLocaleString('id-ID')}</div>
                <div class="plan-period">${plan.period}</div>
                <ul class="plan-features">
                    ${plan.features.map(feature => `<li><i data-lucide="check"></i> ${feature}</li>`).join('')}
                </ul>
                <button class="btn ${state.license.plan === plan.id ? 'btn-secondary' : 'btn-primary'}">
                    ${state.license.plan === plan.id ? 'Paket Aktif' : 'Pilih Paket'}
                </button>
            </div>
        `).join('');
        
        lucide.createIcons();
    }

    function openUpgradeModal() {
        const modal = document.getElementById('upgrade-modal');
        const container = document.getElementById('upgrade-plans-container');
        
        const upgradePlans = [
            {
                id: 'basic',
                name: 'Dasar',
                price: 299000,
                features: ['Maksimal 5 pengguna', 'Support standar']
            },
            {
                id: 'premium', 
                name: 'Premium',
                price: 599000,
                features: ['Maksimal 10 pengguna', 'Support prioritas']
            },
            {
                id: 'enterprise',
                name: 'Enterprise', 
                price: 999000,
                features: ['Pengguna tidak terbatas', 'Support 24/7']
            }
        ];
        
        container.innerHTML = upgradePlans.map(plan => `
            <div class="plan-card ${state.license.plan === plan.id ? 'selected' : ''}" 
                 onclick="processUpgrade('${plan.id}')">
                <h3>${plan.name}</h3>
                <div class="plan-price">Rp ${plan.price.toLocaleString('id-ID')}</div>
                <ul class="plan-features">
                    ${plan.features.map(feature => `<li><i data-lucide="check"></i> ${feature}</li>`).join('')}
                </ul>
                <button class="btn ${state.license.plan === plan.id ? 'btn-secondary' : 'btn-primary'}">
                    ${state.license.plan === plan.id ? 'Paket Saat Ini' : 'Upgrade Sekarang'}
                </button>
            </div>
        `).join('');
        
        modal.style.display = 'flex';
        lucide.createIcons();
    }

    function processUpgrade(planId) {
        if (state.license.plan === planId) {
            showNotification('Anda sudah menggunakan paket ini.', 'info');
            return;
        }
        
        const plans = {
            'basic': { maxUsers: 5, price: 299000 },
            'premium': { maxUsers: 10, price: 599000 },
            'enterprise': { maxUsers: 999, price: 999000 }
        };
        
        const selectedPlan = plans[planId];
        if (!selectedPlan) return;

        const newTransaction = {
            id: Date.now(),
            type: 'upgrade',
            plan: planId,
            amount: selectedPlan.price,
            date: new Date().toISOString(),
            status: 'completed',
            paymentMethod: 'Transfer Bank'
        };
        
        state.licenseTransactions.push(newTransaction);
        state.license.plan = planId;
        state.license.maxUsers = selectedPlan.maxUsers;
        state.license.status = 'active';

        if (state.users.length > selectedPlan.maxUsers) {
            state.users = state.users.slice(0, selectedPlan.maxUsers);
            showNotification(`Jumlah pengguna disesuaikan dengan paket baru.`, 'warning');
        }

        saveState();
        closeModal('upgrade-modal');
        renderLicensePage();
        showNotification(`Berhasil upgrade ke paket ${getPlanLabel(planId)}!`, 'success');
    }

    function extendLicense() {
        const plans = {
            'basic': { price: 299000 },
            'premium': { price: 599000 },
            'enterprise': { price: 999000 }
        };
        
        const currentPlan = plans[state.license.plan];
        if (!currentPlan) return;
        
        if (confirm(`Perpanjang lisensi ${getPlanLabel(state.license.plan)} dengan biaya Rp ${currentPlan.price.toLocaleString('id-ID')}?`)) {
            const newTransaction = {
                id: Date.now(),
                type: 'renewal',
                plan: state.license.plan,
                amount: currentPlan.price,
                date: new Date().toISOString(),
                status: 'completed',
                paymentMethod: 'QRIS'
            };
            
            state.licenseTransactions.push(newTransaction);
            
            const currentExpiry = new Date(state.license.expiryDate);
            currentExpiry.setDate(currentExpiry.getDate() + 30);
            state.license.expiryDate = currentExpiry.toISOString();
            state.license.status = 'active';
            
            saveState();
            renderLicensePage();
            showNotification('Lisensi berhasil diperpanjang 30 hari!', 'success');
        }
    }

    function showLicenseKey() {
        document.getElementById('license-key-display').value = state.license.key || 'Tidak ada kunci lisensi';
        document.getElementById('license-expiry-display').value = new Date(state.license.expiryDate).toLocaleDateString('id-ID');
        document.getElementById('license-key-modal').style.display = 'flex';
    }

    function copyLicenseKey() {
        const licenseKey = document.getElementById('license-key-display');
        licenseKey.select();
        navigator.clipboard.writeText(licenseKey.value);
        showNotification('Kunci lisensi berhasil disalin!', 'success');
    }

    function selectPlan(planId) {
        processUpgrade(planId);
    }

    function getPlanLabel(planId) {
        const planMap = {
            'basic': 'Dasar',
            'premium': 'Premium', 
            'enterprise': 'Enterprise'
        };
        return planMap[planId] || planId;
    }

    function checkLicenseLimits() {
        if (state.users.length >= state.license.maxUsers) {
            showNotification(`Batas maksimal pengguna (${state.license.maxUsers}) telah tercapai! Upgrade paket untuk menambah lebih banyak pengguna.`, 'error');
            return false;
        }
        
        if (state.tables.length >= state.license.maxTables) {
            showNotification(`Batas maksimal meja (${state.license.maxTables}) telah tercapai! Upgrade paket untuk menambah lebih banyak meja.`, 'error');
            return false;
        }
        
        if (state.license.status === 'expired') {
            showNotification('Lisensi Anda telah kedaluwarsa! Silakan perpanjang untuk melanjutkan menggunakan aplikasi.', 'error');
            return false;
        }
        
        return true;
    }

    // --- UI HELPERS ---
    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    function toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
    }

    function updateTableOrder() {
        renderTableOrder();
    }

    function renderCurrentPage() {
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            const pageId = activePage.id.replace('-page', '');
            showPage(pageId);
        }
    }

    // --- INITIALIZATION ---
    document.addEventListener('DOMContentLoaded', function() {
        loadState();
        lucide.createIcons();

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showPage(this.dataset.page);
            });
        });

        document.addEventListener('click', function(e) {
            if (!e.target.closest('.user-dropdown')) {
                document.getElementById('userDropdownMenu').classList.remove('show');
            }
        });

        document.getElementById('payment-amount').addEventListener('input', function() {
            const total = parseInt(document.getElementById('modal-total').textContent.replace(/\D/g,''));
            const paidAmount = parseInt(this.value) || 0;
            const change = paidAmount - total;
            document.getElementById('payment-change').textContent = `Rp ${Math.max(0, change).toLocaleString('id-ID')}`;
        });

        // Auto-calculate payroll total
        document.getElementById('payroll-base')?.addEventListener('input', calculatePayrollTotal);
        document.getElementById('payroll-allowance')?.addEventListener('input', calculatePayrollTotal);
        document.getElementById('payroll-deduction')?.addEventListener('input', calculatePayrollTotal);

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('filter-date-from').value = today;
        document.getElementById('filter-date-to').value = today;

        renderUserInterface();
    });

    function calculatePayrollTotal() {
        const base = parseInt(document.getElementById('payroll-base').value) || 0;
        const allowance = parseInt(document.getElementById('payroll-allowance').value) || 0;
        const deduction = parseInt(document.getElementById('payroll-deduction').value) || 0;
        const total = base + allowance - deduction;
        document.getElementById('payroll-total').value = total;
    }