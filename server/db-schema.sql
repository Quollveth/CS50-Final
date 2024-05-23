CREATE TABLE Users (
	id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    hash TEXT NOT NULL,
    last_token TEXT,
    email TEXT
);