printSystemMessage("当前模型 : " + "gpt-3.5-turbo-0125 " + "\ntemperature: 0.7" + "\nWebsite Powered By CNLonely");

let history = [];
document.getElementById('user-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        sendMessage(); 
    }
});

async function sendMessage() {
    const userInput = document.getElementById('user-input').value.trim();
    document.getElementById('user-input').value = '';
    printUserMessage(userInput);

    if (!userInput) return;

    const url = "https://api.chatanywhere.tech/v1/chat/completions";
    const headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer sk-7rt1iV8BAwCIwtcaG6Uo7NtYhpeYsCPcr0wfGpbXyNbZ8OdV"
    };
    let messages = history.slice();
    messages.push({"role": "user", "content": userInput});
    const data = {
        "model": "gpt-3.5-turbo",
        "messages": messages,
        "temperature": 0.7,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const jsonResponse = await response.json();
            const systemResponse = jsonResponse.choices[0].message.content;
            printSystemMessage("GPT : "+systemResponse);
            history.push({"role": "user", "content": userInput});
            history.push({"role": "system", "content": systemResponse});

            let totalLength = history.reduce((acc, curr) => acc + curr.content.length, 0);
            while (totalLength > 4096) {
                history.shift(); 
                totalLength = history.reduce((acc, curr) => acc + curr.content.length, 0);
            }
        } else {
            console.error("请求失败，状态码：", response.status);
        }
    } catch (error) {
        printSystemMessage("请求失败：" + error.message);
    }
}

function printUserMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const userMessage = document.createElement('div');
    userMessage.classList.add('message', 'user-message');
    userMessage.textContent = "你 : " + message;
    chatMessages.appendChild(userMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function printSystemMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const systemMessage = document.createElement('div');
    systemMessage.classList.add('message', 'system-message');
    chatMessages.appendChild(systemMessage);

    let index = 0;
    let delay = 100;

    async function printNextCharacter() {
        if (index < message.length) {
            if (message[index] === '`' && message.substring(index, index + 3) === '```') {
                const endIndex = message.indexOf('```', index + 3);
                const codeBlock = message.substring(index, endIndex + 3);
                const codeElement = document.createElement('code');
                codeElement.textContent = codeBlock.substring(3, codeBlock.length - 3); // Remove ```
                codeElement.classList.add('code-text');
                const preElement = document.createElement('pre');
                preElement.appendChild(codeElement);
                const codeContainer = document.createElement('div');
                codeContainer.classList.add('code-container');
                codeContainer.appendChild(preElement);
                systemMessage.appendChild(codeContainer);
                index = endIndex + 3;
            } else if (message[index] === '\n') {
                systemMessage.appendChild(document.createElement('br'));
                index++;
            } else {
                const systemText = document.createElement('span');
                systemText.textContent = message[index];
                systemText.style.whiteSpace = 'nowrap';
                systemMessage.appendChild(systemText);
                index++;
            }
            chatMessages.scrollTop = chatMessages.scrollHeight;
            await sleep(delay);
            delay *= 0.95;
            await printNextCharacter();
        }
    }
    await printNextCharacter();
}