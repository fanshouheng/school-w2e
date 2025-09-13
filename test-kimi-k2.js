const OpenAI = require("openai");

// 测试Kimi K2 API调用
const client = new OpenAI({
    apiKey: "sk-r9MRlIeoVS4dWLub7nk4NAnhYB72N81me7hbTwnuEW3xxiIg",    
    baseURL: "https://api.moonshot.cn/v1",
});

async function testBasicChat() {
    console.log("测试基础对话...");
    try {
        const completion = await client.chat.completions.create({
            model: "kimi-k2-0905-preview",         
            messages: [ 
                {
                    role: "system", 
                    content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。"
                },
                {
                    role: "user", 
                    content: "你好，请帮我测试一下API是否正常工作"
                }
            ],
            temperature: 0.6
        });
        
        console.log("✅ 基础对话测试成功:");
        console.log(completion.choices[0].message.content);
        return true;
    } catch (error) {
        console.error("❌ 基础对话测试失败:", error.message);
        return false;
    }
}

async function testFileUpload() {
    console.log("\n测试文件上传...");
    try {
        // 注意：这里需要实际的文件，这只是示例代码
        const fs = require('fs');
        const path = require('path');
        
        // 假设有一个测试文件
        const testFilePath = './test.docx';
        
        if (!fs.existsSync(testFilePath)) {
            console.log("⚠️ 跳过文件上传测试（未找到测试文件）");
            return true;
        }
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testFilePath));
        formData.append('purpose', 'file-extract');
        
        const response = await fetch('https://api.moonshot.cn/v1/files', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer sk-r9MRlIeoVS4dWLub7nk4NAnhYB72N81me7hbTwnuEW3xxiIg`
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`文件上传失败: ${response.status}`);
        }
        
        const fileData = await response.json();
        console.log("✅ 文件上传成功:", fileData.id);
        
        // 测试文件处理
        const completion = await client.chat.completions.create({
            model: "kimi-k2-0905-preview",
            messages: [
                {
                    role: "system",
                    content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手。你特别擅长从文档中提取信息并整理成表格格式。"
                },
                {
                    role: "user",
                    content: `#file:${fileData.id}\n\n请分析这个文档的内容并总结。`
                }
            ],
            temperature: 0.6
        });
        
        console.log("✅ 文件处理成功:");
        console.log(completion.choices[0].message.content);
        return true;
        
    } catch (error) {
        console.error("❌ 文件处理测试失败:", error.message);
        return false;
    }
}

async function main() {
    console.log("🚀 开始测试Kimi K2 API...\n");
    
    // 测试基础对话
    const chatTest = await testBasicChat();
    
    // 测试文件上传和处理
    const fileTest = await testFileUpload();
    
    console.log("\n📊 测试结果总结:");
    console.log(`基础对话: ${chatTest ? '✅ 通过' : '❌ 失败'}`);
    console.log(`文件处理: ${fileTest ? '✅ 通过' : '❌ 失败'}`);
    
    if (chatTest && fileTest) {
        console.log("\n🎉 所有测试通过！Kimi K2 API工作正常。");
    } else {
        console.log("\n⚠️ 部分测试失败，请检查API配置或网络连接。");
    }
}

// 运行测试
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testBasicChat, testFileUpload };