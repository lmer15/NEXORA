<?php
session_start();
require '../config/db.php';
require '../Model/UserModel.php';

session_unset();
session_destroy();

setcookie('remember_me', '', time() - 3600, '/');
header('Location: ../View/access.php');
exit;
?>