// Love Train
// Yes track always works, No track gets blocked by red light signal

const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const signalLight = document.getElementById('signalLight');
const waitMessage = document.getElementById('waitMessage');
const successScreen = document.getElementById('successScreen');
const muahBtn = document.getElementById('muahBtn'); // New: Get the muah button
const shyMessage = document.getElementById('shyMessage'); // Get the shy message element
const shyImage = document.getElementById('shyImage'); // Get the shy image element
const shyContainer = document.getElementById('shyContainer'); // Get the shy container element
const backgroundDiv = document.querySelector('.background');
const valentineTextSvg = document.getElementById('valentineTextSvg'); // Correctly placed
const successContent = document.getElementById('successContent');
const wordByWordContainer = document.getElementById('wordByWordContainer');
const contentWrapper = document.getElementById('contentWrapper');
const winkGif = document.getElementById('winkGif'); // Add this line

let noClicked = false;
let messageTimeout; // To store the timeout ID for the shy message
let shyLevel = 0; // Tracks how many times the user has been "near" the no button

const BASE_MESSAGE_FONT_SIZE_EM = 0.9; // Base font size for shyMessage
const BASE_IMAGE_SIZE_PX = 38; // Base size for shyImage
const SIZE_INCREMENT_FACTOR = 0.15; // 15% increase per shyLevel
const MAX_SHY_LEVEL = 8; // Cap the shy level to prevent indefinite growth

// Proximity zone around the no button
const PROXIMITY_ZONE = 40; // pixels

function getDistance(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

function moveNoButton() {
    // Get parent container dimensions
    const parentElement = noBtn.parentElement; // This is the .train-section
    const parentRect = parentElement.getBoundingClientRect();
    const parentWidth = parentRect.width;
    const parentHeight = parentRect.height;

    // Get button dimensions
    const buttonRect = noBtn.getBoundingClientRect(); // Still need actual button dimensions
    const buttonWidth = buttonRect.width;
    const buttonHeight = buttonRect.height;

    // Calculate new random position ensuring the button stays within the parent container with a small padding
    // The newX and newY refer to the CENTER of the button, considering the translate(-50%, -50%)
    const padding = 10; // Pixels from the edge

    const minX = buttonWidth / 2 + padding;
    const maxX = parentWidth - buttonWidth / 2 - padding;
    const newX = minX + Math.random() * (maxX - minX);

    const minY = buttonHeight / 2 + padding;
    const maxY = parentHeight - buttonHeight / 2 - padding;
    const newY = minY + Math.random() * (maxY - minY);

    // Apply new position (relative to parent)
    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;
    noBtn.style.transform = 'translate(-50%, -50%)'; // Keep it centered around its new position

    // Update message position if visible
    if (shyContainer.classList.contains('visible')) {
        positionShyMessage();
    }
}

function positionShyMessage() {
    const buttonRect = noBtn.getBoundingClientRect(); // Button's position in viewport
    const parent = shyContainer.parentElement; // .no-train-section
    const parentRect = parent.getBoundingClientRect(); // Parent's position in viewport
    const shyContainerRect = shyContainer.getBoundingClientRect(); // Shy container's dimensions

    const padding = 15; // Padding from screen edges

    // Try placing to the left of the button
    let desiredLeft = (buttonRect.left - parentRect.left) - shyContainerRect.width - 15;
    
    // If it goes off the left edge, try placing it to the right of the button
    if (desiredLeft < padding) {
        desiredLeft = (buttonRect.right - parentRect.left) + 15;
    }

    // Ensure it stays within screen width
    const maxLeft = parentRect.width - shyContainerRect.width - padding;
    desiredLeft = Math.max(padding, Math.min(desiredLeft, maxLeft));

    // Vertical positioning (centered relative to button)
    const buttonCenterYRelativeToParent = (buttonRect.top + buttonRect.height / 2) - parentRect.top;
    let desiredTop = buttonCenterYRelativeToParent - shyContainerRect.height / 2;
    
    // Ensure it stays within parent height boundaries
    const maxTop = parentRect.height - shyContainerRect.height - padding;
    desiredTop = Math.max(padding, Math.min(desiredTop, maxTop));

    shyContainer.style.left = `${desiredLeft}px`;
    shyContainer.style.top = `${desiredTop}px`;
    shyContainer.style.transform = 'none'; // No additional transform
}

// Event listener for mouse movement to detect proximity
document.body.addEventListener('mousemove', (e) => {
    if (noClicked) return; // If no button has been clicked, don't move it

    const buttonRect = noBtn.getBoundingClientRect();
    const buttonCenterX = buttonRect.left + buttonRect.width / 2;
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    const distance = getDistance(e.clientX, e.clientY, buttonCenterX, buttonCenterY);

    if (distance < PROXIMITY_ZONE) {
        // Only move if the button is not already in the process of moving from a previous interaction
        if (!noBtn.classList.contains('moving')) {
            noBtn.classList.add('moving');
            moveNoButton();

            // Progressive sizing
            if (shyLevel < MAX_SHY_LEVEL) { // Cap the shy level
                shyLevel++;
            }
            const currentMessageFontSize = BASE_MESSAGE_FONT_SIZE_EM * (1 + shyLevel * SIZE_INCREMENT_FACTOR);
            const currentImageSize = BASE_IMAGE_SIZE_PX * (1 + shyLevel * SIZE_INCREMENT_FACTOR);

            shyMessage.style.fontSize = `${currentMessageFontSize}em`;
            shyImage.style.width = `${currentImageSize}px`;
            shyImage.style.height = `${currentImageSize}px`;

            // Show shy message after 0.05 seconds
            clearTimeout(messageTimeout); // Clear any previous timeout
            messageTimeout = setTimeout(() => {
                shyContainer.classList.remove('hidden');
                shyContainer.classList.add('visible');
                positionShyMessage(); // Position message after it becomes visible
            }, 50); // 50ms

            // Remove moving class after transition
            noBtn.addEventListener('transitionend', () => {
                noBtn.classList.remove('moving');
            }, { once: true });
        }
    }
});


// YES button click - instant win
yesBtn.addEventListener('click', () => {
    // Reset shy level and sizes
    shyLevel = 0;
    shyMessage.style.fontSize = `${BASE_MESSAGE_FONT_SIZE_EM}em`;
    shyImage.style.width = `${BASE_IMAGE_SIZE_PX}px`;
    shyImage.style.height = `${BASE_IMAGE_SIZE_PX}px`;

    // Hide shy message immediately if visible
    clearTimeout(messageTimeout);
    shyContainer.classList.remove('visible');
    shyContainer.classList.add('hidden');
    showSuccess();
});

// NO button click - triggers red light sequence
noBtn.addEventListener('click', (e) => {
    if (noClicked) return; // Prevent multiple clicks

    e.preventDefault();
    noClicked = true;

    // Reset shy level and sizes
    shyLevel = 0;
    shyMessage.style.fontSize = `${BASE_MESSAGE_FONT_SIZE_EM}em`;
    shyImage.style.width = `${BASE_IMAGE_SIZE_PX}px`;
    shyImage.style.height = `${BASE_IMAGE_SIZE_PX}px`;

    // Hide shy message immediately if visible
    clearTimeout(messageTimeout);
    shyContainer.classList.remove('visible');
    shyContainer.classList.add('hidden');

    // Show red light signal
    signalLight.classList.add('red');

    // Show wait message
    waitMessage.style.display = 'block';

    // After 2 seconds, redirect to the new no.html page
    setTimeout(() => {
        window.location.href = 'no.html';
    }, 2000);
});

async function displayWordByWord(text, containerElement, delay = 100) {
    containerElement.innerHTML = ''; // Clear existing content
    const words = text.split(' ');
    for (const word of words) {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.style.opacity = '0'; // Start hidden
        containerElement.appendChild(span);
        // Force reflow to ensure transition works
        span.offsetWidth;
        span.style.opacity = '1';
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

async function showSuccess() { // Make showSuccess async
    successScreen.classList.remove('hidden');
    backgroundDiv.style.backgroundImage = 'url("tunnel.jpg")';
    valentineTextSvg.style.display = 'none';
    successContent.style.display = 'none'; // Hide success content

    contentWrapper.style.display = 'none'; // Hide main content wrapper

    // Display new message word by word
    const successMessage = "Is it getting hot in here, or did this train just enter a tunnel?";
    await displayWordByWord(successMessage, wordByWordContainer, 150); // Await word-by-word display

    // After text displays, show wink.gif
    winkGif.classList.remove('hidden');
    await new Promise(resolve => setTimeout(resolve, 500)); // Short delay for wink.gif to be seen

    // Then show the muah button
    muahBtn.classList.remove('hidden');
}

// Event listener for the muah button
muahBtn.addEventListener('click', () => {
    window.location.href = 'index.html'; // Navigate back to the main page
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
        // Reset shy level and sizes
        shyLevel = 0;
        shyMessage.style.fontSize = `${BASE_MESSAGE_FONT_SIZE_EM}em`;
        shyImage.style.width = `${BASE_IMAGE_SIZE_PX}px`;
        shyImage.style.height = `${BASE_IMAGE_SIZE_PX}px`;

        // Hide shy message if success screen is shown via shortcut
        clearTimeout(messageTimeout);
        shyContainer.classList.remove('visible');
        shyContainer.classList.add('hidden');
        // Do not call showSuccess() here; it's handled by button clicks.
    }
});