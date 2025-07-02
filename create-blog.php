<?php
/**
 * create-blog.php - Tool to create a new blog post
 * 
 * This script provides a simple form to create a new blog post
 * It handles creating the directory structure and files needed
 * 
 * IMPORTANT: For security, this page is password-protected to prevent unauthorized access
 */

// Set your username and password here - CHANGE THESE VALUES!
$validUsername = 'admin';  // Change this to your preferred username
$validPassword = 'password!';  // Change this to a strong password

// Start session
session_start();

// Handle login
$loginError = '';

// Check if form was submitted
if (isset($_POST['login'])) {
    if ($_POST['username'] === $validUsername && $_POST['password'] === $validPassword) {
        $_SESSION['authenticated'] = true;
    } else {
        $loginError = 'Invalid username or password';
    }
}

// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

// Function to create a blog post
function createBlog($data) {
    try {
        // Validate inputs
        if (empty($data['id']) || empty($data['title']) || empty($data['date']) || 
            empty($data['category']) || empty($data['excerpt'])) {
            return [
                'success' => false,
                'message' => 'All fields are required'
            ];
        }
        
        // Create folder name (URL-friendly)
        $blogId = preg_replace('/[^a-z0-9-]/', '-', strtolower($data['id']));
        $blogDir = __DIR__ . '/blogs/' . $blogId;
        
        // Check if blog already exists
        if (is_dir($blogDir)) {
            return [
                'success' => false,
                'message' => "Blog with ID '$blogId' already exists"
            ];
        }
        
        // Check if blogs directory exists, if not create it
        $blogsDir = __DIR__ . '/blogs';
        if (!is_dir($blogsDir)) {
            if (!mkdir($blogsDir, 0755, true)) {
                return [
                    'success' => false,
                    'message' => 'Failed to create blogs directory'
                ];
            }
        }
        
        // Create blog directory with proper permissions
        if (!mkdir($blogDir, 0755, true)) {
            return [
                'success' => false,
                'message' => 'Failed to create blog directory. Check folder permissions.'
            ];
        }
        
        // Create meta.json
        $meta = [
            'title' => $data['title'],
            'date' => $data['date'],
            'category' => $data['category'],
            'excerpt' => $data['excerpt'],
            'coverImage' => 'cover.png',
            'author' => $_POST['author'] ?? 'Admin',
            'tags' => isset($_POST['tags']) ? explode(',', $_POST['tags']) : []
        ];
        
        $metaJson = json_encode($meta, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        if (!file_put_contents($blogDir . '/meta.json', $metaJson)) {
            return [
                'success' => false,
                'message' => 'Failed to create meta.json file'
            ];
        }
        
        // Create content.md with user-provided content or default content
        $content = isset($_POST['content']) && !empty($_POST['content']) 
            ? $_POST['content'] 
            : "# {$data['title']}\n\nYour content goes here...\n";
            
        if (!file_put_contents($blogDir . '/content.md', $content)) {
            return [
                'success' => false,
                'message' => 'Failed to create content.md file'
            ];
        }
        
        // Handle cover image upload
        if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] == 0) {
            $allowed = ['jpg', 'jpeg', 'png', 'gif'];
            $filename = $_FILES['cover_image']['name'];
            $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
            
            if (in_array($ext, $allowed)) {
                // Move uploaded file
                if (move_uploaded_file($_FILES['cover_image']['tmp_name'], $blogDir . '/cover.png')) {
                    // Image uploaded successfully
                } else {
                    // Failed to move uploaded file, use placeholder
                    $placeholderImage = __DIR__ . '/assets/images/placeholder.png';
                    if (file_exists($placeholderImage)) {
                        copy($placeholderImage, $blogDir . '/cover.png');
                    }
                }
            } else {
                // Invalid file type, use placeholder
                $placeholderImage = __DIR__ . '/assets/images/placeholder.png';
                if (file_exists($placeholderImage)) {
                    copy($placeholderImage, $blogDir . '/cover.png');
                }
            }
        } else {
            // No file uploaded or error occurred, use placeholder
            $placeholderImage = __DIR__ . '/assets/images/placeholder.png';
            if (file_exists($placeholderImage)) {
                copy($placeholderImage, $blogDir . '/cover.png');
            } else {
                // Create an empty file if placeholder doesn't exist
                file_put_contents($blogDir . '/cover.png', '/* Placeholder for cover image */');
            }
        }
        
        return [
            'success' => true,
            'message' => "Blog '$blogId' created successfully",
            'blogId' => $blogId
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ];
    }
}

// Process form submission
$message = '';
$messageClass = '';
$debug = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['create-blog'])) {
    // Check if blogs directory is writable
    $blogsDir = __DIR__ . '/blogs';
    $debug['blogs_dir_exists'] = is_dir($blogsDir) ? 'Yes' : 'No';
    $debug['blogs_dir_writable'] = is_writable($blogsDir) ? 'Yes' : 'No';
    
    $result = createBlog([
        'id' => $_POST['id'] ?? '',
        'title' => $_POST['title'] ?? '',
        'date' => $_POST['date'] ?? '',
        'category' => $_POST['category'] ?? '',
        'excerpt' => $_POST['description'] ?? '' // Using description as excerpt
    ]);
    
    $message = $result['message'];
    if (!empty($debug)) {
        $message .= '<br><small>Debug info: ';
        foreach ($debug as $key => $value) {
            $message .= "$key: $value; ";
        }
        $message .= '</small>';
    }
    $messageClass = $result['success'] ? 'alert-success' : 'alert-danger';
}

// Get today's date in YYYY-MM-DD format for the date input default
$today = date('Y-m-d');

// Check if user is logged in
$isLoggedIn = isset($_SESSION['authenticated']) && $_SESSION['authenticated'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Blog - WeCanCode.Live</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="assets/css/style.css">
    <style>
        /* Custom styles for better form visibility */
        .form-control:focus {
            border-color: #dc3545;
            box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
        }
        
        .form-control::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }
    </style>
</head>
<body class="bg-dark text-white">
    <div class="container py-5">
        <h1 class="mb-4 text-danger">WeCanCode.Live - Create New Blog</h1>
        
        <?php if (!$isLoggedIn): ?>
            <!-- Login Form -->
            <div class="row">
                <div class="col-md-6">
                    <div class="card bg-dark border-danger">
                        <div class="card-body">
                            <h2 class="card-title text-light">Admin Login</h2>
                            
                            <?php if (isset($loginError)): ?>
                                <div class="alert alert-danger"><?php echo $loginError; ?></div>
                            <?php endif; ?>
                            
                            <form method="post" action="">
                                <div class="mb-3">
                                    <label for="username" class="form-label text-light fw-bold">Username</label>
                                    <input type="text" class="form-control bg-secondary bg-opacity-25 text-white" id="username" name="username" required>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="password" class="form-label text-light fw-bold">Password</label>
                                    <input type="password" class="form-control bg-secondary bg-opacity-25 text-white" id="password" name="password" required>
                                </div>
                                
                                <button type="submit" class="btn btn-danger" name="login">
                                    <i class="fas fa-sign-in-alt"></i> Login
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        <?php else: ?>
            <!-- Blog Creation Form -->
            <div class="mb-4">
                <a href="index.html" class="btn btn-outline-light me-2">
                    <i class="fas fa-home"></i> Back to Home
                </a>
                <a href="?logout=1" class="btn btn-outline-danger">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </div>
            
            <?php if (!empty($message)): ?>
                <div class="alert <?php echo $messageClass; ?>"><?php echo $message; ?></div>
            <?php endif; ?>
            
            <div class="card bg-dark border-danger">
                <div class="card-body">
                    <h2 class="card-title text-light">Create New Blog</h2>
                    <?php if (!empty($message)): ?>
                        <div class="alert <?php echo $messageClass; ?>"><?php echo $message; ?></div>
                    <?php endif; ?>
                    <form method="post" action="" enctype="multipart/form-data">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="id" class="form-label text-light fw-bold">Blog ID (URL-friendly)</label>
                                <input type="text" class="form-control bg-secondary bg-opacity-25 text-white" id="id" name="id" placeholder="e.g., my-new-blog-post" required>
                                <small class="text-light opacity-75">Use only lowercase letters, numbers, and hyphens</small>
                            </div>
                            
                            <div class="mb-3">
                                <label for="title" class="form-label text-light fw-bold">Blog Title</label>
                                <input type="text" class="form-control bg-secondary bg-opacity-25 text-white" id="title" name="title" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="date" class="form-label text-light fw-bold">Publication Date</label>
                                <input type="date" class="form-control bg-secondary bg-opacity-25 text-white" id="date" name="date" value="<?php echo $today; ?>" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="category" class="form-label text-light fw-bold">Category</label>
                                <input type="text" class="form-control bg-secondary bg-opacity-25 text-white" id="category" name="category" placeholder="e.g., JavaScript, PHP, HTML" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="tags" class="form-label text-light fw-bold">Tags (comma separated)</label>
                                <input type="text" class="form-control bg-secondary bg-opacity-25 text-white" id="tags" name="tags" placeholder="e.g., tutorial, beginner, code" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="description" class="form-label text-light fw-bold">Short Description</label>
                                <textarea class="form-control bg-secondary bg-opacity-25 text-white" id="description" name="description" rows="2" required></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label for="author" class="form-label text-light fw-bold">Author</label>
                                <input type="text" class="form-control bg-secondary bg-opacity-25 text-white" id="author" name="author" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="cover_image" class="form-label text-light fw-bold">Cover Image</label>
                                <input type="file" class="form-control bg-secondary bg-opacity-25 text-white" id="cover_image" name="cover_image" accept="image/jpeg,image/png,image/gif">
                                <small class="text-light opacity-75">Optional. If not provided, a placeholder will be used.</small>
                            </div>
                            
                            <div class="mb-3">
                                <label for="content" class="form-label text-light fw-bold">Blog Content (Markdown)</label>
                                <textarea class="form-control bg-secondary bg-opacity-25 text-white" id="content" name="content" rows="15" required placeholder="# Your Blog Title
                                          
Write your blog content using Markdown here..."></textarea>
                            </div>
                            
                            <div class="text-end">
                                <button type="submit" class="btn btn-danger" name="create-blog">
                                    <i class="fas fa-plus-circle"></i> Create Blog
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
</body>
</html>
