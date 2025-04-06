 
<?php
require 'vendor/autoload.php';
use Firebase\JWT\JWT;

class JWTHandler {
    private $secret = 'your_secret_key_here'; // Same as in Node.js

    public function encode($payload) {
        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function decode($token) {
        return JWT::decode($token, new \Firebase\JWT\Key($this->secret, 'HS256'));
    }
}
