/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello, I am Lori, L'Oréal's AI Chatbot how can I help you today?";

// Initialize an array to keep track of the conversation history
  let messageLogToAI = [{
    role: `system`, content:
      `
      You are Lori, a L'Oréal AI beauty advisor.

      Your job is to recommend L'Oréal products and routines in a clear, simple, and structured way.
      
      Formatting rules:
      - Use plain text only (no markdown, no asterisks, no special characters)
      - Do NOT use symbols like *, **, -, or #
      - Use numbered steps with this format:
      
      1. Cleanser:
      Short explanation here.
      
      2. Toner:
      Short explanation here.
      
      3. Serum:
      Short explanation here.
      
      - Keep sentences short and easy to read
      - Add spacing between each step
      - Do not use bold formatting
      - If possible give exact products
      
      If the question is unrelated to beauty or L'Oréal products, respond with a clever tie back into telling the user
      you can only answer questions about L'Oréal
      `
  }];

// variable for data from ai
  let messageLog = []


  const workerURL = "https://loreal-worker.xenzoro.workers.dev";


/* Handle form submit */
chatForm.addEventListener("submit",  async (event) => {
  event.preventDefault();
  // adds loading message to messageLog, then removes it after use
    messageLog.push(`Thinking. . . \n`)
    chatWindow.innerHTML =(messageLog.join("\n"));
    messageLog.pop()


  //add the users message to the conversation history
  messageLogToAI.push({ role: `user`, content: userInput.value });
  //add to the HTML element
  messageLog.push(`<div class="chat-message user-message"><span class="bold-label">You:</span> ${userInput.value}</div>`);

  try {

    //send a post to cloudflare worker
    const response = await fetch(workerURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messageLogToAI,
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    // parse data from worker
    const result = await response.json();
    // parse reply from OpenAI structure
    const replyText = result.choices[0].message.content;
    // add workers response to convo history
    messageLogToAI.push({ role: `assistant`, content: replyText });
    // add response to local convo history
    messageLog.push(`<div class="chat-message assistant-message-box "><span class="bold-label">Lori:</span> ${replyText}</div>`);

    // display response to convo history
    chatWindow.innerHTML = (`${messageLog.join("\n")}`);

  }catch(error) {
    console.error(`Error:`, error);
    chatWindow.innerHTML = 'Something went wrong, please try again.';
  }

  userInput.value = "";





  // When using Cloudflare, you'll need to POST a `messages` array in the body,
  // and handle the response using: data.choices[0].message.content

  // Show message
  // chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});
