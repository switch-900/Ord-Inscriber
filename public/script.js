class OrdinalsInscriber {
    constructor() {
        this.selectedFile = null;
        this.selectedFiles = [];
        this.ws = null;
        this.isConnected = false;
        this.currentTab = 'inscribe';
        this.inscriptions = [];
        this.uploadMode = 'single'; // 'single' or 'batch'
        
        this.initializeWebSocket();
        this.initializeEventListeners();
        this.initializeTabs();
        this.loadWalletInfo();
        this.loadInscriptions();
        this.startHeartbeat();
    }initializeWebSocket() {
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
    }    initializeEventListeners() {
        // Tab navigation
        this.initializeTabs();
        
        // Upload mode selector
        document.querySelectorAll('.upload-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.upload-mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.uploadMode = e.target.dataset.mode;
                this.resetFileSelection();
            });
        });

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
        
        // Send functionality
        document.getElementById('sendInscriptionBtn').addEventListener('click', this.sendInscription.bind(this));
        document.getElementById('sendSatsBtn').addEventListener('click', this.sendSats.bind(this));
        
        // Wallet operations
        document.getElementById('createAddressBtn').addEventListener('click', this.createAddress.bind(this));
        document.getElementById('viewOutputsBtn').addEventListener('click', this.viewOutputs.bind(this));
        document.getElementById('viewTransactionsBtn').addEventListener('click', this.viewTransactions.bind(this));
        document.getElementById('mintRuneBtn').addEventListener('click', this.mintRune.bind(this));
        document.getElementById('backupWalletBtn').addEventListener('click', this.backupWallet.bind(this));
        document.getElementById('restoreWalletBtn').addEventListener('click', this.restoreWallet.bind(this));
        document.getElementById('signMessageBtn').addEventListener('click', this.signMessage.bind(this));
        
        // Modal close buttons
        document.getElementById('closeResult').addEventListener('click', () => {
            document.getElementById('resultModal').style.display = 'none';
        });
        
        document.getElementById('closeInscriptionDetail').addEventListener('click', () => {
            document.getElementById('inscriptionDetailModal').style.display = 'none';
        });
        
        // Close modals on outside click
        document.getElementById('resultModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('resultModal')) {
                document.getElementById('resultModal').style.display = 'none';
            }
        });
        
        document.getElementById('inscriptionDetailModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('inscriptionDetailModal')) {
                document.getElementById('inscriptionDetailModal').style.display = 'none';
            }
        });
    }

    initializeTabs() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Show/hide tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        this.currentTab = tabName;
        
        // Load data for specific tabs
        if (tabName === 'manage') {
            this.loadInscriptions();
        }
    }

    resetFileSelection() {
        this.selectedFile = null;
        this.selectedFiles = [];
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('inscribeBtn').disabled = true;
        document.getElementById('fileInput').value = '';
        
        if (this.uploadMode === 'batch') {
            document.getElementById('fileInput').setAttribute('multiple', 'true');
        } else {
            document.getElementById('fileInput').removeAttribute('multiple');
        }
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
    }    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            if (this.uploadMode === 'batch') {
                this.selectFiles([...files]);
            } else {
                this.selectFile(files[0]);
            }
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            if (this.uploadMode === 'batch') {
                this.selectFiles([...files]);
            } else {
                this.selectFile(files[0]);
            }
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

    selectFiles(files) {
        // Validate file sizes
        const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            this.showError(`${invalidFiles.length} file(s) exceed 10MB limit`);
            return;
        }

        this.selectedFiles = files;
        
        // Update UI for batch mode
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        document.getElementById('fileName').textContent = `${files.length} files selected`;
        document.getElementById('fileSize').textContent = this.formatFileSize(totalSize);
        document.getElementById('fileInfo').style.display = 'flex';
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('inscribeBtn').disabled = false;
        
        this.updateBatchCostEstimate();
    }    removeFile() {
        this.selectedFile = null;
        this.selectedFiles = [];
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
    }    async updateCostEstimate() {
        if (!this.selectedFile && this.selectedFiles.length === 0) return;
        
        const feeRate = parseInt(document.getElementById('feeRate').value);
        
        if (this.uploadMode === 'batch') {
            this.updateBatchCostEstimate();
        } else {
            const fileSize = this.selectedFile.size;
            
            // Rough estimation (actual cost depends on transaction structure)
            const estimatedBytes = fileSize + 200; // File + transaction overhead
            const estimatedSats = estimatedBytes * feeRate;
            const estimatedBTC = (estimatedSats / 100000000).toFixed(8);
            
            document.getElementById('estimatedCost').textContent = `~${estimatedBTC} BTC`;
        }
    }

    updateBatchCostEstimate() {
        const feeRate = parseInt(document.getElementById('feeRate').value);
        const totalSize = this.selectedFiles.reduce((sum, file) => sum + file.size, 0);
        
        // Batch estimation includes overhead for multiple transactions
        const estimatedBytes = totalSize + (this.selectedFiles.length * 300); // File + transaction overhead per file
        const estimatedSats = estimatedBytes * feeRate;
        const estimatedBTC = (estimatedSats / 100000000).toFixed(8);
        
        document.getElementById('estimatedCost').textContent = `~${estimatedBTC} BTC (${this.selectedFiles.length} files)`;
    }    async inscribeFile() {
        if (!this.selectedFile && this.selectedFiles.length === 0) {
            this.showError('Please select file(s) to inscribe');
            return;
        }

        if (this.uploadMode === 'batch' && this.selectedFiles.length > 0) {
            await this.batchInscribe();
        } else {
            await this.singleInscribe();
        }
    }

    async singleInscribe() {
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
                this.loadInscriptions(); // Refresh inscriptions
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.hideLoadingModal();
            this.showError(`Inscription failed: ${error.message}`);
            this.addToActivity(this.selectedFile.name, 'failed', error.message);
        }
    }

    async batchInscribe() {
        const formData = new FormData();
        
        this.selectedFiles.forEach((file, index) => {
            formData.append('files', file);
        });
        
        formData.append('feeRate', document.getElementById('feeRate').value);
        formData.append('destination', document.getElementById('destination').value);
        formData.append('metaprotocol', document.getElementById('metaprotocol').value);
        formData.append('postage', document.getElementById('postage').value);
        formData.append('compress', document.getElementById('compress').checked);

        this.showLoadingModal(`Preparing batch inscription of ${this.selectedFiles.length} files...`);

        try {
            const response = await fetch('/api/wallet/batch', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showResultModal(result);
                this.selectedFiles.forEach(file => {
                    this.addToActivity(file.name, 'completed', 'Batch inscription');
                });
                this.removeFile();
                this.loadWalletInfo();
                this.loadInscriptions();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.hideLoadingModal();
            this.showError(`Batch inscription failed: ${error.message}`);
            this.selectedFiles.forEach(file => {
                this.addToActivity(file.name, 'failed', error.message);
            });
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
    }    async loadWalletInfo() {
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

    async loadInscriptions() {
        try {
            const response = await fetch('/api/wallet/inscriptions');
            const data = await response.json();
            
            if (data.success) {
                this.inscriptions = data.inscriptions;
                this.renderInscriptionGrid();
                this.populateSendInscriptionSelect();
            } else {
                console.error('Failed to load inscriptions:', data.error);
            }
        } catch (error) {
            console.error('Error loading inscriptions:', error);
        }
    }

    renderInscriptionGrid() {
        const grid = document.getElementById('inscriptionGrid');
        
        if (this.inscriptions.length === 0) {
            grid.innerHTML = '<div class="no-inscriptions">No inscriptions found</div>';
            return;
        }

        grid.innerHTML = this.inscriptions.map(inscription => `
            <div class="inscription-card" onclick="app.showInscriptionDetails('${inscription.id}')">
                <div class="inscription-preview">
                    ${this.getInscriptionPreview(inscription)}
                </div>
                <div class="inscription-info">
                    <div class="inscription-id">${inscription.id.substring(0, 8)}...</div>
                    <div class="inscription-size">${this.formatFileSize(inscription.content_length || 0)}</div>
                    <div class="inscription-type">${inscription.content_type || 'Unknown'}</div>
                </div>
            </div>
        `).join('');
    }

    getInscriptionPreview(inscription) {
        const contentType = inscription.content_type || '';
        
        if (contentType.startsWith('image/')) {
            return `<img src="/content/${inscription.id}" alt="Inscription ${inscription.id}" loading="lazy">`;
        } else if (contentType.startsWith('text/')) {
            return `<div class="text-preview">📄</div>`;
        } else if (contentType.startsWith('audio/')) {
            return `<div class="audio-preview">🎵</div>`;
        } else if (contentType.startsWith('video/')) {
            return `<div class="video-preview">🎬</div>`;
        } else {
            return `<div class="file-preview">📎</div>`;
        }
    }

    async showInscriptionDetails(inscriptionId) {
        try {
            const response = await fetch(`/api/inscription/${inscriptionId}`);
            const data = await response.json();
            
            if (data.success) {
                const inscription = data.inscription;
                const content = document.getElementById('inscriptionDetailContent');
                
                content.innerHTML = `
                    <div class="inscription-detail">
                        <div class="inscription-preview-large">
                            ${this.getInscriptionPreview(inscription)}
                        </div>
                        <div class="inscription-metadata">
                            <h3>Inscription Details</h3>
                            <div class="metadata-item">
                                <strong>ID:</strong> ${inscription.id}
                            </div>
                            <div class="metadata-item">
                                <strong>Content Type:</strong> ${inscription.content_type || 'Unknown'}
                            </div>
                            <div class="metadata-item">
                                <strong>Content Length:</strong> ${this.formatFileSize(inscription.content_length || 0)}
                            </div>
                            <div class="metadata-item">
                                <strong>Genesis Height:</strong> ${inscription.genesis_height || 'Unknown'}
                            </div>
                            <div class="metadata-item">
                                <strong>Genesis Fee:</strong> ${inscription.genesis_fee || 'Unknown'} sats
                            </div>
                            <div class="metadata-item">
                                <strong>Output Value:</strong> ${inscription.output_value || 'Unknown'} sats
                            </div>
                            <div class="metadata-item">
                                <strong>Address:</strong> ${inscription.address || 'Unknown'}
                            </div>
                            <div class="inscription-actions">
                                <button onclick="app.copyInscriptionId('${inscription.id}')" class="btn-secondary">
                                    Copy ID
                                </button>
                                <button onclick="window.open('/content/${inscription.id}', '_blank')" class="btn-primary">
                                    View Content
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                document.getElementById('inscriptionDetailModal').style.display = 'flex';
            } else {
                this.showError('Failed to load inscription details');
            }
        } catch (error) {
            this.showError('Error loading inscription details: ' + error.message);
        }
    }

    populateSendInscriptionSelect() {
        const select = document.getElementById('sendInscriptionSelect');
        select.innerHTML = '<option value="">Select an inscription</option>';
        
        this.inscriptions.forEach(inscription => {
            const option = document.createElement('option');
            option.value = inscription.id;
            option.textContent = `${inscription.id.substring(0, 16)}... (${inscription.content_type || 'Unknown'})`;
            select.appendChild(option);
        });
    }

    async sendInscription() {
        const inscriptionId = document.getElementById('sendInscriptionSelect').value;
        const address = document.getElementById('sendInscriptionAddress').value;
        const feeRate = document.getElementById('sendInscriptionFeeRate').value;

        if (!inscriptionId || !address) {
            this.showError('Please select an inscription and enter destination address');
            return;
        }

        this.showLoadingModal('Sending inscription...');

        try {
            const response = await fetch('/api/wallet/send/inscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inscriptionId,
                    address,
                    feeRate: parseInt(feeRate)
                })
            });

            const result = await response.json();

            if (result.success) {
                this.hideLoadingModal();
                this.showSuccess('Inscription sent successfully!');
                document.getElementById('sendInscriptionSelect').value = '';
                document.getElementById('sendInscriptionAddress').value = '';
                this.loadWalletInfo();
                this.loadInscriptions();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.hideLoadingModal();
            this.showError('Failed to send inscription: ' + error.message);
        }
    }

    async sendSats() {
        const address = document.getElementById('sendSatsAddress').value;
        const amount = document.getElementById('sendSatsAmount').value;
        const feeRate = document.getElementById('sendSatsFeeRate').value;

        if (!address || !amount) {
            this.showError('Please enter destination address and amount');
            return;
        }

        this.showLoadingModal('Sending sats...');

        try {
            const response = await fetch('/api/wallet/send/sats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address,
                    amount: parseInt(amount),
                    feeRate: parseInt(feeRate)
                })
            });

            const result = await response.json();

            if (result.success) {
                this.hideLoadingModal();
                this.showSuccess('Sats sent successfully!');
                document.getElementById('sendSatsAddress').value = '';
                document.getElementById('sendSatsAmount').value = '';
                this.loadWalletInfo();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.hideLoadingModal();
            this.showError('Failed to send sats: ' + error.message);
        }
    }    async copyAddress() {
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

    async copyInscriptionId(inscriptionId) {
        try {
            await navigator.clipboard.writeText(inscriptionId);
            this.showSuccess('Inscription ID copied to clipboard!');
        } catch (error) {
            const textArea = document.createElement('textarea');
            textArea.value = inscriptionId;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('Inscription ID copied to clipboard!');
        }
    }

    // Wallet Operations
    async createAddress() {
        try {
            const response = await fetch('/api/wallet/create', {
                method: 'POST'
            });
            const result = await response.json();

            if (result.success) {
                this.showSuccess(`New address created: ${result.address}`);
                this.loadWalletInfo();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showError('Failed to create address: ' + error.message);
        }
    }

    async viewOutputs() {
        try {
            const response = await fetch('/api/wallet/outputs');
            const result = await response.json();

            if (result.success) {
                const outputs = result.outputs;
                let outputsHtml = '<h3>Wallet Outputs</h3>';
                
                if (outputs.length === 0) {
                    outputsHtml += '<p>No outputs found</p>';
                } else {
                    outputsHtml += '<div class="outputs-list">';
                    outputs.forEach(output => {
                        outputsHtml += `
                            <div class="output-item">
                                <div><strong>Output:</strong> ${output.outpoint}</div>
                                <div><strong>Value:</strong> ${output.amount} sats</div>
                                <div><strong>Address:</strong> ${output.address}</div>
                            </div>
                        `;
                    });
                    outputsHtml += '</div>';
                }

                this.showInfoModal('Wallet Outputs', outputsHtml);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showError('Failed to load outputs: ' + error.message);
        }
    }

    async viewTransactions() {
        try {
            const response = await fetch('/api/wallet/transactions');
            const result = await response.json();

            if (result.success) {
                const transactions = result.transactions;
                let txHtml = '<h3>Recent Transactions</h3>';
                
                if (transactions.length === 0) {
                    txHtml += '<p>No transactions found</p>';
                } else {
                    txHtml += '<div class="transactions-list">';
                    transactions.slice(0, 10).forEach(tx => {
                        txHtml += `
                            <div class="transaction-item">
                                <div><strong>TXID:</strong> ${tx.txid}</div>
                                <div><strong>Confirmations:</strong> ${tx.confirmations}</div>
                                <div><strong>Amount:</strong> ${tx.amount} BTC</div>
                            </div>
                        `;
                    });
                    txHtml += '</div>';
                }

                this.showInfoModal('Recent Transactions', txHtml);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showError('Failed to load transactions: ' + error.message);
        }
    }

    async mintRune() {
        const rune = prompt('Enter rune name to mint:');
        if (!rune) return;

        try {
            const response = await fetch('/api/wallet/mint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rune })
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Rune minted successfully!');
                this.loadWalletInfo();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showError('Failed to mint rune: ' + error.message);
        }
    }

    async backupWallet() {
        try {
            const response = await fetch('/api/wallet/dump');
            const result = await response.json();

            if (result.success) {
                // Create downloadable backup file
                const backup = JSON.stringify(result.mnemonic, null, 2);
                const blob = new Blob([backup], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `wallet-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                this.showSuccess('Wallet backup downloaded successfully!');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showError('Failed to backup wallet: ' + error.message);
        }
    }

    async restoreWallet() {
        const mnemonic = prompt('Enter wallet mnemonic to restore:');
        if (!mnemonic) return;

        const confirmed = confirm('This will replace your current wallet. Are you sure?');
        if (!confirmed) return;

        try {
            const response = await fetch('/api/wallet/restore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mnemonic })
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Wallet restored successfully!');
                this.loadWalletInfo();
                this.loadInscriptions();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showError('Failed to restore wallet: ' + error.message);
        }
    }

    async signMessage() {
        const message = prompt('Enter message to sign:');
        if (!message) return;

        try {
            const response = await fetch('/api/wallet/sign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            const result = await response.json();

            if (result.success) {
                this.showInfoModal('Message Signature', `
                    <h3>Message Signed</h3>
                    <div class="signature-result">
                        <div><strong>Message:</strong> ${message}</div>
                        <div><strong>Signature:</strong> <span class="monospace">${result.signature}</span></div>
                        <button onclick="navigator.clipboard.writeText('${result.signature}')" class="btn-secondary">
                            Copy Signature
                        </button>
                    </div>
                `);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showError('Failed to sign message: ' + error.message);
        }
    }

    showInfoModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'inscription_started':
                this.showLoadingModal(`Creating inscription for ${data.file}...`);
                this.updateProgress(25);
                break;
                
            case 'inscription_progress':
                this.updateProgress(data.progress || 50);
                if (data.message) {
                    document.getElementById('loadingMessage').textContent = data.message;
                }
                break;
                
            case 'inscription_completed':
                this.updateProgress(100);
                setTimeout(() => {
                    this.showResultModal({ result: data.result });
                    this.addToActivity(data.file, 'completed', data.result);
                    this.loadWalletInfo();
                    this.loadInscriptions();
                }, 1000);
                break;
                
            case 'batch_started':
                this.showLoadingModal(`Starting batch inscription of ${data.fileCount} files...`);
                this.updateProgress(10);
                break;
                
            case 'batch_progress':
                this.updateProgress(data.progress || 50);
                document.getElementById('loadingMessage').textContent = 
                    `Processing file ${data.currentFile} of ${data.totalFiles}...`;
                break;
                
            case 'batch_completed':
                this.updateProgress(100);
                setTimeout(() => {
                    this.showResultModal({ result: data.result });
                    this.loadWalletInfo();
                    this.loadInscriptions();
                }, 1000);
                break;
                
            case 'send_started':
                this.showLoadingModal('Preparing transaction...');
                this.updateProgress(30);
                break;
                
            case 'send_completed':
                this.updateProgress(100);
                setTimeout(() => {
                    this.hideLoadingModal();
                    this.showSuccess('Transaction sent successfully!');
                    this.loadWalletInfo();
                    this.loadInscriptions();
                }, 1000);
                break;
                
            case 'operation_error':
                this.hideLoadingModal();
                this.showError(`Operation failed: ${data.error}`);
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
                }                .notification.success {
                    background: #20b2aa;
                }
                .notification.error {
                    background: #f44336;
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
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new OrdinalsInscriber();
});
