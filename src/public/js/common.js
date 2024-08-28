document.addEventListener('DOMContentLoaded', () => {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const docThumbnails = document.querySelectorAll('.doc-thumbnail');
  const maxRetries = 3; // Set the maximum number of retries

  docThumbnails.forEach((img) => {
    let retryCount = 0; // Initialize retry counter

    img.onload = function () {
      img.style.opacity = 1;
    };

    img.onerror = function () {
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(() => {
          img.src = img.src; // Retry loading the image
        }, 1000);
      } else {
        console.error(`Failed to load image after ${maxRetries} retries.`);
        // Optionally, handle the case where the image couldn't be loaded after max retries
      }
    };
  });
});
