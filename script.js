window.addEventListener('load', (event) => {
  // Get the current location of the SPA.
  let currentUrl = location.href

  // Wait for a project to be deployed before generating a QR code.
  const awaitUrl = () => {
    if (!document.querySelectorAll('.status.success').length) {
      window.requestAnimationFrame(awaitUrl)
    } else {
      applyCode()
    }
  }

  // On first run if the location includes overview then check to see if the project has been deployed.
  if (currentUrl.includes('overview')) { awaitUrl() }

  // Check on click and popstate to see if the location of the SPA has changed.
  ['click', 'popstate'].forEach(event =>
    window.addEventListener(event, function () {
      requestAnimationFrame(() => {
        // Make sure the URL has changed, and the qrcode div doesn't already exist.
        if (currentUrl !== location.href && !document.getElementById('qrcode')) {
          if (location.href.includes('overview')) { awaitUrl() }
        }
        currentUrl = location.href
      })
    }, true)
  )

  // Catch drop events on Netlify Drop.
  window.addEventListener('drop', (event) => {
    if (currentUrl.includes('app.netlify.com/drop') || currentUrl.includes('/sites')) {
      awaitDrop()
    }
  }, true)

  // Wait for Netlify Drop to navigate to the Netlify overview.
  const awaitDrop = () => {
    if (!location.href.includes('overview')) {
      window.requestAnimationFrame(awaitDrop)
    } else {
      awaitUrl()
    }
  }

  // Add the QR code to the dashboard.
  const applyCode = () => {
    const html = `
    <div class="card card-hero media site-hero" style="min-width: 204px;max-width: 204px;">
        <div id="qrcode"></div>
    </div>
    `
    document.querySelector('.layout-grid-hero').insertAdjacentHTML('beforeend', html)
    new QRCode(document.getElementById('qrcode'), {
      text: document.querySelectorAll('.status.success')[0].href,
      width: 156,
      height: 156
    })
  }
})
