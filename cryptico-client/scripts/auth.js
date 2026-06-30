// Create a reusable API helper function
// url → endpoint you want to call
// options → extra fetch settings (method, body, headers etc.)
const API = async (url, options = {}) => {

  // Get saved JWT token from browser storage
  const token = localStorage.getItem('token');

  // Build final fetch configuration object
  const config = {

    // Headers sent with every request
    headers: {
      // Tell backend we are sending JSON data
      'Content-Type': 'application/json',

      /*
        If token exists, add Authorization header.

        token && {...}
        → means:
          IF token exists → return object
          IF token does not exist → return false

        ... spreads (merges) the object into headers.
      */
      ...(token && { Authorization: `Bearer ${token}` }),

      /*
        Allow custom headers passed when calling API()
        Example:
          API('/upload`, { headers: {...} })
      */
      ...options.headers
    },

    /*
      Spread remaining options into config

      Example options:
        method
        body
        credentials
        mode
    */
    ...options
  };

  try {
    // Send request using fetch
    const res = await fetch(url, config);

    // Convert server response from JSON → JavaScript object
    const data = await res.json();

    /*
      Auto logout protection

      401 → Unauthorized
      403 → Forbidden

      Meaning:
        token expired
        invalid login
        user not allowed
    */
    if (res.status === 401 || res.status === 403) {
      localStorage.clear(); // remove saved user session
      window.location.href = '/pages/login.html'; // redirect to login
      return;
    }

    // Return both response and parsed data
    return { res, data };

  } catch (err) {
    // Catch network errors (server down, no internet, wrong URL)
    console.error('API Error:', err);
    throw err;
  }
};

// Export helper so other JS files can use it
export default API;