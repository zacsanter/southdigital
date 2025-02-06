"use strict";

// === Constants and Initialization ===
const voiceflowRuntime    = "general-runtime.voiceflow.com";
const voiceflowVersionID  = "production"; // 'production' or desired version ID
const voiceflowProjectID  = "679b8688856ad419ecfaa128";
const voiceflowAPIKey     = "VF.DM.679b98dbd891c785346abe70.Yy7Gqub8gsyaMok6"; // Replace securely

// === DOM Elements ===
const typingIndicator     = document.getElementById("typing-indicator-2");
const chatWindow          = document.getElementById("chat-window");
const input               = document.getElementById("user-input");
const inputFieldContainer = document.getElementById("input-container");
const savedMessages       = localStorage.getItem("messages");
const chatContainer       = document.querySelector(".ai-chatbot");
const restartButton       = document.getElementById("restart-button");
const cancelRestartButton = document.getElementById("cancel-restart-button");
const sendButton          = document.getElementById("send-button");
const moreButton          = document.getElementById("more-button"); // if used

// === Utility Functions ===

/** Debounce: limit the rate at which a function can fire. */
function debounce(func, delay) {
  let debounceTimeout;
  return function (...args) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => func.apply(this, args), delay);
  };
}

/** Throttle: limit the number of times a function can fire within a timeframe. */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/** Generate or retrieve a unique user ID (cached in localStorage). */
function getUniqueId() {
  let uniqueId = localStorage.getItem("uniqueId");
  if (!uniqueId) {
    uniqueId = generateUniqueId();
    localStorage.setItem("uniqueId", uniqueId);
  }
  return uniqueId;
}

/** Improved unique ID generation using random + timestamp. */
function generateUniqueId() {
  const randomStr   = Math.random().toString(36).substring(2, 8);
  const dateTimeStr = Date.now().toString(36);
  return `user-${randomStr}-${dateTimeStr}`;
}

/** Toggle the visibility of the send button based on input content. */
function toggleSendButton() {
  sendButton.classList.toggle("show", input.value.trim() !== "");
}

/** Detect if device is desktop or not. */
function isDesktop() {
  return !/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// === Initialize Unique ID ===
const uniqueId = getUniqueId();

// === Core Functions ===

/**
 * Handle user input:
 * 1) Create the transcript if it doesn’t exist yet (FIRST input only).
 * 2) Add user’s message, clear input, hide welcome if needed, scroll down.
 * 3) Send user message to Voiceflow API.
 */
async function handleUserInput(userInput) {
  // <== CREATE THE TRANSCRIPT ON FIRST REAL USER INPUT ==>
  if (!localStorage.getItem('transcriptID')) {
    await createTranscript(); // Moved from DOMContentLoaded
  }

  input.disabled = true;
  input.classList.add("fade-out");

  addUserMsg(userInput);
  clearInputField();

  // Hide 'chat-welcome-block' on first user input
  const welcomeBlock = chatWindow.querySelector(".chat-welcome-block");
  if (welcomeBlock && welcomeBlock.style.display !== "none") {
    welcomeBlock.style.display = "none";
  }

  scrollToBottom();
  showTypingIndicator();

  // Interact with Voiceflow, showing the typing indicator
  await interact({ type: "text", payload: userInput }, true);
}

/** Restart the chat by clearing messages and re-showing welcome. */
async function restartChat() {
  const welcomeMessage = chatWindow.querySelector(".ai-message-welcome");
  const welcomeBlock   = chatWindow.querySelector(".chat-welcome-block");

  if (welcomeMessage) welcomeMessage.style.display = "block";
  if (welcomeBlock)   welcomeBlock.style.display   = "flex";

  const messages = chatWindow.querySelectorAll(
    ".ai-message, .user-message, .ai-button-wrap, .typing-indicator"
  );
  messages.forEach((message) => {
    if (
      !message.classList.contains("ai-message-welcome") &&
      !message.classList.contains("chat-welcome-block")
    ) {
      chatWindow.removeChild(message);
    }
  });

  // Clear messages from localStorage
  localStorage.removeItem("messages");

  // Initiate a new conversation
  await interact("#launch#", false);
}

/** Interact with the Voiceflow API, optionally showing the typing indicator. */
async function interact(action, showIndicator = true) {
  if (showIndicator) {
    showTypingIndicator();
  }

  let body;
  if (typeof action === 'string' && action === "#launch#") {
    body = {
      config: { tts: true, stripSSML: true },
      action: { type: "launch" },
    };
  } else {
    body = {
      config: { tts: true, stripSSML: true },
      action: action,
    };
  }

  try {
    const response = await fetch(
      `https://${voiceflowRuntime}/state/user/${uniqueId}/interact/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: voiceflowAPIKey,
          versionID: voiceflowVersionID,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    displayResponse(data);
  } catch (error) {
    console.error("Interact Error:", {
      error: error.message,
      stack: error.stack,
      userID: uniqueId,
      timestamp: new Date().toISOString(),
    });
    displayErrorMessage(
      `Service temporarily unavailable. Our team has been notified. (Error: ${error.message})`
    );
  } finally {
    if (showIndicator) {
      hideTypingIndicator();
    }
    input.disabled = false;
    input.classList.remove("fade-out");

    if (isDesktop()) {
      input.focus();
    }
    chatWindow.style.opacity = "1";
  }
}

/** Display the Voiceflow response messages with a slight delay and a scale-in animation. */
function displayResponse(response) {
  if (!response || !Array.isArray(response)) {
    displayErrorMessage("No response received from the assistant.");
    return;
  }

  let accumulatedDelay = 0;
  const BASE_DELAY = 300;

  response.forEach((item, index) => {
    accumulatedDelay += BASE_DELAY;

    setTimeout(() => {
      let messageElement = null;

      if (item.type === "speak" || item.type === "text") {
        messageElement            = document.createElement("div");
        messageElement.className  = "ai-message";
        messageElement.textContent = item.payload.message;
        messageElement.setAttribute('role', 'alert');
        messageElement.setAttribute('aria-live', 'polite');
        chatWindow.appendChild(messageElement);
      }
      else if (item.type === "choice") {
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("ai-button-wrap");

        item.payload.buttons.forEach((button) => {
          const buttonElement = document.createElement("a");
          buttonElement.classList.add("ai-button");
          buttonElement.textContent = button.name;
          buttonElement.dataset.request = JSON.stringify(button.request);

          buttonElement.setAttribute('role', 'button');
          buttonElement.setAttribute('tabindex', '0');
          buttonElement.setAttribute('aria-label', `Choose option: ${button.name}`);

          buttonContainer.appendChild(buttonElement);
        });

        chatWindow.appendChild(buttonContainer);
        manageChatHistory();

        // GSAP for button fade & scale
        gsap.fromTo(
          buttonContainer.children,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out", stagger: 0.05 }
        );
      }
      else if (item.type === "visual") {
        const imageElement = document.createElement("img");
        imageElement.src   = item.payload.image;
        imageElement.alt   = "Assistant Image";
        imageElement.classList.add("assistant-image");
        imageElement.setAttribute('role', 'img');

        chatWindow.appendChild(imageElement);

        // GSAP fade & scale
        gsap.fromTo(
          imageElement,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
        );
      }

      // Animate text messages
      if (messageElement) {
        gsap.fromTo(
          messageElement,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
        );
      }

      // After last item, update history & scroll
      if (index === response.length - 1) {
        manageChatHistory();
        scrollToBottom();
      }
    }, accumulatedDelay);
  });
}

/** Add the user's text to the chat and animate it. */
function addUserMsg(userInput) {
  const userMessageElement = document.createElement("div");
  userMessageElement.className = "user-message";
  userMessageElement.textContent = userInput;

  chatWindow.appendChild(userMessageElement);
  manageChatHistory();
  scrollToBottom();

  // Animate user message
  gsap.fromTo(
    userMessageElement,
    { opacity: 0, scale: 0.95 },
    { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
  );
}

/** Limit chat history to the latest 100 messages; store in localStorage. */
function manageChatHistory() {
  try {
    if (!("localStorage" in window)) return;

    const maxMessages = 100;
    const messages = chatWindow.querySelectorAll(
      ".ai-message, .user-message, .ai-button-wrap, .typing-indicator"
    );
    const welcomeMessage = chatWindow.querySelector(".ai-message-welcome");
    const welcomeBlock   = chatWindow.querySelector(".chat-welcome-block");

    let count = 0;
    messages.forEach((msg) => {
      if (msg !== welcomeMessage && msg !== welcomeBlock) count++;
    });

    if (count > maxMessages) {
      messages.forEach((msg) => {
        if (msg !== welcomeMessage && msg !== welcomeBlock && count > maxMessages) {
          chatWindow.removeChild(msg);
          count--;
        }
      });
    }

    // Clone chat to strip inline styles
    const chatClone = chatWindow.cloneNode(true);

    chatClone.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));

    // Remove welcome message/block from clone
    const clonedWelcomeBlock   = chatClone.querySelector(".chat-welcome-block");
    if (clonedWelcomeBlock)    chatClone.removeChild(clonedWelcomeBlock);

    const clonedWelcomeMessage = chatClone.querySelector(".ai-message-welcome");
    if (clonedWelcomeMessage)  chatClone.removeChild(clonedWelcomeMessage);

    // Save dynamic messages
    localStorage.setItem("messages", chatClone.innerHTML);
  } catch (error) {
    console.error("Storage access error:", error);
  }
}

/** Clear the user input field and toggle the send button. */
function clearInputField() {
  input.value = "";
  toggleSendButton();
}

/** Show an error message in the chat. */
function displayErrorMessage(message) {
  const errorElement = document.createElement("div");
  errorElement.classList.add("error");
  errorElement.textContent = message;

  const errorWrapper = document.createElement("div");
  errorWrapper.classList.add("errorWrapper");
  errorWrapper.appendChild(errorElement);

  const errorMsg = document.createElement("div");
  errorMsg.classList.add("errorMsg");
  errorMsg.appendChild(errorWrapper);

  chatWindow.appendChild(errorMsg);
  manageChatHistory();
  scrollToBottom();

  // Animate error
  gsap.fromTo(
    errorMsg,
    { opacity: 0, scale: 0.95 },
    { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
  );
}

/** Smooth scroll to the bottom of the chat. */
function scrollToBottom() {
  setTimeout(() => {
    chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: "smooth" });
  }, 100);
}

/** Show the typing indicator at the end of the chat. */
function showTypingIndicator() {
  if (!typingIndicator) return;
  typingIndicator.classList.remove("hidden");
  chatWindow.appendChild(typingIndicator);
  scrollToBottom();
}

/** Hide the typing indicator. */
function hideTypingIndicator() {
  if (typingIndicator) {
    typingIndicator.classList.add("hidden");
  }
}

/** Button-click handler (event delegation). */
async function handleButtonClick(event) {
  const button = event.target;
  if (!button.classList.contains("ai-button")) return;

  event.preventDefault(); // only for ai-button

  let request;
  try {
    request = JSON.parse(button.dataset.request);
  } catch (err) {
    console.error("Invalid JSON in data-request:", err);
    displayErrorMessage("Invalid button configuration. Please try again.");
    return;
  }

  addUserMsg(button.textContent);

  // Remove button container
  const buttonContainer = button.parentElement;
  if (buttonContainer) {
    chatWindow.removeChild(buttonContainer);
  }

  // If button has a URL action, open in new tab
  if (request.payload && request.payload.actions) {
    for (const action of request.payload.actions) {
      if (action.type === "open_url" && action.payload.url) {
        window.open(action.payload.url, "_blank");
      }
    }
  }

  showTypingIndicator();
  await interact(request, true);
}

/** Toggle background scroll (for modals, etc.). */
function toggleBackgroundScroll(enable) {
  const bodyElement = document.querySelector("body");
  if (!bodyElement) return console.warn("Body not found.");

  if (enable) bodyElement.classList.add("no-scroll");
  else        bodyElement.classList.remove("no-scroll");
}

/** Create a transcript for this session (only once). */
async function createTranscript() {
  if (localStorage.getItem("transcriptID")) return; // already created

  const args = {
    projectID: voiceflowProjectID,
    versionID: voiceflowVersionID,
    sessionID: uniqueId,
    device: getDeviceInfo(),
    os: getOperatingSystem(),
    browser: getBrowser(),
    unread: true,
    name: uniqueId,
  };

  try {
    const response = await fetch("https://api.voiceflow.com/v2/transcripts", {
      method: "PUT",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        Authorization: voiceflowAPIKey,
      },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      throw new Error(`Failed to create transcript: ${response.statusText}`);
    }

    const data = await response.json();
    // Save transcriptID and creatorID for future updates
    localStorage.setItem("transcriptID", data._id);
    localStorage.setItem("creatorID", data.creatorID);
  } catch (error) {
    console.error("Error creating transcript:", error);
  }
}

/** Identify device type from userAgent. */
function getDeviceInfo() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "iOS Device";
  if (/android/i.test(userAgent)) return "Android Device";
  if (/windows phone/i.test(userAgent)) return "Windows Phone";
  return "Unknown Device";
}

/** Identify operating system. */
function getOperatingSystem() {
  const platform  = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  if (platform.includes("mac")) return "macOS";
  if (platform.includes("win")) return "Windows";
  if (platform.includes("linux")) return "Linux";
  if (/android/.test(userAgent)) return "Android";
  if (/iphone|ipad|ipod/.test(userAgent)) return "iOS";
  return "Unknown OS";
}

/** Identify browser type. */
function getBrowser() {
  if (typeof InstallTrigger !== "undefined") return "Firefox";
  if (window.chrome && window.chrome.webstore) return "Chrome";
  if (typeof window.opr !== "undefined") return "Opera";
  if (typeof window.StyleMedia !== "undefined") return "Edge";
  if (document.documentMode) return "Internet Explorer";
  return "Unknown Browser";
}

// === Event Listeners ===

// Send button click
sendButton.addEventListener("click", () => {
  const userInput = input.value.trim();
  if (userInput) {
    handleUserInput(userInput);
    sendButton.classList.remove("show");
  }
});

// Restart chat
restartButton.addEventListener("click", () => {
  restartChat();
});

// Cancel restart
cancelRestartButton.addEventListener("click", () => {
  const restartChatModal = document.querySelector(".restart-chat");
  if (restartChatModal) {
    restartChatModal.style.display = "none";
  }
});

// Debounced input => toggle send button
input.addEventListener("input", debounce(toggleSendButton, 100));

// Document ready
document.addEventListener("DOMContentLoaded", () => {
  // Set chat container height
  chatContainer.style.height = `${window.innerHeight}px`;

  if (!savedMessages) {
    // If no saved messages: Show welcome content; do NOT createTranscript yet
    const welcomeMessage = chatWindow.querySelector(".ai-message-welcome");
    const welcomeBlock   = chatWindow.querySelector(".chat-welcome-block");
    if (welcomeMessage) welcomeMessage.style.display = "block";
    if (welcomeBlock)   welcomeBlock.style.display   = "flex";

    // Launch the chat (no typing indicator)
    interact("#launch#", false);
  } else {
    // If saved messages exist: load them
    chatWindow.innerHTML = savedMessages;
    if (typingIndicator) typingIndicator.classList.add("hidden");

    // Hide welcome block if it exists
    const welcomeBlock = chatWindow.querySelector(".chat-welcome-block");
    if (welcomeBlock) {
      welcomeBlock.style.display = "none";
    }

    // Re-animate stored messages
    const messages = chatWindow.querySelectorAll(
      ".ai-message, .user-message, .ai-button-wrap, .typing-indicator"
    );
    messages.forEach((msg) => {
      msg.removeAttribute("style"); // remove any residual inline style
      if (msg.classList.contains("ai-message")) {
        msg.style.opacity  = "1";
        msg.style.transform = "scale(1)";
        gsap.fromTo(
          msg,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
        );
      }
      if (msg.classList.contains("ai-button-wrap")) {
        Array.from(msg.children).forEach((btn) => {
          btn.style.opacity   = "1";
          btn.style.transform = "scale(1)";
        });
        gsap.fromTo(
          msg.children,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out", stagger: 0.05 }
        );
      }
    });
  }

  inputFieldContainer.addEventListener("click", () => {
    if (isDesktop()) {
      input.focus();
    }
  });

  // Throttled window resize => adjust chat container height
  window.addEventListener(
    "resize",
    throttle(() => {
      chatContainer.style.height = `${window.innerHeight}px`;
    }, 500)
  );

  // "aisearch" click => handle user input from a search field if present
  const aiSearchElement = document.querySelector(".aisearch");
  if (aiSearchElement) {
    aiSearchElement.addEventListener("click", (event) => {
      event.preventDefault();
      const searchInput = document.querySelector(".popular-search-input.w-input");
      const userInput   = (searchInput && searchInput.value.trim()) || "";
      if (userInput) {
        handleUserInput(userInput);
      }
    });
  }

  // Send on Enter
  input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const userInput = input.value.trim();
      if (userInput) {
        handleUserInput(userInput);
        sendButton.classList.remove("show");
      }
    }
  });

  // Init send button visibility
  toggleSendButton();
});

// Delegate button clicks inside chatWindow
chatWindow.addEventListener("click", handleButtonClick);
