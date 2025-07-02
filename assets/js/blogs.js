/**
 * blogs.js - Manages blog data and metadata
 * WeCanCode.Live
 * 
 * Dynamic blog loading system: Instead of manually maintaining blog data,
 * this script will automatically discover blogs in the 'blogs/' directory
 * by reading meta.json files in each blog folder.
 */

// Empty array to store blog data fetched dynamically
let blogData = [];

/**
 * Initializes the blog system by loading all blog data
 * Returns a Promise that resolves when all blogs are loaded
 */
async function initializeBlogSystem() {
    try {
        // Get the list of blog directories
        const blogDirectories = await fetchBlogDirectories();
        
        // Load metadata for each blog
        const blogsPromises = blogDirectories.map(dir => loadBlogMetadata(dir));
        blogData = await Promise.all(blogsPromises);
        
        // Sort blogs by date (newest first)
        blogData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        console.log(`Successfully loaded ${blogData.length} blogs`);
        return blogData;
    } catch (error) {
        console.error('Failed to initialize blog system:', error);
        
        // Fallback to empty array if loading fails
        blogData = [];
        return blogData;
    }
}

/**
 * Fetches the list of directories in the blogs folder
 * Each directory represents a blog post
 */
async function fetchBlogDirectories() {
    try {
        // Make a request to the PHP API to get blog directories
        const response = await fetch('api.php?endpoint=blog-directories');
        
        if (!response.ok) {
            throw new Error('Failed to fetch blog directories from API');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching blog directories:', error);
        // Return a fallback directory list if the API fails
        return ['getting-started-with-react', 'javascript-async'];
    }
}

/**
 * Loads metadata for a single blog from its directory
 * @param {string} dirName - Directory name (blog ID)
 */
async function loadBlogMetadata(dirName) {
    try {
        // Make a request to the PHP API to get blog metadata
        const response = await fetch(`api.php?endpoint=blog-metadata&id=${encodeURIComponent(dirName)}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load metadata for blog: ${dirName}`);
        }
        
        // Parse the JSON metadata
        // The PHP API already adds the id, folderPath, and image properties
        const blogData = await response.json();
        
        return blogData;
    } catch (error) {
        console.error(`Error loading blog metadata for ${dirName}:`, error);
        
        // Return a minimal placeholder entry if metadata loading fails
        return {
            id: dirName,
            title: `Blog: ${dirName}`,
            date: new Date().toISOString().split('T')[0],
            category: 'Uncategorized',
            excerpt: 'Blog content unavailable.',
            image: 'assets/images/placeholder.png',
            folderPath: `blogs/${dirName}/`
        };
    }
}

// Function to get all blog data
function getAllBlogs() {
    return blogData;
}

// Function to get blog by ID
function getBlogById(id) {
    return blogData.find(blog => blog.id === id);
}

// Function to get blogs by category
function getBlogsByCategory(category) {
    return blogData.filter(blog => blog.category === category);
}

// Function to get all unique categories
function getAllCategories() {
    const categories = blogData.map(blog => blog.category);
    return [...new Set(categories)];
}

// Function to get blogs by date range
function getBlogsByDateRange(startDate, endDate) {
    return blogData.filter(blog => {
        const blogDate = new Date(blog.date);
        return blogDate >= new Date(startDate) && blogDate <= new Date(endDate);
    });
}

// Function to get recent blogs
function getRecentBlogs(count = 5) {
    return [...blogData]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, count);
}

// Function to search blogs
function searchBlogs(query) {
    query = query.toLowerCase();
    return blogData.filter(blog => 
        blog.title.toLowerCase().includes(query) || 
        blog.excerpt.toLowerCase().includes(query) ||
        blog.category.toLowerCase().includes(query)
    );
}

// Function to get archive months
function getArchiveMonths() {
    const archives = {};
    
    blogData.forEach(blog => {
        const date = new Date(blog.date);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'long' });
        
        if (!archives[year]) {
            archives[year] = [];
        }
        
        if (!archives[year].includes(month)) {
            archives[year].push(month);
        }
    });
    
    return archives;
}

// Function to get blogs by year and month
function getBlogsByYearMonth(year, month) {
    return blogData.filter(blog => {
        const date = new Date(blog.date);
        return date.getFullYear() === year && 
               date.toLocaleString('default', { month: 'long' }) === month;
    });
}

// Export functions
window.BlogAPI = {
    initializeBlogSystem,
    getAllBlogs,
    getBlogById,
    getBlogsByCategory,
    getAllCategories,
    getBlogsByDateRange,
    getRecentBlogs,
    searchBlogs,
    getArchiveMonths,
    getBlogsByYearMonth
};

// Initialize the blog system on script load
initializeBlogSystem();
