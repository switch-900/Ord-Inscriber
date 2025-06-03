class OrdinalsInscriber {
    constructor() {
        this.selectedFile = null;
        this.ws = null;
        this.isConnected = false;
        
        this.initializeWebSocket();
        this.initializeEventListeners();
        this.loadWalletInfo();
        this.startHeartbeat();
    }    initializeWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.hostname}:3334`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.isConnected = true;
            this.updateStatus('Connected', 'connected');
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.isConnected = false;
            this.updateStatus('Disconnected', 'disconnected');
            
            // Attempt to reconnect after 3 seconds
            setTimeout(() => this.initializeWebSocket(), 3000);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateStatus('Connection Error', 'error');
        };
    }

    initializeEventListeners() {
        // File upload handlers
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        
        // Remove file button
        document.getElementById('removeFile').addEventListener('click', this.removeFile.bind(this));
        
        // Fee selector buttons
        document.querySelectorAll('.fee-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.fee-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById('feeRate').value = e.target.dataset.fee;
                this.updateCostEstimate();
            });
        });
        
        // Fee rate input
        document.getElementById('feeRate').addEventListener('input', this.updateCostEstimate.bind(this));
        
        // Inscribe button
        document.getElementById('inscribeBtn').addEventListener('click', this.inscribeFile.bind(this));
        
        // Copy address button
        document.getElementById('copyAddress').addEventListener('click', this.copyAddress.bind(this));
        
        // Modal close buttons
        document.getElementById('closeResult').addEventListener('click', () => {
            document.getElementById('resultModal').style.display = 'none';
        });
        
        // Close modal on outside click
        document.getElementById('resultModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('resultModal')) {
                document.getElementById('resultModal').style.display = 'none';
            }
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.selectFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.selectFile(files[0]);
        }
    }

    selectFile(file) {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            this.showError('File size must be less than 10MB');
            return;
        }

        this.selectedFile = file;
        
        // Update UI
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
        document.getElementById('fileInfo').style.display = 'flex';
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('inscribeBtn').disabled = false;
        
        this.updateCostEstimate();
    }

    removeFile() {
        this.selectedFile = null;
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('inscribeBtn').disabled = true;
        document.getElementById('fileInput').value = '';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async updateCostEstimate() {
        if (!this.selectedFile) return;
        
        const feeRate = parseInt(document.getElementById('feeRate').value);
        const fileSize = this.selectedFile.size;
        
        // Rough estimation (actual cost depends on transaction structure)
        const estimatedBytes = fileSize + 200; // File + transaction overhead
        const estimatedSats = estimatedBytes * feeRate;
        const estimatedBTC = (estimatedSats / 100000000).toFixed(8);
        
        document.getElementById('estimatedCost').textContent = `~${estimatedBTC} BTC`;
    }

    async inscribeFile() {
        if (!this.selectedFile) {
            this.showError('Please select a file to inscribe');
            return;
        }

        const formData = new FormData();
        formData.append('file', this.selectedFile);
        formData.append('feeRate', document.getElementById('feeRate').value);
        formData.append('destination', document.getElementById('destination').value);
        formData.append('metaprotocol', document.getElementById('metaprotocol').value);
        formData.append('postage', document.getElementById('postage').value);
        formData.append('compress', document.getElementById('compress').checked);

        this.showLoadingModal('Preparing inscription...');

        try {
            const response = await fetch('/api/inscribe', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showResultModal(result);
                this.addToActivity(this.selectedFile.name, 'completed', result.result);
                this.removeFile();
                this.loadWalletInfo(); // Refresh wallet info
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.hideLoadingModal();
            this.showError(`Inscription failed: ${error.message}`);
            this.addToActivity(this.selectedFile.name, 'failed', error.message);
        }
    }

    showLoadingModal(message) {
        document.getElementById('loadingMessage').textContent = message;
        document.getElementById('loadingModal').style.display = 'flex';
        this.updateProgress(0);
    }

    hideLoadingModal() {
        document.getElementById('loadingModal').style.display = 'none';
    }

    updateProgress(percentage) {
        document.getElementById('progressFill').style.width = `${percentage}%`;
    }

    showResultModal(result) {
        this.hideLoadingModal();
        
        const content = document.getElementById('resultContent');
        content.innerHTML = `
            <div class="result-success">
                <div class="success-icon">✅</div>
                <h4>Inscription Created Successfully!</h4>
                <div class="result-details">
                    <p><strong>Transaction ID:</strong></p>
                    <p class="monospace">${this.extractTxId(result.result)}</p>
                    <p><strong>Status:</strong> Broadcast to network</p>
                    <p><strong>Confirmations:</strong> Pending</p>
                </div>
                <div class="result-actions">
                    <button onclick="window.open('https://mempool.space/tx/${this.extractTxId(result.result)}', '_blank')" class="btn-secondary">
                        View on Mempool
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('resultModal').style.display = 'flex';
    }

    extractTxId(ordResult) {
        // Extract transaction ID from ord command result
        const lines = ordResult.split('\n');
        for (const line of lines) {
            if (line.includes('txid') || line.includes('transaction')) {
                const match = line.match(/[a-f0-9]{64}/);
                if (match) return match[0];
            }
        }
        return 'Unknown';
    }

    addToActivity(fileName, status, details) {
        const activityList = document.getElementById('activityList');
        const placeholder = activityList.querySelector('.activity-placeholder');
        
        if (placeholder) {
            placeholder.remove();
        }

        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-info">
                <div class="activity-file">${fileName}</div>
                <div class="activity-time">${new Date().toLocaleString()}</div>
            </div>
            <div class="activity-status ${status}">
                ${status === 'completed' ? '✅' : status === 'failed' ? '❌' : '⏳'}
                ${status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
        `;

        activityList.insertBefore(activityItem, activityList.firstChild);

        // Limit to 10 recent items
        const items = activityList.querySelectorAll('.activity-item');
        if (items.length > 10) {
            items[items.length - 1].remove();
        }
    }

    async loadWalletInfo() {
        try {
            // Load balance
            const balanceResponse = await fetch('/api/wallet/balance');
            const balanceData = await balanceResponse.json();
            if (balanceData.success) {
                document.getElementById('balance').textContent = balanceData.balance || '0 sats';
            }

            // Load receive address
            const addressResponse = await fetch('/api/wallet/receive');
            const addressData = await addressResponse.json();
            if (addressData.success) {
                document.getElementById('receiveAddress').textContent = addressData.address || 'N/A';
            }

            // Load inscriptions count
            const inscriptionsResponse = await fetch('/api/wallet/inscriptions');
            const inscriptionsData = await inscriptionsResponse.json();
            if (inscriptionsData.success) {
                document.getElementById('totalInscriptions').textContent = 
                    inscriptionsData.inscriptions.length.toString();
            }
        } catch (error) {
            console.error('Failed to load wallet info:', error);
        }
    }

    async copyAddress() {
        const address = document.getElementById('receiveAddress').textContent;
        if (address && address !== 'N/A') {
            try {
                await navigator.clipboard.writeText(address);
                this.showSuccess('Address copied to clipboard!');
            } catch (error) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = address;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showSuccess('Address copied to clipboard!');
            }
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'inscription_started':
                this.showLoadingModal(`Creating inscription for ${data.file}...`);
                this.updateProgress(25);
                break;
                
            case 'inscription_completed':
                this.updateProgress(100);
                setTimeout(() => {
                    this.showResultModal({ result: data.result });
                    this.addToActivity(data.file, 'completed', data.result);
                }, 1000);
                break;
                
            case 'inscription_error':
                this.hideLoadingModal();
                this.showError(`Inscription failed: ${data.error}`);
                break;
                
            case 'heartbeat':
                // Connection is alive
                break;
                
            default:
                console.log('Unknown WebSocket message:', data);
        }
    }

    updateStatus(status, className) {
        const statusElement = document.getElementById('status');
        statusElement.textContent = status;
        statusElement.className = `value ${className}`;
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">✕</button>
        `;

        // Add styles if not already present
        if (!document.querySelector('.notification-styles')) {
            const style = document.createElement('style');
            style.className = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 600;
                    z-index: 1001;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    animation: slideIn 0.3s ease;
                }
                .notification.success {
                    background: #28a745;
                }
                .notification.error {
                    background: #dc3545;
                }
                .notification button {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    startHeartbeat() {
        // Refresh wallet info every 30 seconds
        setInterval(() => {
            if (this.isConnected) {
                this.loadWalletInfo();
            }
        }, 30000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OrdinalsInscriber();
});
