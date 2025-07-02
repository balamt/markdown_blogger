/**
 * blogs-manifest.js - A static solution for blog discovery
 * 
 * Since we cannot use npm or Node.js on Hostinger hPanel, this file serves
 * as a static manifest of available blogs. Instead of dynamically scanning
 * directories on the server, we will maintain this manifest file manually
 * whenever we add a new blog.
 * 
 * Instructions:
 * 1. After creating a new blog folder under /blogs/
 * 2. Add the folder name to the blogDirectories array below
 * 3. Upload this file along with your new blog content
 */

// This array serves as our "directory listing"
const blogDirectories = [
  "getting-started-with-react",
  "javascript-async",
  "jwt-token-expiry"
  // Add new blog folder names here when you create them
];

// Expose the blog directories as a global variable
window.BlogManifest = {
  getBlogDirectories: function() {
    // Return a promise to maintain compatibility with the original API
    return Promise.resolve(blogDirectories);
  }
};
