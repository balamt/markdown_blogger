/**
 * main.js - Main JavaScript file for WeCanCode.Live
 * Handles UI interactions and rendering
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Show loading state
    showLoadingState();

    try {
        // Initialize the blog system and load blog data
        await window.BlogAPI.initializeBlogSystem();
        
        // Initialize the blog UI
        initializeBlog();
        
        // Setup event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize blog:', error);
        showErrorState();
    }
});

/**
 * Initialize the blog with content
 */
function initializeBlog() {
    // Check if we're on the index page or a blog post page
    const urlParams = new URLSearchParams(window.location.search);
    const blogId = urlParams.get('blog');
    
    if (blogId) {
        // We're on a blog post page
        renderBlogPost(blogId);
    } else {
        // We're on the main page
        renderBlogCards();
        renderSidebar();
        renderNavigation();
    }
}

/**
 * Setup event listeners for various UI interactions
 */
function setupEventListeners() {
    // Search functionality
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            performSearch(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value);
            }
        });
    }
}

/**
 * Render all blog cards on the main page
 */
function renderBlogCards(blogsToRender = null) {
    const blogsList = document.getElementById('blogsList');
    if (!blogsList) return;
    
    // Clear the blogs list
    blogsList.innerHTML = '';
    
    // Get blogs to render
    const blogs = blogsToRender || window.BlogAPI.getAllBlogs();
    
    // If no blogs found
    if (blogs.length === 0) {
        blogsList.innerHTML = `
            <div class="col-12 text-center py-5">
                <h3 class="text-muted">No blogs found</h3>
            </div>
        `;
        return;
    }
    
    // Get the template
    const template = document.getElementById('blogCardTemplate');
    
    // Clone and populate the template for each blog
    blogs.forEach((blog, index) => {
        const clone = document.importNode(template.content, true);
        
        // Set delay for animation
        const blogCard = clone.querySelector('.blog-card');
        blogCard.style.animationDelay = `${index * 0.1}s`;
        
        // Set data attributes
        blogCard.dataset.categories = blog.category;
        blogCard.dataset.date = blog.date;
        
        // Set content
        const img = clone.querySelector('.blog-image');
        img.src = blog.image;
        img.alt = blog.title;
        
        const date = clone.querySelector('.blog-date');
        date.textContent = formatDate(blog.date);
        
        const category = clone.querySelector('.blog-category');
        category.textContent = blog.category;
        
        const title = clone.querySelector('.blog-title');
        title.textContent = blog.title;
        
        const excerpt = clone.querySelector('.blog-excerpt');
        excerpt.textContent = blog.excerpt;
        
        const readMore = clone.querySelector('.read-more');
        readMore.href = `index.html?blog=${blog.id}`;
        
        // Append to the blogs list
        blogsList.appendChild(clone);
    });
}

/**
 * Render a single blog post
 */
async function renderBlogPost(blogId) {
    const blog = window.BlogAPI.getBlogById(blogId);
    if (!blog) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update page title
    document.title = `${blog.title} - WeCanCode.Live`;
    
    // Replace main content with blog post template
    const main = document.querySelector('main .container');
    if (!main) return;
    
    main.innerHTML = `
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.html" class="text-danger">Home</a></li>
                        <li class="breadcrumb-item active" aria-current="page">${blog.title}</li>
                    </ol>
                </nav>
                
                <article class="bg-dark p-4 rounded-3 mb-4">
                    <img src="${blog.image}" alt="${blog.title}" class="blog-header-image w-100 rounded-3 mb-4">
                    <h1 class="blog-title mb-3">${blog.title}</h1>
                    
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div class="blog-meta">
                            <span class="text-danger"><i class="far fa-calendar-alt me-1"></i> ${formatDate(blog.date)}</span>
                        </div>
                        <span class="badge bg-danger fs-6">${blog.category}</span>
                    </div>
                    
                    <div class="blog-content" id="blogContent">
                        <div class="text-center p-5">
                            <div class="spinner-border text-danger" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </article>
                
                <div class="d-flex justify-content-between mt-4 mb-5">
                    <a href="index.html" class="btn btn-outline-danger"><i class="fas fa-arrow-left me-2"></i>Back to Blogs</a>
                    <a href="#" class="btn btn-outline-light" onclick="window.scrollTo({top: 0, behavior: 'smooth'}); return false;">
                        <i class="fas fa-arrow-up me-2"></i>Back to Top
                    </a>
                </div>
            </div>
        </div>
    `;
    
    // Load and render markdown content
    try {
        const response = await fetch(`${blog.folderPath}content.md`);
        if (!response.ok) throw new Error('Failed to load blog content');
        
        const markdown = await response.text();
        const blogContent = document.getElementById('blogContent');
        
        if (blogContent) {
            // Configure marked to add line-numbers class to pre elements
            marked.setOptions({
                highlight: function(code, lang) {
                    return code;
                },
                langPrefix: 'language-'
            });
            
            // Parse markdown and sanitize HTML
            const htmlContent = DOMPurify.sanitize(marked.parse(markdown));
            blogContent.innerHTML = htmlContent;
            
            // Add line-numbers class to all pre elements
            document.querySelectorAll('pre').forEach((block) => {
                block.classList.add('line-numbers');
            });
            
            // Activate Prism.js highlighting
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
            
            // Add copy buttons to code blocks
            if (typeof addCopyButtons === 'function') {
                addCopyButtons();
            } else {
                // Fallback if the code-blocks.js isn't loaded yet
                setTimeout(() => {
                    if (typeof addCopyButtons === 'function') {
                        addCopyButtons();
                    }
                }, 500);
            }
        }
    } catch (error) {
        console.error('Error loading blog content:', error);
        const blogContent = document.getElementById('blogContent');
        if (blogContent) {
            blogContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load blog content. Please try again later.
                </div>
            `;
        }
    }
}

/**
 * Render the sidebar with recent posts and categories
 */
function renderSidebar() {
    renderRecentPosts();
    renderPopularCategories();
}

/**
 * Render recent posts in the sidebar
 */
function renderRecentPosts() {
    const recentPostsElement = document.getElementById('recentPosts');
    if (!recentPostsElement) return;
    
    const recentPosts = window.BlogAPI.getRecentBlogs(5);
    
    recentPostsElement.innerHTML = recentPosts.map(post => `
        <li class="mb-2">
            <a href="index.html?blog=${post.id}" class="text-white text-decoration-none">
                <div class="d-flex align-items-center">
                    <img src="${post.image}" alt="${post.title}" class="me-2 rounded" width="50" height="50" style="object-fit: cover;">
                    <div>
                        <h6 class="mb-0">${post.title}</h6>
                        <small class="text-danger">${formatDate(post.date)}</small>
                    </div>
                </div>
            </a>
        </li>
    `).join('');
}

/**
 * Render popular categories in the sidebar
 */
function renderPopularCategories() {
    const popularCategoriesElement = document.getElementById('popularCategories');
    if (!popularCategoriesElement) return;
    
    const categories = window.BlogAPI.getAllCategories();
    
    popularCategoriesElement.innerHTML = categories.map(category => `
        <a href="#" class="badge bg-danger text-decoration-none p-2 category-badge" 
           onclick="filterByCategory('${category}'); return false;">
            ${category}
        </a>
    `).join('');
}

/**
 * Render navigation elements (categories and archive)
 */
function renderNavigation() {
    renderCategoryDropdown();
    renderArchiveDropdown();
}

/**
 * Render category dropdown
 */
function renderCategoryDropdown() {
    const categoryDropdown = document.getElementById('categoryDropdown');
    if (!categoryDropdown) return;
    
    const categories = window.BlogAPI.getAllCategories();
    
    categoryDropdown.innerHTML = categories.map(category => `
        <li><a class="dropdown-item" href="#" onclick="filterByCategory('${category}'); return false;">${category}</a></li>
    `).join('');
}

/**
 * Render archive dropdown
 */
function renderArchiveDropdown() {
    const archiveDropdown = document.getElementById('archiveDropdown');
    if (!archiveDropdown) return;
    
    const archives = window.BlogAPI.getArchiveMonths();
    
    let archiveHtml = '';
    
    for (const year in archives) {
        archives[year].forEach(month => {
            archiveHtml += `
                <li><a class="dropdown-item" href="#" 
                   onclick="filterByYearMonth(${year}, '${month}'); return false;">
                   ${month} ${year}
                </a></li>
            `;
        });
    }
    
    archiveDropdown.innerHTML = archiveHtml;
}

/**
 * Filter blogs by category
 */
function filterByCategory(category) {
    const blogs = window.BlogAPI.getBlogsByCategory(category);
    renderBlogCards(blogs);
    
    // Update page title
    document.title = `${category} - WeCanCode.Live`;
}

/**
 * Filter blogs by year and month
 */
function filterByYearMonth(year, month) {
    const blogs = window.BlogAPI.getBlogsByYearMonth(year, month);
    renderBlogCards(blogs);
    
    // Update page title
    document.title = `${month} ${year} - WeCanCode.Live`;
}

/**
 * Perform search based on query
 */
function performSearch(query) {
    if (!query.trim()) {
        renderBlogCards();
        return;
    }
    
    const searchResults = window.BlogAPI.searchBlogs(query);
    renderBlogCards(searchResults);
    
    // Update page title
    document.title = `Search: ${query} - WeCanCode.Live`;
}

/**
 * Format a date string to a readable format
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Display loading state while blog data is being fetched
 */
function showLoadingState() {
    const blogsList = document.getElementById('blogsList');
    if (blogsList) {
        blogsList.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-danger" role="status">
                    <span class="visually-hidden">Loading blogs...</span>
                </div>
                <p class="mt-3 text-white">Loading blog content...</p>
            </div>
        `;
    }
}

/**
 * Display error state if blog loading fails
 */
function showErrorState() {
    const blogsList = document.getElementById('blogsList');
    if (blogsList) {
        blogsList.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load blog content. Please try refreshing the page.
                </div>
            </div>
        `;
    }
}

// Make filter functions globally accessible for onclick events
window.filterByCategory = filterByCategory;
window.filterByYearMonth = filterByYearMonth;
