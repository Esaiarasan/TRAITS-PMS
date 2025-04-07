<?php
require __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTHandler {
    private $secret = '8a1f9b648be17f90127aa7f42c5ed7aa3f84e24561e9c5e49701422cf8b9a1f7'; // Replace with your actual secret

    public function encode($payload) {
        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function decode($token) {
        return JWT::decode($token, new Key($this->secret, 'HS256'));
    }
}
