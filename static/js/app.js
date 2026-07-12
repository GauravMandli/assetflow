/**
 * AssetFlow Portal Core Javascript Utility (app.js)
 * Manages responsive UI panels, theme toggles, live search/filtering,
 * table sorting, slide-out drawers, loading skeletons, and toast alerts.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    initDropdowns();
    initTableSorting();
    initTableFiltering();
    initDrawers();
    initToasts();
    initSkeletons();
});

/**
 * 1. Theme Configuration & Sync
 */
function initTheme() {
    const savedTheme = localStorage.getItem('assetflow-theme') || 'light';
    setTheme(savedTheme);

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('assetflow-theme', theme);
    
    const themeIcon = document.querySelector('#theme-toggle-btn i');
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.className = 'bi bi-sun-fill';
        } else {
            themeIcon.className = 'bi bi-moon-stars-fill';
        }
    }
}

/**
 * 2. Collapsible Navigation Sidebar Toggles
 */
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                sidebar.classList.toggle('show-mobile');
            } else {
                sidebar.classList.toggle('collapsed');
            }
        });
    }

    // Close mobile side menu when clicking outside
    document.addEventListener('click', (event) => {
        if (window.innerWidth < 992 && sidebar && toggleBtn) {
            if (!sidebar.contains(event.target) && !toggleBtn.contains(event.target) && sidebar.classList.contains('show-mobile')) {
                sidebar.classList.remove('show-mobile');
            }
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992 && sidebar) {
            sidebar.classList.remove('show-mobile');
        }
    });
}

/**
 * 3. Bootstrap Dropdown Utilities
 */
function initDropdowns() {
    // Dropdown toggles are handled by Bootstrap 5 bundles.
}

/**
 * 4. Client-side Column-based Table Sorters
 */
function initTableSorting() {
    const tables = document.querySelectorAll('.table-erp');
    
    tables.forEach(table => {
        const headers = table.querySelectorAll('th.sortable');
        headers.forEach((header, index) => {
            header.addEventListener('click', () => {
                const isAscending = header.classList.contains('sort-asc');
                
                headers.forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                
                if (isAscending) {
                    header.classList.add('sort-desc');
                    sortTable(table, index, false);
                } else {
                    header.classList.add('sort-asc');
                    sortTable(table, index, true);
                }
            });
        });
    });
}

function sortTable(table, colIndex, ascending) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    const sortedRows = rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[colIndex].textContent.trim();
        const cellB = rowB.cells[colIndex].textContent.trim();
        
        const numA = parseFloat(cellA.replace(/[^0-9.-]+/g, ""));
        const numB = parseFloat(cellB.replace(/[^0-9.-]+/g, ""));
        
        if (!isNaN(numA) && !isNaN(numB)) {
            return ascending ? numA - numB : numB - numA;
        }
        
        return ascending 
            ? cellA.localeCompare(cellB, undefined, { numeric: true, sensitivity: 'base' })
            : cellB.localeCompare(cellA, undefined, { numeric: true, sensitivity: 'base' });
    });
    
    tbody.append(...sortedRows);
}

/**
 * 5. Dynamic Live Filters and Empty States
 */
function initTableFiltering() {
    const searchInputs = document.querySelectorAll('[data-table-search]');
    
    searchInputs.forEach(input => {
        const targetTableId = input.getAttribute('data-table-search');
        const table = document.getElementById(targetTableId);
        
        if (table) {
            input.addEventListener('keyup', () => {
                const filterText = input.value.toLowerCase();
                const rows = table.querySelectorAll('tbody tr');
                const emptyRowId = `empty-${table.id}`;
                let emptyRow = table.querySelector(`#${emptyRowId}`);
                
                let visibleCount = 0;
                rows.forEach(row => {
                    if (row.id === emptyRowId) return;
                    const rowText = row.textContent.toLowerCase();
                    if (rowText.includes(filterText)) {
                        row.style.setProperty('display', '', 'important');
                        visibleCount++;
                    } else {
                        row.style.setProperty('display', 'none', 'important');
                    }
                });

                // Display table Empty State if match count is 0
                if (visibleCount === 0) {
                    if (!emptyRow) {
                        const colSpan = table.querySelectorAll('thead th').length;
                        emptyRow = document.createElement('tr');
                        emptyRow.id = emptyRowId;
                        emptyRow.innerHTML = `
                            <td colspan="${colSpan}" class="text-center py-5 text-secondary">
                                <i class="bi bi-search fs-2 d-block mb-2 text-muted"></i>
                                <span class="fw-semibold">No records found matching your query</span>
                                <p class="text-xs text-muted mb-0 mt-1">Try checking for typos or resetting filter configurations.</p>
                            </td>
                        `;
                        table.querySelector('tbody').appendChild(emptyRow);
                    } else {
                        emptyRow.style.setProperty('display', '', 'important');
                    }
                } else if (emptyRow) {
                    emptyRow.style.setProperty('display', 'none', 'important');
                }
            });
        }
    });

    const categoryFilters = document.querySelectorAll('[data-table-filter-category]');
    categoryFilters.forEach(filter => {
        const targetTableId = filter.getAttribute('data-table-filter-category');
        const table = document.getElementById(targetTableId);

        if (table) {
            filter.addEventListener('change', () => {
                const category = filter.value;
                const rows = table.querySelectorAll('tbody tr');
                const emptyRowId = `empty-${table.id}`;
                let emptyRow = table.querySelector(`#${emptyRowId}`);
                
                let visibleCount = 0;
                rows.forEach(row => {
                    if (row.id === emptyRowId) return;
                    const cell = row.querySelector('[data-cell-category]');
                    if (!cell) return;
                    
                    const cellVal = cell.getAttribute('data-cell-category');
                    if (category === '' || cellVal === category) {
                        row.style.setProperty('display', '', 'important');
                        visibleCount++;
                    } else {
                        row.style.setProperty('display', 'none', 'important');
                    }
                });

                if (visibleCount === 0) {
                    if (!emptyRow) {
                        const colSpan = table.querySelectorAll('thead th').length;
                        emptyRow = document.createElement('tr');
                        emptyRow.id = emptyRowId;
                        emptyRow.innerHTML = `
                            <td colspan="${colSpan}" class="text-center py-5 text-secondary">
                                <i class="bi bi-tag fs-2 d-block mb-2 text-muted"></i>
                                <span class="fw-semibold">No category listings registered</span>
                                <p class="text-xs text-muted mb-0 mt-1">No items match the selected filters.</p>
                            </td>
                        `;
                        table.querySelector('tbody').appendChild(emptyRow);
                    } else {
                        emptyRow.style.setProperty('display', '', 'important');
                    }
                } else if (emptyRow) {
                    emptyRow.style.setProperty('display', 'none', 'important');
                }
            });
        }
    });
}

/**
 * 6. Action Drawers
 */
function initDrawers() {
    const triggerButtons = document.querySelectorAll('[data-drawer-trigger]');
    
    triggerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const drawerId = btn.getAttribute('data-drawer-trigger');
            openDrawer(drawerId);
        });
    });

    const closeButtons = document.querySelectorAll('[data-drawer-close]');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const drawerId = btn.getAttribute('data-drawer-close');
            closeDrawer(drawerId);
        });
    });
    
    const overlay = document.getElementById('drawer-overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            const openDrawerEl = document.querySelector('.drawer-erp.open');
            if (openDrawerEl) {
                closeDrawer(openDrawerEl.id);
            }
        });
    }
}

function openDrawer(drawerId) {
    const drawer = document.getElementById(drawerId);
    const overlay = document.getElementById('drawer-overlay');
    if (drawer && overlay) {
        drawer.classList.add('open');
        overlay.classList.add('active');
    }
}

function closeDrawer(drawerId) {
    const drawer = document.getElementById(drawerId);
    const overlay = document.getElementById('drawer-overlay');
    if (drawer && overlay) {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
    }
}

/**
 * 7. Dynamic Alert Toasts
 */
function initToasts() {
    let container = document.querySelector('.toast-container-custom');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container-custom';
        document.body.appendChild(container);
    }
}

function showToast(message, type = 'info') {
    const container = document.querySelector('.toast-container-custom');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-erp`;

    let iconClass = 'bi-info-circle-fill text-info';
    if (type === 'success') iconClass = 'bi-check-circle-fill text-success';
    if (type === 'warning') iconClass = 'bi-exclamation-triangle-fill text-warning';
    if (type === 'danger') iconClass = 'bi-x-circle-fill text-danger';

    toast.innerHTML = `
        <i class="bi ${iconClass} fs-5"></i>
        <div style="flex:1; font-size:0.85rem; font-weight:500;">${message}</div>
        <button class="btn-close" style="font-size:0.7rem;" onclick="this.parentElement.remove()"></button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s forwards';
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }, 4000);
}

/**
 * 8. Loading Skeletons
 */
function initSkeletons() {
    const skeletonWrappers = document.querySelectorAll('.skeleton-loader-wrapper');
    
    skeletonWrappers.forEach(wrapper => {
        const placeholder = wrapper.querySelector('.skeleton-placeholder');
        const content = wrapper.querySelector('.skeleton-content');
        
        if (placeholder && content) {
            content.style.setProperty('display', 'none', 'important');
            placeholder.style.setProperty('display', 'block', 'important');
            
            setTimeout(() => {
                placeholder.style.setProperty('display', 'none', 'important');
                content.style.setProperty('display', 'block', 'important');
                content.style.style = 'opacity: 0;';
                setTimeout(() => {
                    content.style.transition = 'opacity 0.4s ease';
                    content.style.opacity = '1';
                }, 20);
            }, 650);
        }
    });
}

// Attach utilities globally
window.showToast = showToast;
