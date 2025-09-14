// 配置常量
const CONFIG = {
    API_KEY: 'sk-r9MRlIeoVS4dWLub7nk4NAnhYB72N81me7hbTwnuEW3xxiIg',
    BASE_URL: 'https://api.moonshot.cn/v1', // 直接调用API，绕过代理
    MODEL: 'kimi-k2-0905-preview', // 使用k2模型
    PROMPT: '请从文档中提取以下信息并生成表格：\n1. 学校名称（必须包含）\n2. 学科\n3. 讲课教师\n4. 班级\n\n要求：\n- 表格必须包含"学校"、"学科"、"讲课教师"、"班级"四列\n- 在第一行的学校名称后面加上当前时间，格式如：学校名称（2025-01-15）\n- 请确保提取的是文档中的真实信息，不要使用示例数据\n- 以Markdown表格格式输出',
    MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
};

// 全局变量
let currentFiles = [];
let uploadedFileIds = [];

// DOM 元素
const elements = {
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    uploadBtn: document.getElementById('uploadBtn'),
    fileInfo: document.getElementById('fileInfo'),
    fileName: document.getElementById('fileName'),
    fileSize: document.getElementById('fileSize'),
    removeFile: document.getElementById('removeFile'),
    processBtn: document.getElementById('processBtn'),
    statusSection: document.getElementById('statusSection'),
    statusIcon: document.getElementById('statusIcon'),
    statusText: document.getElementById('statusText'),
    progressBar: document.getElementById('progressBar'),
    progressFill: document.getElementById('progressFill'),
    resultSection: document.getElementById('resultSection'),
    resultContent: document.getElementById('resultContent'),
    errorSection: document.getElementById('errorSection'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn')
};

// 初始化事件监听器
function initializeEventListeners() {
    // 文件上传相关事件
    elements.uploadBtn.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.removeFile.addEventListener('click', removeFile);
    
    // 拖拽上传事件
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    elements.uploadArea.addEventListener('drop', handleDrop);
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    
    // 处理按钮事件
    elements.processBtn.addEventListener('click', processDocument);
    
    // 重试按钮事件
    elements.retryBtn.addEventListener('click', processDocument);
    
    // 结果操作按钮事件
    elements.copyBtn.addEventListener('click', copyResult);
    elements.downloadBtn.addEventListener('click', downloadResult);
}

// 处理文件选择
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
        validateAndSetFiles(files);
    }
}

// 处理拖拽悬停
function handleDragOver(event) {
    event.preventDefault();
    elements.uploadArea.classList.add('dragover');
}

// 处理拖拽离开
function handleDragLeave(event) {
    event.preventDefault();
    elements.uploadArea.classList.remove('dragover');
}

// 处理文件拖拽放置
function handleDrop(event) {
    event.preventDefault();
    elements.uploadArea.classList.remove('dragover');
    
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
        validateAndSetFiles(files);
    }
}

// 验证并设置文件
function validateAndSetFile(file) {
    // 检查文件类型
    const validTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const validExtensions = ['.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!validTypes.includes(file.type) && !hasValidExtension) {
        showError('请选择有效的Word文档文件（.doc 或 .docx）');
        return;
    }
    
    // 检查文件大小
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showError('文件大小不能超过10MB');
        return;
    }
    
    // 设置当前文件
    currentFiles = [file];
    uploadedFileIds = [];
    
    // 显示文件信息
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatFileSize(file.size);
    elements.fileInfo.style.display = 'flex';
    elements.processBtn.disabled = false;
    
    // 隐藏错误信息
    hideError();
    hideResult();
}

// 验证并设置多个文件
function validateAndSetFiles(files) {
    const validTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const validExtensions = ['.doc', '.docx'];
    const validFiles = [];
    const errorMessages = [];
    
    files.forEach((file) => {
        const fileName = file.name.toLowerCase();
        const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
        
        // 检查文件类型
        if (!validTypes.includes(file.type) && !hasValidExtension) {
            errorMessages.push(`文件 "${file.name}" 不是有效的Word文档格式`);
            return;
        }
        
        // 检查文件大小
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            errorMessages.push(`文件 "${file.name}" 大小超过10MB`);
            return;
        }
        
        validFiles.push(file);
    });
    
    // 如果没有有效文件，显示错误并返回
    if (validFiles.length === 0) {
        const message = errorMessages.length > 0 ? errorMessages.join('\n') : '请选择有效的Word文档文件';
        showError(message);
        return;
    }
    
    // 设置当前文件
    currentFiles = validFiles;
    uploadedFileIds = [];
    
    // 显示文件信息
    if (validFiles.length === 1) {
        // 单文件显示
        elements.fileName.textContent = validFiles[0].name;
        elements.fileSize.textContent = formatFileSize(validFiles[0].size);
    } else {
        // 多文件显示
        const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
        elements.fileName.textContent = `已选择 ${validFiles.length} 个文件`;
        elements.fileSize.textContent = formatFileSize(totalSize);
    }
    
    elements.fileInfo.style.display = 'flex';
    elements.processBtn.disabled = false;
    
    // 显示警告信息（如果有无效文件）
    if (errorMessages.length > 0) {
        showError(`部分文件无效：\n${errorMessages.join('\n')}\n\n已选择 ${validFiles.length} 个有效文件继续处理。`);
    } else {
        hideError();
    }
    
    hideResult();
}

// 移除文件
function removeFile() {
    currentFiles = [];
    uploadedFileIds = [];
    elements.fileInput.value = '';
    elements.fileInfo.style.display = 'none';
    elements.processBtn.disabled = true;
    hideStatus();
    hideResult();
    hideError();
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 处理文档（支持多文件）
async function processDocument() {
    if (!currentFiles || currentFiles.length === 0) {
        showError('请先选择Word文档');
        return;
    }
    
    // 防止重复点击
    elements.processBtn.disabled = true;
    elements.retryBtn.disabled = true;
    
    hideError();
    hideResult();
    
    try {
        const results = [];
        uploadedFileIds = [];
        
        // 处理每个文件
        for (let i = 0; i < currentFiles.length; i++) {
            const file = currentFiles[i];
            const fileNum = i + 1;
            const totalFiles = currentFiles.length;
            
            // 第一步：上传文件
            showStatus('📤', `正在上传文件 ${fileNum}/${totalFiles}: ${file.name}`, true);
            const fileId = await uploadFileToMoonshot(file);
            uploadedFileIds.push(fileId);
            
            // 添加短暂延迟，避免立即请求
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 第二步：获取文件内容并处理文档
            showStatus('📖', `正在处理文件 ${fileNum}/${totalFiles}: ${file.name}`, true);
            const result = await processWithKimi(fileId);
            
            results.push({
                fileName: file.name,
                result: result
            });
        }
        
        // 第三步：显示结果
        showStatus('✅', '所有文件处理完成！', false);
        setTimeout(() => {
            hideStatus();
            showMultiFileResult(results);
        }, 1000);
        
    } catch (error) {
        console.error('处理文档时出错:', error);
        hideStatus();
        
        // 根据错误类型显示不同的提示
        let errorMessage = error.message || '处理文档时发生错误，请重试';
        if (error.message.includes('频率') || error.message.includes('429')) {
            errorMessage += '\n\n建议：等待1-2分钟后重试，或者尝试使用较小的文档。';
        }
        
        showError(errorMessage);
    } finally {
        // 重新启用按钮
        elements.processBtn.disabled = false;
        elements.retryBtn.disabled = false;
    }
}

// 上传文件到Moonshot（带重试机制）
async function uploadFileToMoonshot(file, retryCount = 0) {
    const maxRetries = 2;
    const baseDelay = 1000;
    
    console.log('📤 开始上传文件:', file.name, formatFileSize(file.size));
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'file-extract');
    
    try {
        const response = await fetch(`${CONFIG.BASE_URL}/files`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Accept': 'application/json',
                'Origin': window.location.origin
            },
            body: formData,
            mode: 'cors' // 明确启用CORS
        });
        
        // 处理429错误
        if (response.status === 429) {
            if (retryCount < maxRetries) {
                const delay = baseDelay * Math.pow(2, retryCount);
                console.log(`文件上传频率限制，${delay/1000}秒后重试...`);
                showStatus('⏳', `上传频率限制，${delay/1000}秒后重试...`, true);
                
                await new Promise(resolve => setTimeout(resolve, delay));
                return await uploadFileToMoonshot(file, retryCount + 1);
            } else {
                throw new Error('文件上传频率过高，请稍后再试');
            }
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `上传失败: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ 文件上传成功:', data.id);
        return data.id;
        
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('网络连接错误，请检查网络连接后重试');
        }
        throw error;
    }
}

// 获取文件内容
async function getFileContent(fileId) {
    try {
        console.log('📖 获取文件内容:', fileId);
        
        const response = await fetch(`${CONFIG.BASE_URL}/files/${fileId}/content`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Accept': 'application/json',
                'Origin': window.location.origin
            },
            mode: 'cors' // 明确启用CORS
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `获取文件内容失败: ${response.status}`);
        }
        
        const content = await response.text();
        console.log('✅ 文件内容获取成功，长度:', content.length);
        return content;
        
    } catch (error) {
        console.error('❌ 获取文件内容失败:', error);
        throw error;
    }
}

// 使用Kimi处理文档（带重试机制）
async function processWithKimi(fileId, retryCount = 0) {
    const maxRetries = 3;
    const baseDelay = 1000; // 1秒基础延迟，更快重试
    
    // 首先获取文件内容
    const fileContent = await getFileContent(fileId);
    
    const requestBody = {
        model: CONFIG.MODEL,
        messages: [
            {
                role: 'system',
                content: `你是 Kimi，由 Moonshot AI 提供的人工智能助手，专门负责从Word文档中提取信息并整理成表格格式。

重要说明：
1. 你必须基于以下提供的真实文档内容进行分析
2. 绝对不要使用任何示例数据或虚构信息
3. 表格必须包含四列：学校、学科、讲课教师、班级
4. 在第一行学校名称后加上当前日期，格式：学校名称（2025-01-15）

文档内容：
${fileContent}`
            },
            {
                role: 'user',
                content: `${CONFIG.PROMPT}\n\n请务必基于上面提供的文档内容进行分析，提取真实的信息。`
            }
        ],
            temperature: 0.2, // 稍微提高质量
            max_tokens: 1500, // 允许更完整的输出
            top_p: 0.8 // 平衡质量和速度
    };
    
    try {
        console.log('🚀 发送API请求:', {
            url: `${CONFIG.BASE_URL}/chat/completions`,
            model: CONFIG.MODEL,
            fileId: fileId
        });
        
        // 创建带超时的fetch请求
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时，直接调用API
        
        const response = await fetch(`${CONFIG.BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': window.location.origin
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
            mode: 'cors' // 明确启用CORS
        });
        
        clearTimeout(timeoutId);
        
        console.log('📡 API响应状态:', response.status, response.statusText);
        
        // 处理429错误（请求过多）和504错误（网关超时）
        if (response.status === 429 || response.status === 504) {
            if (retryCount < maxRetries) {
                const retryAfter = response.headers.get('Retry-After') || (retryCount + 1);
                const delay = Math.max(baseDelay * Math.pow(2, retryCount), parseInt(retryAfter) * 1000);
                
                const errorMsg = response.status === 429 ? '请求频率限制' : '网关超时';
                console.log(`${errorMsg}，${delay/1000}秒后重试...（第${retryCount + 1}次）`);
                showStatus('⏳', `${errorMsg}，${delay/1000}秒后重试...`, true);
                
                await new Promise(resolve => setTimeout(resolve, delay));
                return await processWithKimi(fileId, retryCount + 1);
            } else {
                const errorMsg = response.status === 429 ? '请求频率过高，请稍后再试。建议等待1-2分钟后重新处理。' : '网关超时，请检查网络连接后重试。';
                throw new Error(errorMsg);
            }
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `AI处理失败: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ API响应数据:', data);
        
        const content = data.choices[0].message.content;
        console.log('📝 提取的内容:', content);
        
        return content;
        
    } catch (error) {
        console.error('❌ AI处理失败:', error);
        
        // 处理网络超时错误
        if (error.name === 'AbortError') {
            if (retryCount < maxRetries) {
                const delay = baseDelay * Math.pow(2, retryCount);
                console.log(`请求超时，${delay/1000}秒后重试...（第${retryCount + 1}次）`);
                showStatus('⏳', `请求超时，${delay/1000}秒后重试...`, true);
                
                await new Promise(resolve => setTimeout(resolve, delay));
                return await processWithKimi(fileId, retryCount + 1);
            } else {
                throw new Error('请求超时，请检查网络连接后重试。');
            }
        }
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('网络连接错误，请检查网络连接后重试');
        }
        throw error;
    }
}

// 显示状态
function showStatus(icon, text, showProgress) {
    elements.statusIcon.textContent = icon;
    elements.statusText.textContent = text;
    elements.statusSection.style.display = 'block';
    elements.progressBar.style.display = showProgress ? 'block' : 'none';
    
    if (showProgress) {
        elements.progressFill.style.width = '100%';
    }
}

// 隐藏状态
function hideStatus() {
    elements.statusSection.style.display = 'none';
}

// 显示结果
function showResult(content) {
    // 尝试解析表格内容
    const tableHtml = parseResultToTable(content);
    elements.resultContent.innerHTML = tableHtml;
    elements.resultSection.style.display = 'block';
}

// 显示多文件结果
function showMultiFileResult(results) {
    let html = '';
    
    if (results.length === 1) {
        // 单文件，直接显示结果
        html = parseResultToTable(results[0].result);
    } else {
        // 多文件，分别显示每个文件的结果
        results.forEach((item, index) => {
            html += `<div class="file-result">
                <h3 class="file-result-title">📄 ${item.fileName}</h3>
                <div class="file-result-content">
                    ${parseResultToTable(item.result)}
                </div>
            </div>`;
            
            if (index < results.length - 1) {
                html += '<hr class="file-separator">';
            }
        });
    }
    
    elements.resultContent.innerHTML = html;
    elements.resultSection.style.display = 'block';
}

// 解析结果为表格
function parseResultToTable(content) {
    try {
        // 尝试从Markdown表格格式解析
        const lines = content.split('\n').filter(line => line.trim());
        const tableLines = [];
        let inTable = false;
        
        for (const line of lines) {
            if (line.includes('|')) {
                tableLines.push(line);
                inTable = true;
            } else if (inTable && line.trim() === '') {
                break;
            }
        }
        
        if (tableLines.length > 0) {
            return convertMarkdownTableToHtml(tableLines);
        }
        
        // 如果不是表格格式，直接显示原文本
        return `<div class="result-text">${content.replace(/\n/g, '<br>')}</div>`;
        
    } catch (error) {
        console.error('解析表格时出错:', error);
        return `<div class="result-text">${content.replace(/\n/g, '<br>')}</div>`;
    }
}

// 将Markdown表格转换为HTML
function convertMarkdownTableToHtml(tableLines) {
    const table = document.createElement('table');
    table.className = 'result-table';
    
    let isFirstRow = true;
    let headerProcessed = false;
    
    for (const line of tableLines) {
        // 跳过分隔符行（如 |---|---|）
        if (line.includes('---')) {
            headerProcessed = true;
            continue;
        }
        
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
        if (cells.length === 0) continue;
        
        const row = document.createElement('tr');
        const cellType = (isFirstRow && !headerProcessed) ? 'th' : 'td';
        
        cells.forEach(cellContent => {
            const cell = document.createElement(cellType);
            cell.textContent = cellContent;
            row.appendChild(cell);
        });
        
        table.appendChild(row);
        
        if (isFirstRow) {
            isFirstRow = false;
        }
    }
    
    return table.outerHTML;
}

// 隐藏结果
function hideResult() {
    elements.resultSection.style.display = 'none';
}

// 显示错误
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorSection.style.display = 'block';
}

// 隐藏错误
function hideError() {
    elements.errorSection.style.display = 'none';
}

// 复制结果
function copyResult() {
    const table = elements.resultContent.querySelector('.result-table');
    if (table) {
        // 创建表格的文本版本
        const rows = table.querySelectorAll('tr');
        let textContent = '';
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            const rowText = Array.from(cells).map(cell => cell.textContent).join('\t');
            textContent += rowText + '\n';
        });
        
        navigator.clipboard.writeText(textContent).then(() => {
            // 显示复制成功提示
            const originalText = elements.copyBtn.textContent;
            elements.copyBtn.textContent = '已复制!';
            setTimeout(() => {
                elements.copyBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('复制失败:', err);
            showError('复制失败，请手动选择内容复制');
        });
    }
}

// 下载结果
function downloadResult() {
    const table = elements.resultContent.querySelector('.result-table');
    if (table) {
        // 创建CSV内容
        const rows = table.querySelectorAll('tr');
        let csvContent = '';
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            const rowData = Array.from(cells).map(cell => {
                // 处理包含逗号的内容，用引号包围
                const content = cell.textContent;
                return content.includes(',') ? `"${content}"` : content;
            });
            csvContent += rowData.join(',') + '\n';
        });
        
        // 创建下载链接
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '提取结果.csv';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeEventListeners);