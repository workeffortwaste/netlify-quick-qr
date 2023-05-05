window.addEventListener('load', (event) => {
  // Get the current location of the SPA.
  let currentUrl = location.href

  // Add the QR code to the dashboard.
  const applyCode = (type) => {
    /* if qrcode exists delete it */
    if (document.getElementById('qrcode-container')) {
      document.getElementById('qrcode-container').remove()
    }

    const html = `
    <style>
    /* Tidy up default netlify hero styling */
    .layout-grid.layout-grid-hero {
      grid-template-columns: minmax(49%, max-content) auto;
    }
    </style>
    <div id="qrcode-container" class="card card-hero media site-hero" style="min-width: 233px;max-width: 233px;">
        <div id="qrcode"></div>
    </div>
    `
    document.querySelector('.layout-grid-hero').insertAdjacentHTML('beforeend', html)

    const selector = type === 'deploy' ? '*[data-testid="card-footer"] a' : '.status.success'
    // eslint-disable-next-line no-new, no-undef
    new QRCode(document.getElementById('qrcode'), {
      text: document.querySelectorAll(selector)[0]?.href,
      width: 183,
      height: 183
    })
  }

  // Wait for a project to be deployed before generating a QR code.
  const awaitUrl = (type = 'site') => {
    const selector = type === 'deploy' ? '*[data-testid="card-footer"] a' : '.status.success'
    if (document.querySelectorAll(selector)[0]?.href) {
      applyCode(type)
    } else {
      setTimeout(() => { awaitUrl(type) }, 200)
    }
  }

  // On first run if the location includes overview then check to see if the project has been deployed.
  if (currentUrl.includes('overview')) { awaitUrl() }
  if (currentUrl.includes('deploys')) { awaitUrl('deploy') }

  // Check on click and popstate to see if the location of the SPA has changed.
  ['click', 'popstate'].forEach(event =>
    window.addEventListener(event, function () {
      requestAnimationFrame(() => {
        // Make sure the URL has changed, and the qrcode div doesn't already exist.
        if (currentUrl !== location.href && !document.getElementById('qrcode')) {
          if (location.href.includes('overview')) { awaitUrl() }
          if (location.href.includes('deploys')) { awaitUrl('deploy') }
        }
        currentUrl = location.href
      })
    }, true)
  )

  // Catch drop events on Netlify Drop.
  let awaitingDrop = false
  window.addEventListener('drop', (event) => {
    if ((currentUrl.includes('app.netlify.com/drop') || currentUrl.includes('/sites')) && !awaitingDrop) {
      awaitingDrop = true
      awaitDrop()
    }
  }, true)

  // Wait for Netlify Drop to provide a URL.
  const awaitDrop = () => {
    if (!location.href.includes('deploys')) {
      window.requestAnimationFrame(awaitDrop)
    } else {
      setTimeout(() => { awaitUrl('deploy') }, 200)
    }
  }
})
