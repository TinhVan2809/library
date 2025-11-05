<?php

// This script acts as a safe proxy to serve images.
// It prevents direct access to the uploads folder and ensures correct headers are sent.

// Allow requests from your React app's origin
header("Access-Control-Allow-Origin: *"); // For development. In production, use 'http://your-react-app-domain.com'

if (isset($_GET['path'])) {
    // Basic security: prevent directory traversal attacks
    $requested_path = $_GET['path'];
    if (strpos($requested_path, '..') !== false) {
        http_response_code(400);
        echo "Invalid path";
        exit;
    }

    // Construct the full, absolute path to the image on the server
    // __DIR__ is the directory of the current script (actions)
    // We go up two levels to the 'Library' directory
    $base_path = realpath(__DIR__ . '/../../');
    $full_path = $base_path . '/' . ltrim($requested_path, '/');

    if (file_exists($full_path) && is_readable($full_path)) {
        // Get the file's MIME type to set the correct Content-Type header
        $mime_type = mime_content_type($full_path);

        // Security: Only serve allowed image types
        $allowed_mimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jfif'];
        if (in_array($mime_type, $allowed_mimes)) {
            header('Content-Type: ' . $mime_type);
            header('Content-Length: ' . filesize($full_path));
            readfile($full_path);
            exit;
        }
    }
}

// If the file is not found or not allowed, return a 404 error
http_response_code(404);
echo "Image not found.";
exit;