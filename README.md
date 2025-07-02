# WeCanCode.Live

## Description

WeCanCode.Live is a responsive web application built with HTML, Bootstrap, and JavaScript. The platform hosts microblogs organized in individual subfolders, each containing markdown files and related images. The application features a black and red theme and is designed with mobile-first principles.

## Features

- Responsive design optimized for mobile and desktop
- Blog listing with card-based layout
- Individual blog post viewing with markdown rendering
- Search functionality for finding blogs quickly
- Category and date-based filtering
- Recent posts sidebar
- Popular categories sidebar
- Secure blog creation tool with password protection

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- PHP 8.2+ (for backend APIs and blog creation)
- Marked.js (Markdown parser)
- DOMPurify (HTML sanitizer)

## Backend API

The backend of WeCanCode.Live is built with PHP and provides two key endpoints:

### 1. Blog Directory Discovery

**Endpoint:** `api.php?endpoint=blog-directories`

This endpoint scans the `blogs/` directory and returns a list of all blog folders. The frontend uses this to dynamically discover available blogs without requiring manual updates to any configuration files.

### 2. Blog Metadata Retrieval

**Endpoint:** `api.php?endpoint=blog-metadata&id=BLOG_ID`

This endpoint reads the `meta.json` file for a specific blog and returns its metadata. It also adds derived properties like `id`, `folderPath`, and `image` paths.

## Security Features

The blog creation tool (`create-blog.php`) includes the following security measures:

1. **Password Protection**: Access to the creation form requires authentication with admin credentials.
2. **Session Management**: User authentication state is maintained using PHP sessions.
3. **Visual Accessibility**: Form controls have high contrast with white text on dark backgrounds.
4. **Logout Functionality**: Authenticated users can log out when finished.

Default credentials are:

- Username: `admin`
- Password: `password!`

**Important**: For production use, it's recommended to:

1. Change the default credentials to something secure
2. Consider additional security measures like IP restrictions or .htaccess protection
3. Use HTTPS to protect the login process

## Project Structure

```text
wecancode_live_blog/
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── blogs.js
│   │   └── main.js
│   └── images/
│       └── placeholder.jpg
├── blogs/
│   ├── getting-started-with-react/
│   │   ├── content.md
│   │   ├── meta.json
│   │   └── cover.png
│   └── javascript-async/
│       ├── content.md
│       ├── meta.json
│       └── cover.png
├── api.php
├── create-blog.php
└── index.html
```

## How to Add a New Blog

### Method 1: Using the Create Blog Tool (Recommended)

1. Navigate to `create-blog.php` in your browser
2. Log in with your admin credentials
3. Fill out the form with your blog details:
   - Blog ID (URL-friendly name)
   - Blog Title
   - Publication Date
   - Category
   - Tags (comma-separated)
   - Short Description
   - Author
   - Blog Content (in Markdown format)
4. Click "Create Blog" to generate the blog structure
5. If needed, manually replace the placeholder `cover.png` with your custom cover image

### Method 2: Manual Creation

1. Create a new folder under `blogs/` with a URL-friendly name (e.g., `my-new-blog`)
2. Create a `meta.json` file in the folder with the following structure:

```json
{
  "title": "Your Blog Title",
  "date": "YYYY-MM-DD",
  "category": "Your Category",
  "tags": ["tag1", "tag2"],
  "description": "A brief description of your blog post",
  "author": "Your Name"
}
```

3. Create a `content.md` file with your blog content in Markdown format
4. Add a `cover.png` image to the folder for the blog's featured image
5. Access the blog through the main website interface

## Blog Format

Each blog should be written in Markdown format with the following structure:

- Title (H1)
- Introduction
- Content sections (using H2, H3, etc.)
- Conclusion
- Additional Resources (optional)

