<?php
/**
 * api.php - Simple API for the WeCanCode.Live blog system
 * 
 * This file provides endpoints to dynamically discover blogs and their metadata
 * It's designed to be used with Hostinger's hPanel which supports PHP
 */

// Set headers for JSON response
header('Content-Type: application/json');
header('Cache-Control: max-age=300'); // Cache for 5 minutes

// Get the requested endpoint from the query string
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

// Process the requested endpoint
switch ($endpoint) {
    case 'blog-directories':
        // Return a list of all blog directories
        getBlogDirectories();
        break;
        
    case 'blog-metadata':
        // Return metadata for a specific blog
        $blogId = isset($_GET['id']) ? $_GET['id'] : '';
        getBlogMetadata($blogId);
        break;
        
    default:
        // Return an error for invalid endpoints
        sendError('Invalid endpoint', 404);
        break;
}

/**
 * Get all blog directories from the blogs/ folder
 */
function getBlogDirectories() {
    try {
        $blogsDir = __DIR__ . '/blogs/';
        
        // Check if the blogs directory exists
        if (!is_dir($blogsDir)) {
            sendError('Blogs directory not found', 500);
            return;
        }
        
        // Get all directories within the blogs/ folder
        $dirs = array_filter(scandir($blogsDir), function($item) use ($blogsDir) {
            return is_dir($blogsDir . $item) && $item !== '.' && $item !== '..';
        });
        
        // Send the list of directories as JSON
        echo json_encode(array_values($dirs));
    } catch (Exception $e) {
        sendError('Failed to scan blogs directory: ' . $e->getMessage(), 500);
    }
}

/**
 * Get metadata for a specific blog
 * 
 * @param string $blogId The directory name of the blog
 */
function getBlogMetadata($blogId) {
    if (empty($blogId)) {
        sendError('Blog ID is required', 400);
        return;
    }
    
    try {
        $metaPath = __DIR__ . '/blogs/' . $blogId . '/meta.json';
        
        // Check if the metadata file exists
        if (!file_exists($metaPath)) {
            sendError('Blog metadata not found', 404);
            return;
        }
        
        // Read the metadata file
        $metaContent = file_get_contents($metaPath);
        
        // Parse the JSON
        $metadata = json_decode($metaContent, true);
        
        // Add additional derived properties
        $metadata['id'] = $blogId;
        $metadata['folderPath'] = 'blogs/' . $blogId . '/';
        $metadata['image'] = isset($metadata['coverImage']) 
            ? 'blogs/' . $blogId . '/' . $metadata['coverImage']
            : 'assets/images/placeholder.png';
        
        // Send the metadata as JSON
        echo json_encode($metadata);
    } catch (Exception $e) {
        sendError('Failed to read blog metadata: ' . $e->getMessage(), 500);
    }
}

/**
 * Send an error response
 * 
 * @param string $message Error message
 * @param int $code HTTP status code
 */
function sendError($message, $code) {
    http_response_code($code);
    echo json_encode([
        'error' => true,
        'message' => $message
    ]);
}
?>
