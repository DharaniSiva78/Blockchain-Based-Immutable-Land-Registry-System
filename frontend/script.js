// Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Application State
const state = {
    currentUser: null,
    lands: [],
    transfers: [],
    isLoggedIn: false,
    currentVerificationLand: null
};

// DOM Elements
const authPage = document.getElementById('auth-page');
const mainNav = document.getElementById('main-nav');
const userInfo = document.getElementById('user-info');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authTabs = document.querySelectorAll('.auth-tab');
const adminNav = document.getElementById('admin-nav');

// API Service
const api = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (state.currentUser && state.currentUser.token) {
            config.headers.Authorization = `Bearer ${state.currentUser.token}`;
        }

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData
        });
    },

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: credentials
        });
    },

    async registerLand(landData) {
        return this.request('/lands/register', {
            method: 'POST',
            body: landData
        });
    },

    async getMyLands() {
        return this.request('/lands/my-lands');
    },

    async getTransfers() {
        return this.request('/transfers');
    },

    async initiateTransfer(transferData) {
        return this.request('/transfers/initiate', {
            method: 'POST',
            body: transferData
        });
    },

    async verifyLand(landId) {
        return this.request(`/lands/verify/${landId}`, {
            method: 'POST'
        });
    },

    async getUsers() {
        return this.request('/admin/users');
    },

    async getAllLands() {
        return this.request('/admin/lands');
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    setupEventListeners();
});

function initApp() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        state.isLoggedIn = true;
        showAppPages();
    } else {
        showAuthPage();
    }
}

function setupEventListeners() {
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (!state.isLoggedIn) return;
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            this.classList.add('active');
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchAuthTab(tabId);
        });
    });
    
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    document.getElementById('landRegistrationForm').addEventListener('submit', handleLandRegistration);
    document.getElementById('verificationForm').addEventListener('submit', handleVerification);
    document.getElementById('transferForm').addEventListener('submit', handleTransfer);
    
    document.addEventListener('click', function(e) {
        if (e.target.id === 'logout-btn') {
            handleLogout();
        }
    });
}

function switchAuthTab(tabId) {
    authTabs.forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
    });
    
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id === `${tabId}-form`);
    });
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    try {
        const result = await api.login({ email, password });
        state.currentUser = { ...result.user, token: result.token };
        state.isLoggedIn = true;
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        showAppPages();
        alert('Login successful!');
    } catch (error) {
        alert(error.message);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    submitBtn.disabled = true;
    
    try {
        const result = await api.register({ name, email, password, confirmPassword });
        state.currentUser = { ...result.user, token: result.token };
        state.isLoggedIn = true;
        localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        showAppPages();
        alert('Registration successful!');
    } catch (error) {
        alert(error.message);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleLandRegistration(e) {
    e.preventDefault();
    const title = document.getElementById('land-title').value;
    const area = document.getElementById('land-area').value;
    const address = document.getElementById('land-address').value;
    const city = document.getElementById('land-city').value;
    const stateVal = document.getElementById('land-state').value;
    const country = document.getElementById('land-country').value;
    const pincode = document.getElementById('land-pincode').value;
    const coordinates = document.getElementById('land-coordinates').value;
    const description = document.getElementById('land-description').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering Land...';
    submitBtn.disabled = true;
    
    try {
        await api.registerLand({
            title, area, address, city, state: stateVal, country, pincode, coordinates, description
        });
        e.target.reset();
        alert('Land registered successfully!');
        showPage('my-lands');
        document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
        document.querySelector('nav a[data-page="my-lands"]').classList.add('active');
        await updateLandsTable();
    } catch (error) {
        alert(error.message);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleVerification(e) {
    e.preventDefault();
    const landId = document.getElementById('verify-land-id').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting Verification...';
    submitBtn.disabled = true;
    
    try {
        const result = await api.verifyLand(landId);
        state.currentVerificationLand = result.land;
        document.getElementById('doc-verify-btn').disabled = false;
        alert('Verification process started! Please complete each step in order.');
    } catch (error) {
        alert(error.message);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleTransfer(e) {
    e.preventDefault();
    const landId = document.getElementById('transfer-land-id').value;
    const recipientEmail = document.getElementById('transfer-recipient').value;
    const amount = document.getElementById('transfer-amount').value;
    const notes = document.getElementById('transfer-notes').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Initiating Transfer...';
    submitBtn.disabled = true;
    
    try {
        await api.initiateTransfer({
            landId,
            recipientEmail,
            amount: parseFloat(amount),
            notes
        });
        e.target.reset();
        alert('Transfer initiated successfully!');
        await updateTransferHistory();
        await updateLandsTable();
        await updateDashboard();
    } catch (error) {
        alert(error.message);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function handleLogout() {
    state.currentUser = null;
    state.isLoggedIn = false;
    state.lands = [];
    state.transfers = [];
    localStorage.removeItem('currentUser');
    showAuthPage();
    alert('Logged out successfully');
}

function showAuthPage() {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    authPage.classList.add('active');
    mainNav.style.display = 'none';
    userInfo.style.display = 'none';
    loginForm.reset();
    registerForm.reset();
}

async function showAppPages() {
    authPage.classList.remove('active');
    mainNav.style.display = 'block';
    userInfo.style.display = 'flex';
    
    userInfo.innerHTML = `
        <div class="user-avatar">${state.currentUser.name.charAt(0).toUpperCase()}</div>
        <span>${state.currentUser.name}</span>
        <button id="logout-btn" class="btn btn-danger" style="margin-left: 10px;">
            <i class="fas fa-sign-out-alt"></i> Logout
        </button>
    `;
    
    // Show admin nav if user is admin
    if (state.currentUser.role === 'admin') {
        adminNav.style.display = 'block';
    }
    
    await updateDashboard();
    await updateLandsTable();
    await updateVerificationSelects();
    await updateTransferSelect();
    await updateTransferHistory();
    updateProfileDetails();
    showPage('dashboard');
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    if (pageId === 'dashboard') updateDashboard();
    else if (pageId === 'my-lands') updateLandsTable();
    else if (pageId === 'verification') resetVerificationSteps();
    else if (pageId === 'transfer-history') updateTransferHistory();
    else if (pageId === 'profile') updateProfileDetails();
    else if (pageId === 'admin') updateAdminTables();
}

async function updateDashboard() {
    try {
        const result = await api.getMyLands();
        state.lands = result.lands || [];
        
        const userLands = state.lands;
        const pendingLands = userLands.filter(land => land.status === 'pending');
        const verifiedLands = userLands.filter(land => land.status === 'verified');
        const nftLands = userLands.filter(land => land.nftId !== null);
        
        document.getElementById('lands-count').textContent = userLands.length;
        document.getElementById('pending-count').textContent = pendingLands.length;
        document.getElementById('verified-count').textContent = verifiedLands.length;
        document.getElementById('nft-count').textContent = nftLands.length;
        
        const recentActivity = document.getElementById('recent-activity');
        recentActivity.innerHTML = '';
        
        const recentLands = userLands
            .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
            .slice(0, 5);
        
        if (recentLands.length === 0) {
            recentActivity.innerHTML = '<tr><td colspan="5" style="text-align: center;">No land records found</td></tr>';
        } else {
            recentLands.forEach(land => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${land.id.substring(0, 8)}...</td>
                    <td>${land.city}, ${land.country}</td>
                    <td>${land.area} sq.m</td>
                    <td><span class="status-badge status-${land.status}">${land.status}</span></td>
                    <td>${new Date(land.registeredAt).toLocaleDateString()}</td>
                `;
                recentActivity.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

async function updateLandsTable() {
    try {
        const result = await api.getMyLands();
        state.lands = result.lands || [];
        
        const tableBody = document.getElementById('lands-table-body');
        tableBody.innerHTML = '';
        
        if (state.lands.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No land records found</td></tr>';
        } else {
            state.lands.forEach(land => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${land.id.substring(0, 8)}...</td>
                    <td>${land.title}</td>
                    <td>${land.city}, ${land.country}</td>
                    <td>${land.area} sq.m</td>
                    <td><span class="status-badge status-${land.status}">${land.status}</span></td>
                    <td>${land.nftId ? land.nftId.substring(0, 8) + '...' : 'Not minted'}</td>
                    <td class="action-buttons">
                        <button class="btn action-btn" onclick="viewLandDetails('${land.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error updating lands table:', error);
    }
}

async function updateTransferHistory() {
    try {
        const result = await api.getTransfers();
        state.transfers = result.transfers || [];
        
        const transferHistoryBody = document.getElementById('transfer-history-body');
        transferHistoryBody.innerHTML = '';
        
        if (state.transfers.length === 0) {
            transferHistoryBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No transfer history found</td></tr>';
        } else {
            state.transfers.forEach(transfer => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${transfer.landId.substring(0, 8)}...</td>
                    <td>${transfer.landTitle}</td>
                    <td>${transfer.fromUserName}</td>
                    <td>${transfer.toUserName}</td>
                    <td>${transfer.amount} ${transfer.currency}</td>
                    <td>${new Date(transfer.transferredAt).toLocaleDateString()}</td>
                `;
                transferHistoryBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error updating transfer history:', error);
    }
}

function updateProfileDetails() {
    if (!state.currentUser) return;
    
    const userLands = state.lands;
    const verifiedLands = userLands.filter(land => land.status === 'verified');
    
    document.getElementById('profile-avatar').textContent = state.currentUser.name.charAt(0).toUpperCase();
    document.getElementById('profile-name').textContent = state.currentUser.name;
    document.getElementById('profile-email').textContent = state.currentUser.email;
    
    document.getElementById('profile-user-id').textContent = state.currentUser.id;
    document.getElementById('profile-full-name').textContent = state.currentUser.name;
    document.getElementById('profile-email-address').textContent = state.currentUser.email;
    document.getElementById('profile-created').textContent = new Date().toLocaleDateString();
    document.getElementById('profile-lands-count').textContent = userLands.length;
    document.getElementById('profile-verified-count').textContent = verifiedLands.length;
}

async function updateAdminTables() {
    if (state.currentUser.role !== 'admin') return;
    
    try {
        const [usersResult, landsResult] = await Promise.all([
            api.getUsers(),
            api.getAllLands()
        ]);
        
        // Update users table
        const adminUsersTable = document.getElementById('admin-users-table');
        adminUsersTable.innerHTML = '';
        
        usersResult.users.forEach(user => {
            const userLands = landsResult.lands.filter(land => land.owner === user.id);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id.substring(0, 8)}...</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>${userLands.length}</td>
                <td class="action-buttons">
                    <button class="btn btn-danger action-btn" onclick="deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            adminUsersTable.appendChild(row);
        });
        
        // Update lands table
        const adminLandsTable = document.getElementById('admin-lands-table');
        adminLandsTable.innerHTML = '';
        
        landsResult.lands.forEach(land => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${land.id.substring(0, 8)}...</td>
                <td>${land.title}</td>
                <td>${land.ownerName}</td>
                <td>${land.city}, ${land.country}</td>
                <td><span class="status-badge status-${land.status}">${land.status}</span></td>
                <td>${new Date(land.registeredAt).toLocaleDateString()}</td>
            `;
            adminLandsTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error updating admin tables:', error);
    }
}

async function updateVerificationSelects() {
    const verifySelect = document.getElementById('verify-land-id');
    verifySelect.innerHTML = '<option value="">-- Select Land --</option>';
    
    const userLands = state.lands.filter(land => land.status !== 'verified');
    
    userLands.forEach(land => {
        const option = document.createElement('option');
        option.value = land.id;
        option.textContent = `${land.title} (${land.city})`;
        verifySelect.appendChild(option);
    });
}

async function updateTransferSelect() {
    const transferSelect = document.getElementById('transfer-land-id');
    transferSelect.innerHTML = '<option value="">-- Select Land --</option>';
    
    const userLands = state.lands.filter(land => land.status === 'verified');
    
    userLands.forEach(land => {
        const option = document.createElement('option');
        option.value = land.id;
        option.textContent = `${land.title} (${land.city})`;
        transferSelect.appendChild(option);
    });
}

function resetVerificationSteps() {
    document.getElementById('step-1').classList.remove('completed', 'locked');
    document.getElementById('step-2').classList.remove('completed');
    document.getElementById('step-2').classList.add('locked');
    document.getElementById('step-3').classList.remove('completed');
    document.getElementById('step-3').classList.add('locked');
    document.getElementById('step-4').classList.remove('completed');
    document.getElementById('step-4').classList.add('locked');
    
    document.getElementById('doc-verify-btn').disabled = false;
    document.getElementById('enotary-btn').disabled = true;
    document.getElementById('zkp-btn').disabled = true;
    document.getElementById('nft-btn').disabled = true;
    
    state.currentVerificationLand = null;
}

function completeVerificationStep(stepNumber) {
    document.getElementById(`step-${stepNumber}`).classList.add('completed');
    
    if (stepNumber < 4) {
        document.getElementById(`step-${stepNumber + 1}`).classList.remove('locked');
        document.getElementById(`${getStepButtonId(stepNumber + 1)}`).disabled = false;
    }
    
    if (state.currentVerificationLand) {
        if (stepNumber === 4) {
            state.currentVerificationLand.status = 'verified';
            state.currentVerificationLand.nftId = generateNFTId();
            alert('Verification completed! NFT minted successfully.');
            updateLandsTable();
            updateDashboard();
            updateVerificationSelects();
            updateProfileDetails();
        }
    }
}

function getStepButtonId(stepNumber) {
    switch(stepNumber) {
        case 1: return 'doc-verify-btn';
        case 2: return 'enotary-btn';
        case 3: return 'zkp-btn';
        case 4: return 'nft-btn';
        default: return '';
    }
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function openEditProfileModal() {
    document.getElementById('edit-name').value = state.currentUser.name;
    document.getElementById('edit-email').value = state.currentUser.email;
    openModal('edit-profile-modal');
}

function saveProfileChanges() {
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    
    state.currentUser.name = name;
    state.currentUser.email = email;
    localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
    
    updateProfileDetails();
    
    userInfo.innerHTML = `
        <div class="user-avatar">${state.currentUser.name.charAt(0).toUpperCase()}</div>
        <span>${state.currentUser.name}</span>
        <button id="logout-btn" class="btn btn-danger" style="margin-left: 10px;">
            <i class="fas fa-sign-out-alt"></i> Logout
        </button>
    `;
    
    closeModal('edit-profile-modal');
    alert('Profile updated successfully!');
}

function viewLandDetails(landId) {
    const land = state.lands.find(l => l.id === landId);
    if (!land) return;
    
    const modalContent = document.getElementById('land-details-content');
    modalContent.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
            <h4 style="color: var(--primary); margin-bottom: 0.5rem;">${land.title}</h4>
            <p style="color: var(--gray);">ID: ${land.id}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div>
                <strong>Location:</strong>
                <p>${land.address}, ${land.city}, ${land.state}, ${land.country}</p>
            </div>
            <div>
                <strong>Area:</strong>
                <p>${land.area} sq. meters</p>
            </div>
            <div>
                <strong>Coordinates:</strong>
                <p>${land.coordinates || 'Not specified'}</p>
            </div>
            <div>
                <strong>Postal Code:</strong>
                <p>${land.pincode}</p>
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <strong>Description:</strong>
            <p>${land.description || 'No description provided'}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
                <strong>Status:</strong>
                <p><span class="status-badge status-${land.status}">${land.status}</span></p>
            </div>
            <div>
                <strong>NFT ID:</strong>
                <p>${land.nftId || 'Not minted'}</p>
            </div>
            <div>
                <strong>Registered:</strong>
                <p>${new Date(land.registeredAt).toLocaleDateString()}</p>
            </div>
        </div>
    `;
    
    openModal('land-details-modal');
}

// Verification Functions
function startDocumentVerification() {
    if (!state.currentVerificationLand) {
        alert('Please select a land to verify first');
        return;
    }
    
    document.getElementById('verification-modal-title').textContent = 'Document Verification';
    document.getElementById('verification-modal-content').innerHTML = `
        <p>Upload the following documents for verification of <strong>${state.currentVerificationLand.title}</strong>:</p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
            <li>Proof of Ownership</li>
            <li>Land Survey Document</li>
            <li>Identity Verification</li>
            <li>Tax Receipts</li>
        </ul>
        <div class="form-group">
            <label>Upload Documents</label>
            <input type="file" id="document-upload" multiple>
        </div>
        <div id="upload-status" style="margin-top: 1rem;"></div>
    `;
    
    document.getElementById('verification-submit-btn').style.display = 'block';
    document.getElementById('verification-submit-btn').onclick = function() {
        const fileInput = document.getElementById('document-upload');
        if (fileInput.files.length === 0) {
            document.getElementById('upload-status').innerHTML = '<p style="color: var(--danger);">Please upload at least one document</p>';
            return;
        }
        
        document.getElementById('upload-status').innerHTML = '<p style="color: var(--success);">Documents uploaded successfully! Processing verification...</p>';
        
        setTimeout(() => {
            completeVerificationStep(1);
            closeModal('verification-modal');
            alert('Document verification completed! You can now proceed to E-Notary Authentication.');
        }, 2000);
    };
    
    openModal('verification-modal');
}

function startENotaryVerification() {
    if (!state.currentVerificationLand) {
        alert('Please complete document verification first');
        return;
    }
    
    document.getElementById('verification-modal-title').textContent = 'E-Notary Authentication';
    document.getElementById('verification-modal-content').innerHTML = `
        <p>Connect with a certified digital notary to authenticate your land documents for <strong>${state.currentVerificationLand.title}</strong>.</p>
        <div style="background: #f0f4f8; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
            <h4 style="color: var(--primary); margin-bottom: 1rem;">Notary Session Details</h4>
            <p><strong>Notary:</strong> Digital Notary Services Inc.</p>
            <p><strong>Session ID:</strong> DN-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            <p><strong>Estimated Time:</strong> 15-30 minutes</p>
        </div>
        <div class="form-group">
            <label>Schedule Appointment</label>
            <input type="datetime-local" id="notary-schedule">
        </div>
    `;
    
    document.getElementById('verification-submit-btn').style.display = 'block';
    document.getElementById('verification-submit-btn').onclick = function() {
        const schedule = document.getElementById('notary-schedule').value;
        if (!schedule) {
            alert('Please schedule an appointment');
            return;
        }
        
        document.getElementById('verification-modal-content').innerHTML += '<p style="color: var(--success); margin-top: 1rem;">Appointment scheduled! E-Notary authentication in progress...</p>';
        
        setTimeout(() => {
            completeVerificationStep(2);
            closeModal('verification-modal');
            alert('E-Notary authentication completed! You can now proceed to ZKP Validation.');
        }, 3000);
    };
    
    openModal('verification-modal');
}

function startZKPVerification() {
    if (!state.currentVerificationLand) {
        alert('Please complete E-Notary authentication first');
        return;
    }
    
    document.getElementById('verification-modal-title').textContent = 'Zero-Knowledge Proof Validation';
    document.getElementById('verification-modal-content').innerHTML = `
        <p>Generate a zero-knowledge proof to validate your ownership of <strong>${state.currentVerificationLand.title}</strong> without revealing sensitive information.</p>
        <div style="background: #f0f4f8; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
            <h4 style="color: var(--primary); margin-bottom: 1rem;">ZKP Parameters</h4>
            <p><strong>Proof Type:</strong> zk-SNARK</p>
            <p><strong>Circuit:</strong> Land Ownership Verification</p>
            <p><strong>Privacy Level:</strong> High</p>
            <p><strong>Estimated Generation Time:</strong> 2-5 minutes</p>
        </div>
        <div id="zkp-status"></div>
    `;
    
    document.getElementById('verification-submit-btn').style.display = 'block';
    document.getElementById('verification-submit-btn').onclick = function() {
        document.getElementById('zkp-status').innerHTML = '<p style="color: var(--success);">Generating Zero-Knowledge Proof... This may take a few minutes.</p>';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            document.getElementById('zkp-status').innerHTML = `<p style="color: var(--success);">Generating Zero-Knowledge Proof... ${progress}% complete</p>`;
            
            if (progress >= 100) {
                clearInterval(interval);
                completeVerificationStep(3);
                closeModal('verification-modal');
                alert('ZKP validation completed! You can now proceed to NFT Minting.');
            }
        }, 500);
    };
    
    openModal('verification-modal');
}

function startNFTMinting() {
    if (!state.currentVerificationLand) {
        alert('Please complete ZKP validation first');
        return;
    }
    
    document.getElementById('verification-modal-title').textContent = 'NFT Minting';
    document.getElementById('verification-modal-content').innerHTML = `
        <p>Create a unique NFT representing your land ownership for <strong>${state.currentVerificationLand.title}</strong> on the blockchain.</p>
        <div style="background: #f0f4f8; padding: 1.5rem; border-radius: 10px; margin: 1.5rem 0;">
            <h4 style="color: var(--primary); margin-bottom: 1rem;">NFT Details</h4>
            <p><strong>Blockchain:</strong> Ethereum</p>
            <p><strong>Token Standard:</strong> ERC-721</p>
            <p><strong>Gas Fee:</strong> ~0.002 ETH</p>
            <p><strong>Network:</strong> Mainnet</p>
        </div>
        <div class="form-group">
            <label>NFT Name</label>
            <input type="text" id="nft-name" value="${state.currentVerificationLand.title} Land NFT">
        </div>
        <div class="form-group">
            <label>NFT Description</label>
            <textarea id="nft-description" rows="3">Digital representation of land property at ${state.currentVerificationLand.address}, ${state.currentVerificationLand.city}</textarea>
        </div>
        <div id="nft-status"></div>
    `;
    
    document.getElementById('verification-submit-btn').style.display = 'block';
    document.getElementById('verification-submit-btn').onclick = function() {
        document.getElementById('nft-status').innerHTML = '<p style="color: var(--success);">Minting NFT... This may take a few minutes.</p>';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            document.getElementById('nft-status').innerHTML = `<p style="color: var(--success);">Minting NFT... ${progress}% complete</p>`;
            
            if (progress >= 100) {
                clearInterval(interval);
                completeVerificationStep(4);
                closeModal('verification-modal');
            }
        }, 500);
    };
    
    openModal('verification-modal');
}

// Utility functions
function generateNFTId() {
    return 'nft_' + Math.random().toString(36).substr(2, 9);
}

// Global functions for HTML
window.openModal = openModal;
window.closeModal = closeModal;
window.viewLandDetails = viewLandDetails;
window.showPage = showPage;
window.startDocumentVerification = startDocumentVerification;
window.startENotaryVerification = startENotaryVerification;
window.startZKPVerification = startZKPVerification;
window.startNFTMinting = startNFTMinting;
window.openEditProfileModal = openEditProfileModal;
window.saveProfileChanges = saveProfileChanges;