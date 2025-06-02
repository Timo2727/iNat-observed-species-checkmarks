let USERNAME = '';
let GREEN = '#d6ffd6';
let PINK = '#ffdefe';

chrome.storage.sync.get(['username', 'greenColor', 'pinkColor'], (data) => {
  USERNAME = data.username || '';
  GREEN = data.greenColor || '#d6ffd6';
  PINK = data.pinkColor || '#ffdefe';
  fetchSeenTaxa(USERNAME); // now start loading
});



console.log("[iNat Checkmarks] Script loaded");

const seenTaxa = new Set();

async function fetchSeenTaxa(username) {
  console.log(`[iNat Checkmarks] Fetching observations for ${username}...`);
  let page = 1;
  let more = true;

  while (more) {
    const res = await fetch(`https://api.inaturalist.org/v1/observations?user_login=${username}&per_page=200&page=${page}`);
    const data = await res.json();
    data.results.forEach(obs => {
      if (obs.taxon && obs.taxon.id) {
        seenTaxa.add(obs.taxon.id);
      }
    });
    more = data.results.length === 200;
    page++;
  }

  console.log(`[iNat Checkmarks] Loaded ${seenTaxa.size} observed taxon IDs`);
  addCheckmarks();
}

function extractTaxonId(card) {
  const href = card.querySelector('a.photo')?.getAttribute('href') || '';
  const match = href.match(/\/taxa\/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function addCheckmarks() {
  const cards = document.querySelectorAll('.taxon-grid-cell');
  console.log(`[iNat Checkmarks] Checking ${cards.length} cards`);

  cards.forEach(card => {
    const taxonId = extractTaxonId(card);
    const imageLink = card.querySelector('a.photo');
    const nameSection = card.querySelector('.caption');

    if (taxonId && seenTaxa.has(taxonId)) {
      if (imageLink && !imageLink.querySelector('.checkmark-overlay')) {
        const overlay = document.createElement('div');
        overlay.textContent = '✔';
        overlay.className = 'checkmark-overlay';
        Object.assign(overlay.style, {
          position: 'absolute',
          bottom: '6px',
          right: '6px',
          width: '22px',
          height: '22px',
          backgroundColor: "#34C759",
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: '22px',
          borderRadius: '50%',
          boxShadow: '0 0 2px rgba(0,0,0,0.4)',
          zIndex: '9999',
          pointerEvents: 'none'
        });

        imageLink.style.position = 'relative';
        imageLink.appendChild(overlay);
      }

      if (nameSection) {
        nameSection.style.backgroundColor = GREEN;
      }

    } else {
      if (nameSection && !nameSection.style.backgroundColor) {
        nameSection.style.backgroundColor = PINK;
      }
    }
  });
}



// MutationObserver for infinite scroll or filters
const observer = new MutationObserver(addCheckmarks);
observer.observe(document.body, { childList: true, subtree: true });

// Run it all
setTimeout(() => fetchSeenTaxa(USERNAME), 1000);
