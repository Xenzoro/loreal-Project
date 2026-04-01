/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Initialize an array to keep track of the conversation history
  let messageLog = [{
    role: `system`, content:
      `You are a L'Oréal AI Chatbot that helps customers navigate L'Oréal's product catalog and 
       are tasked at responding with with tailored recommendations for the user
    
       If a user's query is unrelated to L'Oréal's product catalog and or related topics, respond by stating you do not know.`
  }];


  const workerURL = "https://loreal-worker.xenzoro.workers.dev";




/* Handle form submit */
chatForm.addEventListener("submit",  async (event) => {
  event.preventDefault();
  chatWindow.innerHTML = "Thinking. . .";

  //add the users message to the conversation history
  messageLog.push({ role: `user`, content: userInput.value });

  try {

    //send a post to cloudflare worker
    const response = await fetch(workerURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messageLog,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    // parse data from worker
    const result = await response.json();
    // parse reply from OpenAI structure
    const replyText = result.choices[0].message.content;
    // add workers response to convo history
    messageLog.push({ role: `assistant`, content: replyText });
    // display response to convo history
    chatWindow.textContent = replyText;

  }catch(error) {
    console.error(`Error:`, error);
    chatWindow.textContent = 'Something went wrong, please try again.';
  }

  userInput.value = "";





  // When using Cloudflare, you'll need to POST a `messages` array in the body,
  // and handle the response using: data.choices[0].message.content

  // Show message
  // chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});
