function componentFromOutlet(outlet) {
  try {
    const name = outlet.getAttribute('component');
    if (name) {
      return document.createElement(name);
    }
  } catch (err) {
    return '';
  }
}

export const router = {
  /**
   *
   * @param {PopStateEvent} [event]
   */
  handleChange(event) {
    event ? event.preventDefault() : void 0;
    const { pathname } = window.location;
    // take all outlets from the DOM
    const outlets = Array.from(document.querySelectorAll('router-outlet'));
    // take the target outlet
    const targetOutlet = outlets.find(
      (outlet) => outlet.getAttribute('path') === pathname
    );

    // iterate and either turn on or off
    outlets.forEach(outlet => {
      if (outlet !== targetOutlet) {
        // clear, it's not the target
        outlet.innerHTML = '';
      } else {
        if (outlet.childElementCount === 0) {
          outlet.append(componentFromOutlet(outlet));
        }
      }
    });

    // in case we did not find a match, let's try 404 page
    if (!targetOutlet) {
      const errorOutlet = document.querySelector('router-outlet[path="*"]');
      if (errorOutlet && errorOutlet.childElementCount === 0) {
        errorOutlet.append(componentFromOutlet(errorOutlet));
      }
    }
  },

  init() {
    window.addEventListener('popstate', this.handleChange);
    this.handleChange();
  },


  navigate(to) {
    if (to !== window.location.pathname) {
      window.history.pushState(null, null, to);
      this.handleChange();
    }
  }
};
