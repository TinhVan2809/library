<?php
    class Data {
        public $conn;

        public function __construct()
        { 
            $iniPath = __DIR__ . "/connect.ini";
            if (!file_exists($iniPath)) {
                die("File connect.ini doesn't exist!");
            }


            $ini = parse_ini_file($iniPath);

            $requiredKey = ["servername", "dbname", "username", "password"];
            foreach($requiredKey as $K){
                if(!isset($ini[$K])) {
                    die("Missing key: $K in connect.ini file!");
                }
            }  

            $servername = $ini["servername"];
            $dbname = $ini["dbname"];
            $username = $ini["username"];
            $password = $ini["password"];

            $opt = array(
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8",
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
            PDO::ATTR_EMULATE_PREPARES => false
        );

        try{
            $this->conn = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password, $opt);
            
        } catch (PDOException $e) {
            die("Error! Can't connect to database: " . $e->getMessage());
        }
    }
}

        

?>