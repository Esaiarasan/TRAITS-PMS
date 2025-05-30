 
<?php
class Database {
    private $host = 'localhost';
    private $dbname = 'traits_pms';
    private $username = 'root';
    private $password = 'mysql';
    private $conn;

    public function connect() {
        try {
            $this->conn = new PDO(
                "mysql:host=$this->host;dbname=$this->dbname",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $this->conn;
        } catch (PDOException $e) {
            echo "Connection failed: " . $e->getMessage();
            return null;
        }
    }
}

$db = new Database();
$conn = $db->connect();
