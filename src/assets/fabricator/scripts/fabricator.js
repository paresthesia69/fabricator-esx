require('./prism');

/**
 * Global `fabricatorInMem` object
 * @namespace
 */
const fabricatorInMem = {};


/**
 * Default options
 * @type {Object}
 */
fabricatorInMem.options = {
  toggles: {
    labels: true,
    notes: true,
    code: false
  },
  menu: false,
  mq: '(min-width: 67.5rem)'
};

// open menu by default if large screen
fabricatorInMem.options.menu = window.matchMedia(fabricatorInMem.options.mq).matches;

/**
 * Feature detection
 * @type {Object}
 */
fabricatorInMem.test = {};

// test for sessionStorage
fabricatorInMem.test.sessionStorage = (() => {
  const test = '_f';
  try {
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
})();

// create storage object if it doesn't exist; store options
if (fabricatorInMem.test.sessionStorage) {
  sessionStorage.fabricatorInMem = sessionStorage.fabricatorInMem || JSON.stringify(fabricatorInMem.options);
}


/**
 * Cache DOM
 * @type {Object}
 */
fabricatorInMem.dom = {
  root: document.querySelector('html'),
  primaryMenu: document.querySelector('.f-menu'),
  menuItems: document.querySelectorAll('.f-menu li a'),
  menuToggle: document.querySelector('.f-menu-toggle')
};


/**
 * Get current option values from session storage
 * @return {Object}
 */
fabricatorInMem.getOptions = () => {
  return (fabricatorInMem.test.sessionStorage) ? JSON.parse(sessionStorage.fabricatorInMem) : fabricatorInMem.options;
};


/**
 * Build color chips
 */
fabricatorInMem.buildColorChips = () => {

  const chips = document.querySelectorAll('.f-color-chip');

  for (let i = chips.length - 1; i >= 0; i--) {
    const color = chips[i].querySelector('.f-color-chip__color').innerHTML;
    chips[i].style.borderTopColor = color;
    chips[i].style.borderBottomColor = color;
  }

  return fabricatorInMem;

};


/**
 * Add `f-active` class to active menu item
 */
fabricatorInMem.setActiveItem = () => {

  /**
   * Match the window location with the menu item, set menu item as active
   */
  const setActive = () => {

    // get current file and hash without first slash
    const loc = (window.location.pathname + window.location.hash);
    const locRegex = /(^\/)([^#]+)?(#[\w\-.]+)?$/ig;
    const current = loc.replace(locRegex, (match, slash, file, hash) => {
      return (file || '') + (hash || '').split('.')[0];
    }) || 'index.html';


    // find the current section in the items array
    for (let i = fabricatorInMem.dom.menuItems.length - 1; i >= 0; i--) {

      const item = fabricatorInMem.dom.menuItems[i];

      // get item href without first slash
      const href = item.getAttribute('href').replace(/^\//g, '');

      if (href === current) {
        item.classList.add('f-active');
      } else {
        item.classList.remove('f-active');
      }

    }

  };

  window.addEventListener('hashchange', setActive);

  setActive();

  return fabricatorInMem;

};


/**
 * Click handler to primary menu toggle
 * @return {Object} fabricatorInMem
 */
fabricatorInMem.menuToggle = () => {

  // shortcut menu DOM
  const toggle = fabricatorInMem.dom.menuToggle;
  const options = fabricatorInMem.getOptions();

  // toggle classes on certain elements
  const toggleClasses = () => {
    options.menu = !fabricatorInMem.dom.root.classList.contains('f-menu-active');
    fabricatorInMem.dom.root.classList.toggle('f-menu-active');

    if (fabricatorInMem.test.sessionStorage) {
      sessionStorage.setItem('fabricatorInMem', JSON.stringify(options));
    }
  };

  // toggle classes on ctrl + m press
  document.onkeydown = (e) => {
    if (e.ctrlKey && e.keyCode === 'M'.charCodeAt(0)) {
      toggleClasses();
    }
  };

  // toggle classes on click
  toggle.addEventListener('click', () => {
    toggleClasses();
  });

  // close menu when clicking on item (for collapsed menu view)
  const closeMenu = () => {
    if (!window.matchMedia(fabricatorInMem.options.mq).matches) {
      toggleClasses();
    }
  };

  for (let i = 0; i < fabricatorInMem.dom.menuItems.length; i++) {
    fabricatorInMem.dom.menuItems[i].addEventListener('click', closeMenu);
  }

  return fabricatorInMem;

};


/**
 * Handler for preview and code toggles
 * @return {Object} fabricatorInMem
 */
fabricatorInMem.allItemsToggles = () => {

  const itemCache = {
    labels: document.querySelectorAll('[data-f-toggle="labels"]'),
    notes: document.querySelectorAll('[data-f-toggle="notes"]'),
    code: document.querySelectorAll('[data-f-toggle="code"]')
  };

  const toggleAllControls = document.querySelectorAll('.f-controls [data-f-toggle-control]');
  const options = fabricatorInMem.getOptions();

  // toggle all
  const toggleAllItems = (type, value) => {

    const button = document.querySelector(`.f-controls [data-f-toggle-control=${type}]`);
    const items = itemCache[type];

    for (let i = 0; i < items.length; i++) {
      if (value) {
        items[i].classList.remove('f-item-hidden');
      } else {
        items[i].classList.add('f-item-hidden');
      }
    }

    // toggle styles
    if (value) {
      button.classList.add('f-active');
    } else {
      button.classList.remove('f-active');
    }

    // update options
    options.toggles[type] = value;

    if (fabricatorInMem.test.sessionStorage) {
      sessionStorage.setItem('fabricatorInMem', JSON.stringify(options));
    }

  };

  for (let i = 0; i < toggleAllControls.length; i++) {
    toggleAllControls[i].addEventListener('click', (e) => {

      // extract info from target node
      const type = e.currentTarget.getAttribute('data-f-toggle-control');
      const value = e.currentTarget.className.indexOf('f-active') < 0;

      // toggle the items
      toggleAllItems(type, value);
    });
  }

  // persist toggle options from page to page
  Object.keys(options.toggles).forEach((key) => {
    toggleAllItems(key, options.toggles[key]);
  });

  return fabricatorInMem;

};


/**
 * Handler for single item code toggling
 */
fabricatorInMem.singleItemToggle = () => {

  const itemToggleSingle = document.querySelectorAll('.f-item-group [data-f-toggle-control]');

  // toggle single
  const toggleSingleItemCode = (e) => {
    const group = e.currentTarget.parentNode.parentNode.parentNode;
    const type = e.currentTarget.getAttribute('data-f-toggle-control');
    group.querySelector(`[data-f-toggle=${type}]`).classList.toggle('f-item-hidden');
  };

  for (let i = 0; i < itemToggleSingle.length; i++) {
    itemToggleSingle[i].addEventListener('click', toggleSingleItemCode);
  }

  return fabricatorInMem;

};


/**
 * Automatically select code when code block is clicked
 */
fabricatorInMem.bindCodeAutoSelect = () => {

  const codeBlocks = document.querySelectorAll('.f-item-code');

  const select = (block) => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(block.querySelector('code'));
    selection.removeAllRanges();
    selection.addRange(range);
  };

  for (let i = codeBlocks.length - 1; i >= 0; i--) {
    codeBlocks[i].addEventListener('click', select.bind(this, codeBlocks[i]));
  }

};


/**
 * Open/Close menu based on session var.
 * Also attach a media query listener to close the menu when resizing to smaller screen.
 */
fabricatorInMem.setInitialMenuState = () => {

  // root element
  const root = document.querySelector('html');

  const mq = window.matchMedia(fabricatorInMem.options.mq);

  // if small screen
  const mediaChangeHandler = (list) => {
    if (!list.matches) {
      root.classList.remove('f-menu-active');
    } else if (fabricatorInMem.getOptions().menu) {
      root.classList.add('f-menu-active');
    } else {
      root.classList.remove('f-menu-active');
    }
  };

  mq.addListener(mediaChangeHandler);
  mediaChangeHandler(mq);

  return fabricatorInMem;

};


/**
 * Initialization
 */
fabricatorInMem
  .setInitialMenuState()
  .menuToggle()
  .allItemsToggles()
  .singleItemToggle()
  .buildColorChips()
  .setActiveItem()
  .bindCodeAutoSelect();

window.fabricator = fabricatorInMem;
