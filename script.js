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


  const workerURL = ""


/* Handle form submit */
chatForm.addEventListener("submit",  async (event) => {
  event.preventDefault();
  chatWindow.innerHTML = "Thinking. . ."



  // When using Cloudflare, you'll need to POST a `messages` array in the body,
  // and handle the response using: data.choices[0].message.content

  // Show message
  // chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});
