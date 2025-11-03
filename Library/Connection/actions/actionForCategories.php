<?php
// Ensure session only started when needed
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Consolidated headers and CORS
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization');

// Quick response for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../class/classForCategories.php';

// Helpers
function sendJson($payload, int $status = 200) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function respond($isAjax, $success, $message, $redirectUrl = '../../Manager/admin.html?page=categories', $status = 200) {
    if ($isAjax) {
        sendJson(['success' => $success, 'message' => $message], $status);
    } else {
        // set session messages for non-AJAX flows
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if ($success) {
            $_SESSION['success_message'] = $message;
        } else {
            $_SESSION['error_message'] = $message;
        }
        header("Location: {$redirectUrl}");
        exit;
    }
}

// Determine action (allow GET or POST)
$action = $_POST['action'] ?? $_GET['action'] ?? null;
$action = is_string($action) ? trim($action) : null;

$category = new Catagories(); // keep existing class name

switch ($action) {

    case 'getCategory':
        // return categories as JSON (used by frontend)
        $data = $category->getCategories();
        sendJson(['success' => true, 'data' => $data]);
        break;

    case 'add_categories':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Invalid request method.'], 405);
        }

        $isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
                 strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

        $categoryName = trim(filter_input(INPUT_POST, 'CategoryName', FILTER_SANITIZE_FULL_SPECIAL_CHARS) ?? '');
        $description  = trim(filter_input(INPUT_POST, 'Description', FILTER_SANITIZE_FULL_SPECIAL_CHARS) ?? '');

        if ($categoryName === '') {
            respond($isAjax, false, 'CategoryName is required.', null, 400);
        }

        $added = $category->addCategories($categoryName, $description);

        if ($added && $added > 0) {
            respond($isAjax, true, 'Category added.', null, 201);
        } else {
            respond($isAjax, false, 'Unable to add category.', null, 500);
        }
        break;

    case 'update_categories':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Invalid request method.'], 405);
        }

        $isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
                 strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

        $id = filter_input(INPUT_POST, 'CategoryID', FILTER_VALIDATE_INT);
        $categoryName = isset($_POST['CategoryName']) ? trim($_POST['CategoryName']) : null;
        $description  = isset($_POST['Description']) ? trim($_POST['Description']) : null;

        if (!$id || $id <= 0) {
            respond($isAjax, false, 'Invalid CategoryID.', null, 400);
        }

        $data = [];
        if ($categoryName !== null) $data['CategoryName'] = filter_var($categoryName, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
        if ($description !== null)  $data['Description']  = filter_var($description, FILTER_SANITIZE_FULL_SPECIAL_CHARS);

        if (empty($data)) {
            respond($isAjax, false, 'No fields to update.', null, 400);
        }

        $updated = $category->updateCategories($id, $data);
        if ($updated && $updated > 0) {
            respond($isAjax, true, 'Category updated.');
        } else {
            respond($isAjax, false, 'No changes made or update failed.', null, 400);
        }
        break;

    case 'delete_categories':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            sendJson(['success' => false, 'message' => 'Invalid request method.'], 405);
        }

        $isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) &&
                 strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';

        $id = filter_input(INPUT_POST, 'CategoryID', FILTER_VALIDATE_INT);
        if (!$id || $id <= 0) {
            respond($isAjax, false, 'Invalid CategoryID.', null, 400);
        }

        $deleted = $category->deleteCategories($id);
        if ($deleted && $deleted > 0) {
            respond($isAjax, true, 'Category deleted.');
        } else {
            respond($isAjax, false, 'Delete failed.', null, 500);
        }
        break;

    default:
        // For unknown actions, return JSON (avoid redirect loops)
        sendJson(['success' => false, 'message' => 'Invalid action specified.'], 400);
        break;
}
?>
